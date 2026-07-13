export default function Loading() {
  return (
    <div style={{ maxWidth: "900px" }}>
      {/* Back link */}
      <div style={skel("8rem", "0.85rem", "0")} />
      <div style={{ display: "flex", gap: "1.5rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
        {/* Left: info card */}
        <div style={{ ...card, flex: "0 0 260px" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ ...skel("5rem", "5rem", "0"), borderRadius: "50%" }} />
            <div style={skel("8rem", "1.2rem", "0")} />
            <div style={skel("5rem", "0.85rem", "0")} />
          </div>
          <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={skel("5rem", "0.8rem", "0")} />
                <div style={skel("4rem", "0.8rem", "0")} />
              </div>
            ))}
          </div>
        </div>
        {/* Right: ledger table */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={card}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ display: "flex", gap: "1rem", padding: "0.9rem 0", borderBottom: "1px solid var(--surface-2)" }}>
                <div style={skel("6rem", "1rem", "0")} />
                <div style={skel("5rem", "1rem", "0")} />
                <div style={skel("5rem", "1rem", "0")} />
                <div style={skel("4.5rem", "1.5rem", "0")} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{pulse}</style>
    </div>
  );
}

const card: React.CSSProperties = {
  background: "var(--surface-1)", border: "1px solid var(--border)",
  borderRadius: "0.75rem", padding: "1.5rem",
};

function skel(width: string, height: string, marginTop: string): React.CSSProperties {
  return {
    width, height, marginTop, flexShrink: 0, borderRadius: "0.4rem",
    background: "linear-gradient(90deg, var(--surface-2) 25%, var(--border) 50%, var(--surface-2) 75%)",
    backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
  };
}

const pulse = `@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`;
