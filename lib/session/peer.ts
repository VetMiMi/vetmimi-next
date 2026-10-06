import { sdpFingerprint, type SignalMessage } from "./messages";

type PeerOptions = {
  iceServers: RTCIceServer[];
  // The client is polite, the practitioner impolite (ADR-007), so offer
  // glare always resolves the same way without a tie-break.
  polite: boolean;
  stream: MediaStream;
  send: (message: SignalMessage) => void;
  onRemote: (stream: MediaStream) => void;
  onState: (state: RTCPeerConnectionState) => void;
};

// One RTCPeerConnection with "perfect negotiation" (the W3C pattern):
// either side may offer at any time, and a collision is settled by the
// impolite side ignoring the other's offer while the polite side rolls
// its own back.
export class PeerLink {
  readonly pc: RTCPeerConnection;
  private makingOffer = false;
  private ignoreOffer = false;
  private readonly options: PeerOptions;

  constructor(options: PeerOptions) {
    this.options = options;
    const { iceServers, stream, send, onRemote, onState } = options;
    const pc = new RTCPeerConnection({
      iceServers,
      bundlePolicy: "max-bundle",
    });
    this.pc = pc;
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.onnegotiationneeded = async () => {
      try {
        this.makingOffer = true;
        await pc.setLocalDescription();
        if (pc.localDescription) {
          send({ type: "offer", sdp: pc.localDescription.sdp });
        }
      } catch {
        // The next negotiationneeded or ICE restart tries again.
      } finally {
        this.makingOffer = false;
      }
    };
    pc.onicecandidate = ({ candidate }) => {
      if (!candidate?.candidate) return;
      send({
        type: "ice",
        candidate: {
          candidate: candidate.candidate,
          sdpMid: candidate.sdpMid ?? undefined,
          sdpMLineIndex: candidate.sdpMLineIndex ?? undefined,
        },
      });
    };
    pc.ontrack = ({ track, streams }) => {
      onRemote(streams[0] ?? new MediaStream([track]));
    };
    pc.onconnectionstatechange = () => onState(pc.connectionState);
  }

  // An offer from a different DTLS certificate comes from a new peer
  // connection on the other side, which this one cannot renegotiate with.
  isFromNewPeer(message: SignalMessage): boolean {
    if (message.type !== "offer") return false;
    const current = this.pc.remoteDescription?.sdp;
    if (!current) return false;
    return sdpFingerprint(current) !== sdpFingerprint(message.sdp);
  }

  async receive(message: SignalMessage) {
    const { pc } = this;
    if (message.type === "ice") {
      try {
        await pc.addIceCandidate(message.candidate);
      } catch {
        // A candidate for an offer this side ignored, or an old one.
      }
      return;
    }
    const collision =
      message.type === "offer" &&
      (this.makingOffer || pc.signalingState !== "stable");
    this.ignoreOffer = !this.options.polite && collision;
    if (this.ignoreOffer) return;
    try {
      await pc.setRemoteDescription({ type: message.type, sdp: message.sdp });
      if (message.type === "offer") {
        await pc.setLocalDescription();
        if (pc.localDescription) {
          this.options.send({ type: "answer", sdp: pc.localDescription.sdp });
        }
      }
    } catch {
      // A description that no longer applies; the connection state and the
      // ICE restart that follows recover.
    }
  }

  restartIce() {
    if (this.pc.signalingState !== "closed") this.pc.restartIce();
  }

  setIceServers(iceServers: RTCIceServer[]) {
    this.pc.setConfiguration({ iceServers, bundlePolicy: "max-bundle" });
  }

  // Caps the camera's send rate on a weak link (null lifts the cap), so
  // the audio keeps the bandwidth.
  async capVideo(maxBitrate: number | null) {
    const sender = this.pc.getSenders().find((s) => s.track?.kind === "video");
    if (!sender) return;
    const parameters = sender.getParameters();
    const [encoding] = parameters.encodings ?? [];
    if (!encoding) return;
    if (maxBitrate === null) delete encoding.maxBitrate;
    else encoding.maxBitrate = maxBitrate;
    await sender.setParameters(parameters).catch(() => {});
  }

  close() {
    const { pc } = this;
    pc.onnegotiationneeded = pc.onicecandidate = null;
    pc.ontrack = pc.onconnectionstatechange = null;
    pc.close();
  }
}
