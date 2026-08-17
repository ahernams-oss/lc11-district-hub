import { type ReactNode } from "react";
import { X } from "lucide-react";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
};

export function Drawer({ open, onClose, title, children, width = "w-[480px]" }: DrawerProps) {
  if (!open) return null;
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full ${width} flex-col border-l border-white/8 bg-[#0d1321] shadow-2xl`}
      >
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
          <h2 className="font-display text-lg font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </aside>
    </>
  );
}

// ─── Small form helpers ───────────────────────────────────────────

type FieldProps = {
  label: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
};

export function Field({ label, required, children, hint }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
export function FormInput({ className = "", ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 ${className}`}
    />
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode };
export function FormSelect({ className = "", children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border border-white/10 bg-[#0d1321] px-3 py-2.5 text-sm text-white outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 ${className}`}
    >
      {children}
    </select>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
export function FormTextarea({ className = "", ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      rows={3}
      className={`w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 ${className}`}
    />
  );
}

export function FormRow({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

type FormActionsProps = {
  onCancel: () => void;
  loading?: boolean;
  label?: string;
};
export function FormActions({ onCancel, loading, label = "Salvar" }: FormActionsProps) {
  return (
    <div className="flex items-center justify-end gap-3 border-t border-white/8 pt-5 mt-6">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "Salvando..." : label}
      </button>
    </div>
  );
}
