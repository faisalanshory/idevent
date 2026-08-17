"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (title: string, description?: string, type?: ToastType) => void;
  toasts: ToastItem[];
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback(
    (title: string, description?: string, type: ToastType = "info") => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, description, type }]);

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        dismiss(id);
      }, 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, toasts, dismiss }}>
      {children}
      {/* Toast Overlay Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border p-4 shadow-md bg-card transition-all duration-300 animate-in slide-in-from-bottom-5 ${
              t.type === "success"
                ? "border-emerald-200 bg-emerald-50/50 text-emerald-950 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-300"
                : t.type === "error"
                ? "border-red-200 bg-red-50/50 text-red-950 dark:bg-red-950/20 dark:border-red-800 dark:text-red-300"
                : "border-border text-card-foreground"
            }`}
          >
            {t.type === "success" && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />}
            {t.type === "error" && <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />}
            {t.type === "info" && <Info className="h-5 w-5 shrink-0 text-blue-600" />}

            <div className="flex-1">
              <p className="font-semibold text-sm leading-tight">{t.title}</p>
              {t.description && <p className="mt-1 text-xs opacity-90 leading-normal">{t.description}</p>}
            </div>

            <button
              onClick={() => dismiss(t.id)}
              className="text-muted-foreground hover:text-foreground cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
