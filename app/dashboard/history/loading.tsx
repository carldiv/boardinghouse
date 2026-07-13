export default function Loading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={skel("10rem", "1.5rem", "0")} />
      <div style={card}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ display: "flex", gap: "1rem", padding: "0.9rem 0", borderBottom: "1px solid #1e2535", alignItems: "center" }}>
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
  background: "#161b27", border: "1px solid #263044",
  borderRadius: "0.75rem", padding: "0 1.5rem",
};

function skel(width: string, height: string, marginTop: string): React.CSSProperties {
  return {
    width, height, marginTop, display: "block", flexShrink: 0, borderRadius: "0.4rem",
    background: "linear-gradient(90deg, #1e2535 25%, #263044 50%, #1e2535 75%)",
    backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
  };
}

const pulse = `@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`;
