import { useEffect, useState } from "react";
import { useActivePopup } from "@/lib/popups";
import { X } from "lucide-react";

export function SitePopup() {
  const { data: popup } = useActivePopup();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!popup) return;
    const key = `popup-seen-${popup.id}-${popup.updated_at}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(key)) return;
    setOpen(true);
    if (typeof window !== "undefined") sessionStorage.setItem(key, "1");
    if (popup.display_seconds > 0) {
      const t = setTimeout(() => setOpen(false), popup.display_seconds * 1000);
      return () => clearTimeout(t);
    }
  }, [popup]);

  if (!popup || !open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-xl bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute right-2 top-2 z-10 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
        {popup.image_url && (
          <img src={popup.image_url} alt={popup.title} className="w-full object-cover" />
        )}
        <div className="p-5">
          <h2 className="font-display text-xl font-bold">{popup.title}</h2>
          {popup.content && (
            <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
              {popup.content}
            </p>
          )}
          {popup.link_url && (
            <a
              href={popup.link_url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {popup.link_label || "Saiba mais"}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
