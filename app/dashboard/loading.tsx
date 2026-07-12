export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full gap-4">
      <div className="animate-spin rounded-full h-10 width-10 border-t-2 border-b-2 border-indigo-600"></div>
      <p className="text-sm text-muted-foreground animate-pulse">Loading dashboard...</p>
      
      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .min-h-\[50vh\] { min-height: 50vh; }
        .w-full { width: 100%; }
        .gap-4 { gap: 1rem; }
        .rounded-full { border-radius: 9999px; }
        .h-10 { height: 2.5rem; }
        .width-10 { width: 2.5rem; }
        .border-t-2 { border-top-width: 2px; }
        .border-b-2 { border-bottom-width: 2px; }
        .border-indigo-600 { border-color: #4f46e5; }
        .text-sm { font-size: 0.875rem; }
        .text-muted-foreground { color: #64748b; }
      `}</style>
    </div>
  );
}
