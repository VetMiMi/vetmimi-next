"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { Button } from "@/components/admin/Button";
import { Card } from "@/components/admin/Card";
import { DeviceCheck } from "@/components/session/DeviceCheck";
import { SessionStage } from "@/components/session/SessionStage";
import {
  useLocalMedia,
  useTrackToggle,
} from "@/components/session/useLocalMedia";
import { isTerminal } from "@/lib/session/machine";
import { useSession } from "@/lib/session/useSession";
import { startVideo } from "../../videoActions";
import { EndSessionDialog } from "./EndSessionDialog";
import { MarkCompletedDialog } from "./MarkCompletedDialog";
import { checkText, stageText } from "./practitionerText";

const isLive = (stream: MediaStream) =>
  stream.getTracks().every((track) => track.readyState === "live");

// Daw Mi's side of the call (#83): the same device check, `useSession` and
// stage as the visitor's page, with a practitioner ticket (so she is the
// impolite peer), End session in place of Leave, and the completed prompt
// once the room has ended. `closedText` is what the page says when the
// session cannot start now (before the window, after it, or ended).
export function PractitionerSession({
  id,
  version,
  visitor,
  when,
  closedText,
  canComplete,
}: {
  id: string;
  version: number;
  visitor: string;
  when: string;
  closedText: string | null;
  canComplete: boolean;
}) {
  const { local, request, stop } = useLocalMedia();
  const stream = local.status === "ready" ? local.stream : null;
  const mic = useTrackToggle(stream, "audio");
  const camera = useTrackToggle(stream, "video");
  const getTicket = useCallback(() => startVideo(id), [id]);
  const call = useSession(getTicket);
  const [onStage, setOnStage] = useState(false);
  const [ending, setEnding] = useState(false);
  const [endedHere, setEndedHere] = useState(false);
  const { phase } = call.state;
  const detail = `/admin/appointments/${id}`;
  const over = endedHere || phase === "ended";

  useEffect(() => {
    if (over) stop();
  }, [over, stop]);

  const join = (media: MediaStream) => {
    setOnStage(true);
    call.join(media);
  };
  const again = () => {
    if (stream && isLive(stream)) join(stream);
    else setOnStage(false);
  };

  if (onStage && stream && !isTerminal(phase) && !endedHere) {
    return (
      <SessionStage
        text={stageText(visitor)}
        corner={
          <Link
            href={detail}
            className="inline-flex min-h-11 items-center gap-1.5 text-[0.88rem] font-semibold underline underline-offset-4"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            Back to appointment
          </Link>
        }
        phase={phase}
        otherLeft={call.state.otherLeft}
        weak={call.state.weak}
        local={stream}
        remote={call.remote}
        mic={mic}
        camera={camera}
        onLeave={() => setEnding(true)}
      >
        <EndSessionDialog
          id={id}
          open={ending}
          onClose={() => setEnding(false)}
          onEnded={() => {
            setEnding(false);
            setEndedHere(true);
            call.leave();
          }}
        />
      </SessionStage>
    );
  }

  if (onStage && over) {
    return (
      <Notes
        title={
          endedHere
            ? "The session has ended."
            : "The session window has closed."
        }
        text="Both of you have been disconnected. The appointment stays Confirmed until you mark it."
        detail={detail}
      >
        {canComplete && <MarkCompletedDialog id={id} version={version} open />}
      </Notes>
    );
  }

  if (onStage && (phase === "replaced" || phase === "failed")) {
    return (
      <Notes
        title={
          phase === "replaced"
            ? "This tab has been disconnected."
            : "The call could not connect."
        }
        text={
          phase === "replaced"
            ? "You joined this session from another tab or device."
            : "Check the internet connection and try again. The session stays open."
        }
        detail={detail}
      >
        <Button size="page" onClick={again}>
          {phase === "replaced" ? "Use this tab instead" : "Try again"}
        </Button>
      </Notes>
    );
  }

  if (closedText) {
    return <Notes title={closedText} detail={detail} />;
  }

  return (
    <Card as="section" className="flex max-w-[720px] flex-col gap-5">
      <div>
        <h2 className="text-[1.35rem]">Check your camera and microphone</h2>
        <p className="mt-2 text-[0.95rem] text-muted">
          With {visitor} · {when}
        </p>
      </div>
      <p className="text-[0.95rem] leading-[1.7]">
        {visitor} joins from the link in their email and sees you as soon as
        they connect. Nothing is recorded.
      </p>
      <DeviceCheck
        text={checkText}
        local={local}
        request={request}
        mic={mic}
        camera={camera}
        onJoin={join}
      />
    </Card>
  );
}

// Every state that is not the call: one card, what happened, the way on.
function Notes({
  title,
  text,
  detail,
  children,
}: {
  title: string;
  text?: string;
  detail: string;
  children?: React.ReactNode;
}) {
  return (
    <Card as="section" className="flex max-w-[720px] flex-col gap-4">
      <h2 role="status" className="text-[1.35rem]">
        {title}
      </h2>
      {text && (
        <p className="text-[0.95rem] leading-[1.7] text-muted">{text}</p>
      )}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1">
        {children}
        <Button href={detail} variant="secondary">
          Back to appointment
        </Button>
      </div>
    </Card>
  );
}
