import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { Audio, Easing, staticFile } from "remotion";
import { Admin } from "./scenes/Admin";
import { Booking } from "./scenes/Booking";
import { EndCard } from "./scenes/EndCard";
import { Languages } from "./scenes/Languages";
import { Race } from "./scenes/Race";
import { Title } from "./scenes/Title";
import { UnderTheHood } from "./scenes/UnderTheHood";
import { color } from "./theme";
import { brush } from "./transitions/brush";

// Put a track in public/ and name it here, then drop --muted from the render script.
const music: string | null = null;

const scene = { title: 150, languages: 210, booking: 570, race: 330, admin: 390, hood: 390, end: 180 };
const brushFrames = 32;
const slideFrames = 22;

export const introFrames =
  Object.values(scene).reduce((total, frames) => total + frames, 0) - 3 * brushFrames - 3 * slideFrames;

function brushCut(tone: string) {
  return {
    presentation: brush(tone),
    timing: linearTiming({ durationInFrames: brushFrames, easing: Easing.bezier(0.45, 0, 0.55, 1) }),
  };
}

function slideCut(direction: "from-right" | "from-bottom") {
  return {
    presentation: slide({ direction }),
    timing: linearTiming({ durationInFrames: slideFrames, easing: Easing.bezier(0.25, 0.6, 0.25, 1) }),
  };
}

export function Intro() {
  return (
    <>
      {music && <Audio src={staticFile(music)} volume={0.8} />}
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={scene.title}>
          <Title />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition {...brushCut(color.aqua)} />
        <TransitionSeries.Sequence durationInFrames={scene.languages}>
          <Languages />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition {...slideCut("from-right")} />
        <TransitionSeries.Sequence durationInFrames={scene.booking}>
          <Booking />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition {...brushCut(color.butter)} />
        <TransitionSeries.Sequence durationInFrames={scene.race}>
          <Race />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition {...slideCut("from-right")} />
        <TransitionSeries.Sequence durationInFrames={scene.admin}>
          <Admin />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition {...slideCut("from-bottom")} />
        <TransitionSeries.Sequence durationInFrames={scene.hood}>
          <UnderTheHood />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition {...brushCut(color.coral)} />
        <TransitionSeries.Sequence durationInFrames={scene.end}>
          <EndCard />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </>
  );
}
