export default function Loading() {
  return (
    <div style={{ maxWidth: "1100px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={skel("10rem", "1.75rem", "0")} />
        <div style={skel("5rem", "0.85rem", "0.4rem")} />
      </div>
      {/* Tab bar skeleton */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {[...Array(4)].map((_, i) => <div key={i} style={skel("7rem", "2rem", "0")} />)}
      </div>
      {/* Table skeleton */}
      <div style={card}>
        <div style={{ display: "flex", gap: "1rem", padding: "0.75rem 0", borderBottom: "1px solid #263044" }}>
          {["3rem","8rem","6rem","6rem","6rem","6rem","5rem","5rem","4rem"].map((w, i) => (
            <div key={i} style={skel(w, "0.75rem", "0")} />
          ))}
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ display: "flex", gap: "1rem", padding: "1.1rem 0", borderBottom: "1px solid #1e2535", alignItems: "center" }}>
            <div style={skel("3rem", "3.5rem", "0")} />
            <div style={skel("8rem", "1rem", "0")} />
            <div style={skel("6rem", "1rem", "0")} />
            <div style={skel("5rem", "1rem", "0")} />
            <div style={skel("5rem", "1rem", "0")} />
            <div style={skel("6rem", "1rem", "0")} />
            <div style={skel("4.5rem", "1.5rem", "0")} />
            <div style={skel("5rem", "1rem", "0")} />
            <div style={skel("4rem", "2rem", "0")} />
          </div>
        ))}
      </div>
      <style>{pulse}</style>
    </div>
  );
}

const card: React.CSSProperties = {
  background: "#161b27",
  border: "1px solid #263044",
  borderRadius: "0.75rem",
  padding: "0 1.5rem",
  overflowX: "auto",
};

function skel(width: string, height: string, marginTop: string): React.CSSProperties {
  return {
    width, height, marginTop, flexShrink: 0,
    borderRadius: "0.4rem",
    background: "linear-gradient(90deg, #1e2535 25%, #263044 50%, #1e2535 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
  };
}

const pulse = `@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`;
