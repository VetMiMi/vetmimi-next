"use client";
import { useEffect, useRef } from "react";

// A live microphone level, so a person can see they are heard before they
// join. Drawn straight onto the bar each frame, without React renders.
export function MicLevel({
  stream,
  on,
  label,
}: {
  stream: MediaStream;
  on: boolean;
  label: string;
}) {
  const meter = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = fill.current;
    if (!on || !bar || stream.getAudioTracks().length === 0) return;
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    context.createMediaStreamSource(stream).connect(analyser);
    const samples = new Uint8Array(analyser.fftSize);
    // Safari starts audio suspended until the page is touched.
    const resume = () => void context.resume();
    resume();
    window.addEventListener("pointerdown", resume, { once: true });

    let frame = requestAnimationFrame(function draw() {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (const sample of samples) sum += ((sample - 128) / 128) ** 2;
      const level = Math.min(1, Math.sqrt(sum / samples.length) * 4);
      bar.style.transform = `scaleX(${level})`;
      meter.current?.setAttribute(
        "aria-valuenow",
        String(Math.round(level * 100)),
      );
      frame = requestAnimationFrame(draw);
    });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointerdown", resume);
      bar.style.transform = "scaleX(0)";
      void context.close();
    };
  }, [stream, on]);

  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0 text-[0.88rem] text-muted">{label}</span>
      <div
        ref={meter}
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        className="h-2 flex-1 overflow-hidden rounded-pill bg-paper"
      >
        <div
          ref={fill}
          className="h-full origin-left scale-x-0 rounded-pill bg-olive"
        />
      </div>
    </div>
  );
}
