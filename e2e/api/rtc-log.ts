// TEMPORARY diagnostic for an intermittent video connection; removed
// before review. Records each peer connection's states and description
// steps, and the signalling message types, never SDP, addresses or tickets.
import type { Page, TestInfo } from "@playwright/test";

const watched: Page[] = [];

export async function recordCall(page: Page) {
  watched.push(page);
  await page.addInitScript(() => {
    const log: string[] = [];
    Object.assign(window, { __rtc: log });
    const start = performance.now();
    const note = (who: string, text: string) =>
      log.push(`${Math.round(performance.now() - start)}ms ${who} ${text}`);
    const setup = (sdp?: string | null) =>
      /a=setup:(\w+)/.exec(sdp ?? "")?.[1] ?? "-";
    const describe = (data: unknown) => {
      try {
        const m = JSON.parse(String(data));
        if (m.type === "peer-state") {
          return `peer-state c=${m.client} p=${m.practitioner} r=${m.room}`;
        }
        if (m.type === "offer" || m.type === "answer") {
          return `${m.type} setup=${setup(m.sdp)}`;
        }
        if (m.type === "ice") {
          return `ice ${/ typ (\w+)/.exec(m.candidate?.candidate ?? "")?.[1]}`;
        }
        return String(m.type);
      } catch {
        return "?";
      }
    };

    const NativePC = window.RTCPeerConnection;
    class LoggedPC extends NativePC {
      constructor(config?: RTCConfiguration) {
        super(config);
        const who = `pc${Math.random().toString(36).slice(2, 5)}`;
        note(who, "created");
        for (const name of [
          "signalingstatechange",
          "iceconnectionstatechange",
          "connectionstatechange",
          "icegatheringstatechange",
          "negotiationneeded",
        ]) {
          this.addEventListener(name, () =>
            note(
              who,
              `${name}: sig=${this.signalingState} ice=${this.iceConnectionState} conn=${this.connectionState} gather=${this.iceGatheringState}`,
            ),
          );
        }
        this.addEventListener("icecandidate", (event) =>
          note(who, `local candidate ${event.candidate?.type ?? "end"}`),
        );
        const setLocal = this.setLocalDescription.bind(this);
        const setRemote = this.setRemoteDescription.bind(this);
        this.setLocalDescription = async (
          description?: RTCLocalSessionDescriptionInit,
        ) => {
          note(
            who,
            `SLD(${description?.type ?? "implicit"}) in ${this.signalingState}`,
          );
          try {
            await setLocal(description);
            const local = this.localDescription;
            note(
              who,
              `SLD done: ${this.signalingState}, local ${local?.type} setup=${setup(local?.sdp)}`,
            );
          } catch (error) {
            note(who, `SLD failed: ${String(error).slice(0, 160)}`);
            throw error;
          }
        };
        this.setRemoteDescription = async (
          description: RTCSessionDescriptionInit,
        ) => {
          note(
            who,
            `SRD(${description.type} setup=${setup(description.sdp)}) in ${this.signalingState}`,
          );
          try {
            await setRemote(description);
            note(who, `SRD done: ${this.signalingState}`);
          } catch (error) {
            note(who, `SRD failed: ${String(error).slice(0, 160)}`);
            throw error;
          }
        };
      }
    }
    window.RTCPeerConnection = LoggedPC;

    const NativeWS = window.WebSocket;
    class LoggedWS extends NativeWS {
      constructor(url: string | URL, protocols?: string | string[]) {
        super(url, protocols);
        this.addEventListener("open", () => note("ws", "open"));
        this.addEventListener("close", (event) =>
          note("ws", `close ${event.code}`),
        );
        this.addEventListener("message", (event) =>
          note("ws", `< ${describe(event.data)}`),
        );
      }
      send(data: Parameters<WebSocket["send"]>[0]) {
        note("ws", `> ${describe(data)}`);
        super.send(data);
      }
    }
    window.WebSocket = LoggedWS;
  });
}

export async function printCalls(testInfo: TestInfo) {
  if (testInfo.status !== testInfo.expectedStatus) {
    for (const [i, page] of watched.entries()) {
      const log = await page
        .evaluate(() => (window as unknown as { __rtc?: string[] }).__rtc)
        .catch(() => ["(page closed)"]);
      console.log(
        `--- ${testInfo.title} retry ${testInfo.retry} repeat ${testInfo.repeatEachIndex} page ${i}\n${(log ?? []).join("\n")}`,
      );
    }
  }
  watched.length = 0;
}
