export default function Loading() {
  return (
    <div style={{ padding: "0", maxWidth: "1400px" }}>
      {/* Header skeleton */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={skel("14rem", "1.75rem", "0.5rem")} />
        <div style={skel("8rem", "0.85rem", "0")} />
      </div>

      {/* Stat cards skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={card}>
            <div style={skel("3rem", "2.2rem", "0.4rem")} />
            <div style={skel("7rem", "0.8rem", "0")} />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div style={card}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ display: "flex", gap: "1rem", padding: "1rem 0", borderBottom: "1px solid var(--surface-2)" }}>
            <div style={skel("10rem", "1rem", "0")} />
            <div style={skel("4rem", "1rem", "0")} />
            <div style={skel("6rem", "1rem", "0")} />
            <div style={skel("5rem", "1rem", "0")} />
            <div style={skel("4rem", "1rem", "0")} />
          </div>
        ))}
      </div>
      <style>{pulse}</style>
    </div>
  );
}

const card: React.CSSProperties = {
  background: "var(--surface-1)",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
  padding: "1.25rem 1.5rem",
};

function skel(width: string, height: string, marginTop: string): React.CSSProperties {
  return {
    width,
    height,
    marginTop,
    borderRadius: "0.4rem",
    background: "linear-gradient(90deg, var(--surface-2) 25%, var(--border) 50%, var(--surface-2) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
  };
}

const pulse = `
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;
