import { useEffect, useState } from "react";
import { generatePixQrCode, getPixCopyPaste } from "@/lib/pix";
import { Copy, Check, QrCode } from "lucide-react";

interface PixQrCodeProps {
  amountInCents?: number;
  title?: string;
}

export function PixQrCode({ amountInCents, title = "Pague com PIX" }: PixQrCodeProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    generatePixQrCode(amountInCents).then((url) => {
      if (!cancelled) setQrCode(url);
    });
    return () => { cancelled = true; };
  }, [amountInCents]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getPixCopyPaste(amountInCents));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center gap-2 text-gold">
        <QrCode className="h-5 w-5" />
        <h3 className="font-display text-lg font-bold">{title}</h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Escaneie o QR Code ou copie o código PIX para fazer a transferência.
      </p>

      <div className="mt-4 flex flex-col items-center justify-center">
        {qrCode ? (
          <img
            src={qrCode}
            alt="QR Code PIX"
            className="h-48 w-48 rounded-lg border border-border bg-white object-contain p-2"
          />
        ) : (
          <div className="h-48 w-48 animate-pulse rounded-lg bg-muted" />
        )}
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Código copiado!" : "Copiar código PIX"}
      </button>
    </div>
  );
}
