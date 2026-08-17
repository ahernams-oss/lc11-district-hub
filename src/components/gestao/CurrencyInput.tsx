import { useState, useRef, useEffect } from "react";

type CurrencyInputProps = {
  value: number; // value in cents
  onChange: (cents: number) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
};

function formatBRL(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function parseBRL(str: string): number {
  // Remove everything except digits
  const digits = str.replace(/\D/g, "");
  return parseInt(digits, 10) || 0;
}

export function CurrencyInput({
  value,
  onChange,
  label,
  placeholder = "R$ 0,00",
  disabled,
  required,
  className = "",
}: CurrencyInputProps) {
  const [display, setDisplay] = useState(value ? formatBRL(value) : "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value === 0 && display === "") return;
    setDisplay(value ? formatBRL(value) : "");
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const cents = parseBRL(raw);
    setDisplay(cents ? formatBRL(cents) : "");
    onChange(cents);
  }

  return (
    <div className={className}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </label>
      )}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
      />
    </div>
  );
}

export { formatBRL };
