export default function Loading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Status card skeleton */}
      <div style={card}>
        <div style={skel("10rem", "1rem", "0")} />
        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ flex: 1, minWidth: "120px" }}>
              <div style={skel("5rem", "0.75rem", "0")} />
              <div style={skel("8rem", "1.5rem", "0.4rem")} />
            </div>
          ))}
        </div>
      </div>
      {/* Form skeleton */}
      <div style={card}>
        <div style={skel("8rem", "0.85rem", "0")} />
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.25rem" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div style={skel("6rem", "0.75rem", "0")} />
              <div style={{ ...skel("100%", "2.5rem", "0.4rem"), width: "100%" }} />
            </div>
          ))}
          <div style={{ ...skel("100%", "3rem", "0.5rem"), width: "100%", borderRadius: "0.5rem" }} />
        </div>
      </div>
      <style>{pulse}</style>
    </div>
  );
}

const card: React.CSSProperties = {
  background: "#161b27", border: "1px solid #263044",
  borderRadius: "0.75rem", padding: "1.5rem",
};

function skel(width: string, height: string, marginTop: string): React.CSSProperties {
  return {
    width, height, marginTop, display: "block", borderRadius: "0.4rem",
    background: "linear-gradient(90deg, #1e2535 25%, #263044 50%, #1e2535 75%)",
    backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
  };
}

const pulse = `@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`;
