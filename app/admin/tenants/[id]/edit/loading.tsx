export default function Loading() {
  return (
    <div style={{ maxWidth: "600px" }}>
      <div style={skel("12rem", "1.75rem", "0")} />
      <div style={skel("18rem", "0.85rem", "0.4rem")} />
      <div style={{ ...card, marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {[...Array(5)].map((_, i) => (
          <div key={i}>
            <div style={skel("7rem", "0.8rem", "0")} />
            <div style={{ ...skel("100%", "2.5rem", "0.4rem"), width: "100%" }} />
          </div>
        ))}
        <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem" }}>
          <div style={{ ...skel("100%", "2.75rem", "0"), flex: 1 }} />
          <div style={{ ...skel("100%", "2.75rem", "0"), flex: 2 }} />
        </div>
      </div>
      <style>{pulse}</style>
    </div>
  );
}

const card: React.CSSProperties = {
  background: "#161b27", border: "1px solid #263044",
  borderRadius: "0.75rem", padding: "2rem",
};

function skel(width: string, height: string, marginTop: string): React.CSSProperties {
  return {
    width, height, marginTop, display: "block", borderRadius: "0.4rem",
    background: "linear-gradient(90deg, #1e2535 25%, #263044 50%, #1e2535 75%)",
    backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
  };
}

const pulse = `@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`;
