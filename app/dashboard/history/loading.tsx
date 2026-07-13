export default function Loading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={skel("10rem", "1.5rem", "0")} />
      <div style={card}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ display: "flex", gap: "1rem", padding: "0.9rem 0", borderBottom: "1px solid var(--surface-2)", alignItems: "center" }}>
            <div style={skel("6rem", "1rem", "0")} />
            <div style={skel("5rem", "1rem", "0")} />
            <div style={skel("5rem", "1rem", "0")} />
            <div style={skel("4.5rem", "1.5rem", "0")} />
          </div>
        ))}
      </div>
      <style>{pulse}</style>
    </div>
  );
}

const card: React.CSSProperties = {
  background: "var(--surface-1)", border: "1px solid var(--border)",
  borderRadius: "0.75rem", padding: "0 1.5rem",
};

function skel(width: string, height: string, marginTop: string): React.CSSProperties {
  return {
    width, height, marginTop, display: "block", flexShrink: 0, borderRadius: "0.4rem",
    background: "linear-gradient(90deg, var(--surface-2) 25%, var(--border) 50%, var(--surface-2) 75%)",
    backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
  };
}

const pulse = `@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`;
