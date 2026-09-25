import Link from "next/link";
import { C } from "@/lib/tokens";
import { PetalOutline, WaveDivider } from "@/components/art/Shapes";

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div style={{
        fontFamily: "var(--sans)", fontSize: "0.65rem",
        letterSpacing: "0.13em", textTransform: "uppercase",
        color: "rgba(255,247,239,0.85)", marginBottom: "1.1rem",
      }}>{title}</div>
      {links.map(([label, to]) => (
        <Link key={label} href={to} style={{
          display: "block", fontFamily: "var(--sans)", fontSize: "0.86rem",
          color: "rgba(255,247,239,0.9)", textDecoration: "none", marginBottom: "0.55rem",
        }}>{label}</Link>
      ))}
    </div>
  );
}

export default function SiteFooter() {
  
  return (
    <footer>
      <WaveDivider from={C.paper} to={C.indigo} variant="dramatic" />
      <div style={{ backgroundColor: C.indigo, position: "relative", overflow: "hidden" }}>
        <PetalOutline color={C.coral} size={110}
          style={{ position: "absolute", bottom: "1.5rem", right: "1.5rem", opacity: 0.35 }} />
        <div aria-hidden style={{
          position: "absolute", top: "2.5rem", left: "2rem",
          width: "40px", height: "58px",
          borderRadius: "20px 20px 35% 35%",
          border: "1px solid rgba(255,247,239,0.12)", opacity: 0.5,
        }} />

        <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "4rem 1.5rem 3rem", position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gap: "2.5rem" }} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
            <div>
              <div style={{ fontFamily: "var(--serif)", fontSize: "1.4rem", color: C.canvas, marginBottom: "0.4rem" }}>VetMiMi</div>
              <div style={{ fontFamily: "var(--sans)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#e9bac8", marginBottom: "1.25rem" }}>Daw Mi · Art Therapist & Wellbeing Practitioner</div>
              <p style={{ fontFamily: "var(--sans)", fontSize: "0.84rem", color: "rgba(255,247,239,0.85)", lineHeight: 1.75, maxWidth: "280px" }}>
                A space for creativity, reflection and meaningful connection. Through art and thoughtful conversation, another way to explore what may be difficult to put into words.
              </p>
            </div>
            <FooterCol title="Explore" links={[
              ["About", "/about"],
              ["Services", "/services"],
              ["Art of Wellness", "/art-of-wellness"],
              ["Portfolio", "/portfolio"],
              ["Stories & Insights", "/stories"],
            ]} />
            <FooterCol title="Connect" links={[
              ["Book Appointment", "/book"],
              ["Contact", "/contact"],
              ["Facebook [To confirm]", "/contact"],
              ["Email [To confirm]", "/contact"],
            ]} />
            <FooterCol title="Information" links={[
              ["Privacy Policy", "/privacy"],
              ["Booking & Cancellation", "/booking-policy"],
              ["Disclaimer", "/disclaimer"],
            ]} />
          </div>

          <div style={{
            borderTop: "1px solid rgba(255,247,239,0.1)", marginTop: "3rem", paddingTop: "1.5rem",
            display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem",
          }}>
            <span style={{ fontFamily: "var(--sans)", fontSize: "0.75rem", color: "rgba(255,247,239,0.8)" }}>© 2025 VetMiMi. All rights reserved.</span>
            <span style={{ fontFamily: "var(--sans)", fontSize: "0.75rem", color: "rgba(255,247,239,0.8)" }}>Sydney, Australia · [Location to confirm]</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
