import type { components } from "@/lib/api/schema";
import { closeOutcome, type CallEvent } from "./machine";
import { CLOSE, type ServerMessage } from "./messages";
import { PeerLink } from "./peer";
import { backoffDelay } from "./reconnect";
import { openSignaling, type Signaling } from "./signaling";
import {
  STATS_INTERVAL_MS,
  isWeakWindow,
  nextWeak,
  readSample,
  type StatsSample,
  type WeakState,
} from "./stats";

type RoomTicket = components["schemas"]["RoomTicket"];

export type TicketResult =
  { ok: true; ticket: RoomTicket } | { ok: false; code: string };

// Refusals that end the attempt for good: the link or room is gone, the
// session is not open, or this account may not join (lib/session/ticket.ts).
const FINAL_REFUSALS = new Set(["not_found", "not_ready", "forbidden"]);

const WEAK_VIDEO_BPS = 300_000;
// A "disconnected" peer connection often recovers by itself; restart ICE
// only if it has not after this long.
const ICE_GRACE_MS = 4_000;

// The visitor's fresh ticket from this app's route handler (tickets live 5
// minutes, so every connection attempt asks for a new one).
export async function fetchTicket(token: string): Promise<TicketResult> {
  try {
    const response = await fetch(`/api/session/${token}/ticket`, {
      method: "POST",
      cache: "no-store",
    });
    const body = await response.json();
    return response.ok
      ? { ok: true, ticket: body }
      : { ok: false, code: body.code };
  } catch {
    return { ok: false, code: "unavailable" };
  }
}

// One person's side of a video session (#81, #82, #83): the ticket, the
// signalling socket, the peer connection, reconnecting with backoff and the
// weak-link check. It reports facts as CallEvents; lib/session/machine.ts
// turns them into what the stage shows. Nothing here writes to the console:
// tickets, SDP and candidates must never reach a log.
export class SessionCall {
  private ws: Signaling | null = null;
  private link: PeerLink | null = null;
  private polite = true;
  private iceServers: RTCIceServer[] = [];
  private attempt = 0;
  private ticketRejects = 0;
  private retryTimer?: ReturnType<typeof setTimeout>;
  private iceTimer?: ReturnType<typeof setTimeout>;
  private statsTimer?: ReturnType<typeof setInterval>;
  private lastSample: StatsSample | null = null;
  private weak: WeakState = { weak: false, calmSince: null };
  private stopped = false;

  private readonly getTicket: () => Promise<TicketResult>;
  private readonly stream: MediaStream;
  private readonly dispatch: (event: CallEvent) => void;
  private readonly onRemote: (stream: MediaStream | null) => void;

  constructor(options: {
    getTicket: () => Promise<TicketResult>;
    stream: MediaStream;
    dispatch: (event: CallEvent) => void;
    onRemote: (stream: MediaStream | null) => void;
  }) {
    this.getTicket = options.getTicket;
    this.stream = options.stream;
    this.dispatch = options.dispatch;
    this.onRemote = options.onRemote;
  }

  start() {
    this.statsTimer = setInterval(
      () => void this.checkStats(),
      STATS_INTERVAL_MS,
    );
    void this.connect();
  }

  // Leave on purpose: tell the other side, then close everything.
  leave() {
    this.ws?.send({ type: "leave" });
    this.stop();
  }

  stop() {
    this.stopped = true;
    clearTimeout(this.retryTimer);
    clearTimeout(this.iceTimer);
    clearInterval(this.statsTimer);
    this.ws?.close();
    this.ws = null;
    this.link?.close();
    this.link = null;
  }

  private async connect() {
    if (this.stopped) return;
    const result = await this.getTicket();
    if (this.stopped) return;
    if (!result.ok) {
      // No retry; the page reads the state again to say why.
      if (FINAL_REFUSALS.has(result.code)) {
        this.dispatch({ type: "ticket-refused" });
        this.stop();
      } else {
        this.retryLater();
      }
      return;
    }
    const { ticket } = result;
    this.polite = ticket.role === "client";
    this.iceServers = ticket.iceServers;
    this.link?.setIceServers(ticket.iceServers);
    this.ws = openSignaling(ticket.websocketUrl, ticket.ticket, {
      open: () => this.dispatch({ type: "ws-open" }),
      message: (message) => this.onMessage(message),
      close: (code) => this.onClose(code),
    });
  }

  private retryLater() {
    clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(
      () => void this.connect(),
      backoffDelay(this.attempt++),
    );
  }

  private onClose(code: number) {
    this.ws = null;
    const outcome = closeOutcome(code, this.ticketRejects);
    this.ticketRejects =
      code === CLOSE.ticketInvalid ? this.ticketRejects + 1 : 0;
    this.dispatch({ type: "ws-close", code });
    if (outcome === "retry-now") void this.connect();
    else if (outcome === "backoff") this.retryLater();
    else this.stop();
  }

  private onMessage(message: ServerMessage) {
    switch (message.type) {
      case "peer-state": {
        this.attempt = 0;
        this.ticketRejects = 0;
        const other = this.polite ? message.practitioner : message.client;
        if (other === "disconnected") this.dropLink();
        else if (!this.link) this.newLink();
        else if (this.link.pc.connectionState !== "connected") {
          // Back after our own reconnect: find a new path for the media.
          this.link.restartIce();
        }
        this.dispatch({ type: "peer-state", room: message.room, other });
        return;
      }
      case "leave":
        this.dropLink();
        this.dispatch({ type: "other-left" });
        return;
      default:
        if (this.link?.isFromNewPeer(message)) this.dropLink();
        if (!this.link && message.type === "offer") this.newLink();
        void this.link?.receive(message);
    }
  }

  private newLink() {
    const link = new PeerLink({
      iceServers: this.iceServers,
      polite: this.polite,
      stream: this.stream,
      send: (message) => this.ws?.send(message),
      onRemote: this.onRemote,
      onState: (state) => {
        this.dispatch({ type: "pc", state });
        clearTimeout(this.iceTimer);
        if (state === "failed") link.restartIce();
        if (state === "disconnected") {
          this.iceTimer = setTimeout(() => link.restartIce(), ICE_GRACE_MS);
        }
      },
    });
    this.link = link;
    this.dispatch({ type: "pc", state: "new" });
  }

  private dropLink() {
    if (!this.link) return;
    clearTimeout(this.iceTimer);
    this.link.close();
    this.link = null;
    this.lastSample = null;
    this.onRemote(null);
    this.dispatch({ type: "pc", state: "none" });
    this.setWeak({ weak: false, calmSince: null });
  }

  private async checkStats() {
    const link = this.link;
    if (!link) return;
    const sample = readSample(await link.pc.getStats());
    if (link !== this.link) return;
    const weakNow =
      link.pc.connectionState === "disconnected" ||
      isWeakWindow(this.lastSample, sample);
    this.lastSample = sample;
    this.setWeak(nextWeak(this.weak, weakNow, Date.now()));
  }

  private setWeak(next: WeakState) {
    const changed = next.weak !== this.weak.weak;
    this.weak = next;
    if (!changed) return;
    this.dispatch({ type: "weak", weak: next.weak });
    void this.link?.capVideo(next.weak ? WEAK_VIDEO_BPS : null);
  }
}
