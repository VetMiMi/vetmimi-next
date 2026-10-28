import { WaveDivider } from "@/components/art/Shapes";
import { C } from "@/lib/tokens";
import type { StoryItem } from "@/lib/stories";
import { FloatingCTA } from "./home/FloatingCTA";
import { HeroSection } from "./home/HeroSection";
import { PauseSection } from "./home/PauseSection";
import { GallerySection } from "./home/GallerySection";
import { AboutSection } from "./home/AboutSection";
import { ServicesSection } from "./home/ServicesSection";
import { ArtOfWellnessSection } from "./home/ArtOfWellnessSection";
import { StoriesSection } from "./home/StoriesSection";
import { TestimonialsSection } from "./home/TestimonialsSection";
import { FaqSection } from "./home/FaqSection";
import { PathsSection } from "./home/PathsSection";

// `stories` is the Stories page's list: published articles first.
export function HomePage({ stories }: { stories: StoryItem[] }) {
  return (
    <div style={{ background: C.canvas, overflowX: "hidden" }}>
      <FloatingCTA />
      <HeroSection />
      <WaveDivider from={C.canvas} to={C.coral} variant="gentle" flip />
      <PauseSection />
      <GallerySection />
      <WaveDivider from={C.paper} to={C.canvas} variant="gentle" />
      <AboutSection />
      <WaveDivider from={C.canvas} to={C.paper} variant="gentle" />
      <ServicesSection />
      <WaveDivider from={C.paper} to={C.indigo} variant="gentle" />
      <ArtOfWellnessSection />
      <WaveDivider from={C.indigo} to="#F0EEF5" variant="gentle" />
      <StoriesSection stories={stories} />
      <WaveDivider from="#F0EEF5" to={C.paper} variant="gentle" />
      <TestimonialsSection />
      <WaveDivider from={C.paper} to={C.canvas} variant="gentle" />
      <FaqSection />
      <PathsSection />
    </div>
  );
}
