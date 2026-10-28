import { WaveDivider } from "@/components/art/Shapes";
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
    <div className="overflow-x-hidden bg-canvas">
      <FloatingCTA />
      <HeroSection />
      <WaveDivider
        from="var(--canvas)"
        to="var(--coral)"
        variant="gentle"
        flip
      />
      <PauseSection />
      <GallerySection />
      <WaveDivider from="var(--paper)" to="var(--canvas)" variant="gentle" />
      <AboutSection />
      <WaveDivider from="var(--canvas)" to="var(--paper)" variant="gentle" />
      <ServicesSection />
      <WaveDivider from="var(--paper)" to="var(--indigo)" variant="gentle" />
      <ArtOfWellnessSection />
      <WaveDivider from="var(--indigo)" to="#F0EEF5" variant="gentle" />
      <StoriesSection stories={stories} />
      <WaveDivider from="#F0EEF5" to="var(--paper)" variant="gentle" />
      <TestimonialsSection />
      <WaveDivider from="var(--paper)" to="var(--canvas)" variant="gentle" />
      <FaqSection />
      <PathsSection />
    </div>
  );
}
