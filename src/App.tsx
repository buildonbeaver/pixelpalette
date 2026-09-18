import { useCallback, useState } from "react";
import Showcase, { type Toast } from "./components/showcase";
import Toolbar from "./components/toolbar";
import { ThemeProvider } from "./lib/theme";

let toastId = 0;

function Shell() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((title: string, message: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev.slice(-2), { id, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  return (
    <>
      <Showcase notify={notify} />
      <Toolbar />
      <div className="fixed top-4 right-4 z-[60] space-y-2 w-[min(92vw,340px)]" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="pp-toast t-surface border t-border p-3.5 flex gap-2.5"
            style={{ borderRadius: "calc(var(--radius) * 0.66)", boxShadow: "var(--shadow)" }}>
            <span className="mt-0.5 t-primary-text">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </span>
            <div className="text-sm">
              <div className="font-semibold">{t.title}</div>
              <div className="t-muted text-[13px]">{t.message}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Shell />
    </ThemeProvider>
  );
}
