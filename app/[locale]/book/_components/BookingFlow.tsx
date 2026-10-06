"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { requestAppointment, type SubmitOutcome } from "../actions";
import { BookingLayout } from "./BookingLayout";
import { ServiceStep, type ServiceProblem } from "./ServiceStep";
import { DateTimeStep, type TimeAlert } from "./DateTimeStep";
import { DetailsStep } from "./DetailsStep";
import { ReviewStep, type SendState } from "./ReviewStep";
import { ResultState } from "./ResultState";
import {
  EMPTY_DRAFT,
  clearDraft,
  loadDraft,
  saveDraft,
  type DetailsErrors,
  type Draft,
} from "./bookingDraft";
import type { Receipt, ServiceList } from "./booking";

type Step = 1 | 2 | 3 | 4;

// API field pointers ("/visitor/email") to the details step's fields.
const DETAILS_FIELDS: Record<string, "name" | "email" | "phone" | "note"> = {
  "visitor/name": "name",
  "visitor/email": "email",
  "visitor/phone": "phone",
  "visitor/note": "note",
};

function startingProblem(list: ServiceList | null, requested: string) {
  if (!list) return "loadFailed";
  if (!list.bookingEnabled) return "paused";
  const missing = requested && !list.items.some((s) => s.slug === requested);
  return missing || list.items.length === 0 ? "unavailable" : null;
}

export function BookingFlow({
  list,
  requested,
  formToken,
}: {
  list: ServiceList | null;
  requested: string;
  formToken: string;
}) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const items = list?.items ?? [];
  const timeZone = list?.timezone ?? "Australia/Sydney";
  const preselected = items.some((s) => s.slug === requested) ? requested : "";

  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState<Draft>({
    ...EMPTY_DRAFT,
    service: preselected,
  });
  const [problem, setProblem] = useState<ServiceProblem>(
    startingProblem(list, requested),
  );
  const [timeAlert, setTimeAlert] = useState<TimeAlert | null>(null);
  const [fieldErrors, setFieldErrors] = useState<DetailsErrors>({});
  const [send, setSend] = useState<SendState>({ status: "idle" });
  const [honeypot, setHoneypot] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const sending = useRef(false);
  const column = useRef<HTMLDivElement>(null);
  const shownOnce = useRef(false);

  // Answers survive a refresh in this tab (UX §7). Read after mount, so the
  // server's HTML and the first client render agree.
  useEffect(() => {
    const saved = loadDraft();
    if (!saved) return;
    const keep =
      (!requested || saved.service === requested) &&
      !!list?.items.some((s) => s.slug === saved.service);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a one-off restore from sessionStorage, which the server cannot read
    setDraft({
      ...saved,
      service: keep ? saved.service : preselected,
      slot: keep ? saved.slot : null,
    });
  }, [list, requested, preselected]);

  useEffect(() => {
    if (!receipt) saveDraft(draft);
  }, [draft, receipt]);

  // The result is client state: give it its own history entry, so Back
  // returns to an empty flow and never to a review that could send again.
  useEffect(() => {
    if (!receipt) return;
    window.history.pushState(null, "", window.location.href);
    const restart = () => {
      setReceipt(null);
      setDraft({ ...EMPTY_DRAFT, service: preselected });
      setStep(1);
    };
    window.addEventListener("popstate", restart);
    return () => window.removeEventListener("popstate", restart);
  }, [receipt, preselected]);

  const update = (patch: Partial<Draft>) =>
    setDraft((d) => ({ ...d, ...patch }));
  const service = items.find((s) => s.slug === draft.service);
  const format = draft.format || service?.formats[0] || "online";
  const shownStep = service ? step : 1;

  // A new step starts at its title, not halfway down the last one.
  useEffect(() => {
    if (shownOnce.current) column.current?.scrollIntoView({ block: "start" });
    shownOnce.current = true;
  }, [shownStep]);

  const selectService = (slug: string) => {
    if (slug === draft.service) return;
    if (draft.slot) setTimeAlert({ kind: "serviceChanged", alternatives: [] });
    update({ service: slug, slot: null, format: "", idempotencyKey: "" });
    setProblem(null);
  };

  const goToStep = (next: Step) => {
    if (next === 4 && !draft.idempotencyKey) {
      update({ idempotencyKey: crypto.randomUUID() });
    }
    if (next !== 4) setSend({ status: "idle" });
    setStep(next);
  };

  const route = (outcome: SubmitOutcome, retry: () => void) => {
    if (outcome.ok) {
      clearDraft();
      setReceipt(outcome.receipt);
      return;
    }
    const lostTime = { slot: null, idempotencyKey: "" };
    switch (outcome.code) {
      case "slot_unavailable":
      case "outside_booking_window":
        update(lostTime);
        setTimeAlert({
          kind:
            outcome.code === "slot_unavailable" ? "timeLost" : "outsideWindow",
          alternatives: outcome.alternatives,
        });
        return goToStep(2);
      case "service_not_bookable":
      case "booking_paused":
        update(lostTime);
        setProblem(
          outcome.code === "booking_paused" ? "paused" : "unavailable",
        );
        router.refresh();
        return goToStep(1);
      case "idempotency_key_reused":
        return retry();
      case "rate_limited":
        return setSend({
          status: "rateLimited",
          retryAfterSeconds: outcome.retryAfterSeconds,
        });
    }
    const fields = Object.entries(outcome.fieldErrors).flatMap(
      ([pointer]) => DETAILS_FIELDS[pointer.replace(/^\/+/, "")] ?? [],
    );
    if (outcome.code === "acknowledgement_required") {
      setFieldErrors({ privacyAck: "ack", policyAck: "ack" });
      return goToStep(3);
    }
    if (fields.length > 0) {
      setFieldErrors(Object.fromEntries(fields.map((f) => [f, f])));
      return goToStep(3);
    }
    setSend({ status: "failed" });
  };

  const submit = async (key = draft.idempotencyKey, retried = false) => {
    if (sending.current || !service || !draft.slot) return;
    sending.current = true;
    setSend({ status: "sending" });
    const outcome = await requestAppointment({
      request: {
        service: service.slug,
        startsAt: draft.slot.startsAt,
        format,
        locale,
        visitor: {
          name: draft.name.trim(),
          email: draft.email.trim(),
          phone: draft.phone.trim() || undefined,
          note: draft.note.trim() || undefined,
        },
        privacyAcknowledged: true,
        policyAcknowledged: true,
      },
      idempotencyKey: key,
      formToken,
      honeypot,
    }).catch(() => null);
    sending.current = false;
    if (!outcome) return setSend({ status: "failed" });
    // A reused key means the body changed since the last try (the visitor
    // edited after a failure): one fresh key, one more attempt.
    route(outcome, () => {
      if (retried) return setSend({ status: "failed" });
      const fresh = crypto.randomUUID();
      update({ idempotencyKey: fresh });
      void submit(fresh, true);
    });
  };

  if (receipt) return <ResultState receipt={receipt} />;

  return (
    <BookingLayout step={shownStep} columnRef={column}>
      {shownStep === 1 && (
        <ServiceStep
          list={list}
          selected={draft.service}
          problem={problem}
          onSelect={selectService}
          onRetry={() => router.refresh()}
          onNext={() => goToStep(2)}
        />
      )}
      {step === 2 && service && (
        <DateTimeStep
          service={service}
          timeZone={timeZone}
          slot={draft.slot}
          alert={timeAlert}
          onSelect={(slot) => {
            update({ slot });
            setTimeAlert((a) => (a?.kind === "serviceChanged" ? null : a));
          }}
          onBack={() => goToStep(1)}
          onNext={() => {
            setTimeAlert(null);
            goToStep(3);
          }}
        />
      )}
      {step === 3 && service && (
        <DetailsStep
          service={service}
          draft={{ ...draft, format }}
          serverErrors={fieldErrors}
          onChange={(patch) => {
            setFieldErrors({});
            update(patch);
          }}
          onBack={() => goToStep(2)}
          onNext={() => goToStep(4)}
        />
      )}
      {step === 4 && service && (
        <ReviewStep
          service={service}
          timeZone={timeZone}
          bookingMode={list?.bookingMode ?? "request_approval"}
          draft={{ ...draft, format }}
          send={send}
          honeypot={honeypot}
          onHoneypot={setHoneypot}
          onSubmit={() => void submit()}
          onBack={() => goToStep(3)}
          goToStep={goToStep}
        />
      )}
    </BookingLayout>
  );
}
