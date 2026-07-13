export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(ellipse at 60% 10%, rgba(99,102,241,0.18) 0%, transparent 60%), radial-gradient(ellipse at 10% 80%, rgba(79,70,229,0.12) 0%, transparent 50%), var(--surface-0)",
        padding: "1.5rem",
      }}
    >
      {children}
    </div>
  );
}
