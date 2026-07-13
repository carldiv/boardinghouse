export default function Loading() {
  return (
    <div style={{ maxWidth: "1000px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <div style={skel("8rem", "1.75rem", "0")} />
          <div style={skel("10rem", "0.85rem", "0.4rem")} />
        </div>
        <div style={skel("8rem", "2.5rem", "0")} />
      </div>
      <div style={card}>
        <div style={{ display: "flex", gap: "1rem", padding: "0.75rem 0", borderBottom: "1px solid var(--border)" }}>
          {["8rem","4rem","6rem","4rem","5rem","5rem"].map((w, i) => (
            <div key={i} style={skel(w, "0.75rem", "0")} />
          ))}
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ display: "flex", gap: "1rem", padding: "1rem 0", borderBottom: "1px solid var(--surface-2)", alignItems: "center" }}>
            <div style={skel("8rem", "1rem", "0")} />
            <div style={skel("4rem", "1rem", "0")} />
            <div style={skel("5rem", "1rem", "0")} />
            <div style={skel("3rem", "1rem", "0")} />
            <div style={skel("4.5rem", "1.5rem", "0")} />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <div style={skel("4rem", "2rem", "0")} />
              <div style={skel("3.5rem", "2rem", "0")} />
            </div>
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
    width, height, marginTop, flexShrink: 0, borderRadius: "0.4rem",
    background: "linear-gradient(90deg, var(--surface-2) 25%, var(--border) 50%, var(--surface-2) 75%)",
    backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite",
  };
}

const pulse = `@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`;
