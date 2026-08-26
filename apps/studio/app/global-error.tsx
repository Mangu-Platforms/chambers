"use client";

/** Root error boundary — replaces the whole document, so it carries its own html/body. */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#F5F5F7",
          color: "#1D1D1F",
          fontFamily:
            '"SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>
            Chambers Studio hit a wall.
          </h1>
          <p style={{ fontSize: 15, color: "#6E6E73", marginTop: 8 }}>
            Your saved documents are untouched.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 24,
              height: 44,
              padding: "0 24px",
              borderRadius: 999,
              border: 0,
              background: "#FF4D00",
              color: "#fff",
              fontSize: 15,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
