"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/admin/Button";
import { usePracticeFormat } from "@/components/booking/practiceFormat";
import { Btn } from "@/components/ui/Button";
import { CardActions, SessionCard } from "@/components/session/SessionCard";
import { SessionStage } from "@/components/session/SessionStage";
import {
  useLocalMedia,
  useTrackToggle,
} from "@/components/session/useLocalMedia";
import type { PublicSession } from "@/lib/api/session";
import { isTerminal } from "@/lib/session/machine";
import { useSession } from "@/lib/session/useSession";
import { DeviceCheck } from "./DeviceCheck";

const isLive = (stream: MediaStream) =>
  stream.getTracks().every((track) => track.readyState === "live");

// The Ready state (#80–#82): the device check, then the stage, then the
// screen for however the call ended. Local tracks belong to this component
// so "Try again" can skip the device check while they are still live.
export function SessionClient({
  token,
  session: s,
}: {
  token: string;
  session: PublicSession;
}) {
  const t = useTranslations("session");
  const format = usePracticeFormat(s.timezone);
  const router = useRouter();
  const { local, request, stop } = useLocalMedia();
  const stream = local.status === "ready" ? local.stream : null;
  const mic = useTrackToggle(stream, "audio");
  const camera = useTrackToggle(stream, "video");
  const call = useSession(token);
  const [onStage, setOnStage] = useState(false);
  const { phase, refresh } = call.state;

  // The room ended or the link stopped working: read the state again, so
  // the page says "ended" or "expired" from the API, not from a guess.
  useEffect(() => {
    if (refresh) router.refresh();
  }, [refresh, router]);

  // Tracks stop as soon as the person leaves or the room ends.
  useEffect(() => {
    if (phase === "left" || phase === "ended") stop();
  }, [phase, stop]);

  const join = (media: MediaStream) => {
    setOnStage(true);
    call.join(media);
  };
  // Back to the call: straight in if the camera is still on, else via
  // the device check.
  const again = () => {
    if (stream && isLive(stream)) join(stream);
    else setOnStage(false);
  };

  if (onStage && stream && !isTerminal(phase)) {
    return (
      <SessionStage
        phase={phase}
        otherLeft={call.state.otherLeft}
        weak={call.state.weak}
        local={stream}
        remote={call.remote}
        mic={mic}
        camera={camera}
        onLeave={call.leave}
      />
    );
  }

  if (onStage && isTerminal(phase)) {
    const end = {
      left: {
        title: t("left.title"),
        text: t("left.text"),
        action: t("left.rejoin"),
      },
      replaced: {
        title: t("replaced.title"),
        text: t("replaced.text"),
        action: t("replaced.rejoin"),
      },
      failed: {
        title: call.state.connectedOnce
          ? t("failed.reconnectTitle")
          : t("failed.connectTitle"),
        text: t("failed.text"),
        action: t("failed.retry"),
      },
      ended: { title: t("ended.title"), text: t("ended.text"), action: null },
    }[phase as "left" | "replaced" | "failed" | "ended"];
    return (
      <SessionCard title={end.title}>
        <p role="status">{end.text}</p>
        <CardActions>
          {end.action && (
            <Button size="page" onClick={again}>
              {end.action}
            </Button>
          )}
          <Btn variant="secondary" href="/contact">
            {t("contact")}
          </Btn>
        </CardActions>
      </SessionCard>
    );
  }

  return (
    <SessionCard title={t("check.title")} wide>
      <p className="-mt-2 text-[0.95rem] font-medium text-muted">
        {t("check.when", {
          service: s.service.name,
          dateTime: format.dateTime(s.startsAt),
          zone: format.zone(s.startsAt),
        })}
      </p>
      <p>{t("check.intro")}</p>
      <DeviceCheck
        local={local}
        request={request}
        mic={mic}
        camera={camera}
        onJoin={join}
      />
      <p className="text-[0.92rem] text-muted">{t("privacy")}</p>
    </SessionCard>
  );
}
