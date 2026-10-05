import Link from "next/link";

export default function AdminNotFound() {
  return (
    <main
      style={{
        width: "min(560px, calc(100% - 40px))",
        marginInline: "auto",
        paddingBlock: "clamp(64px, 12vw, 120px)",
      }}
    >
      <p
        style={{
          color: "#88435b",
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          margin: "0 0 12px",
        }}
      >
        Page not found
      </p>
      <h1
        style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", margin: "0 0 16px" }}
      >
        This page does not exist.
      </h1>
      <p style={{ color: "#625d64", fontSize: "0.95rem", margin: "0 0 28px" }}>
        The address may be mistyped, or the page may have moved.
      </p>
      <Link href="/admin" className="ed-button">
        Go to admin
      </Link>
    </main>
  );
}
