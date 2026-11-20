import { useEffect, useRef, useState } from "react";
import { Music, Pause, Play } from "lucide-react";
import { useActiveMusic } from "@/lib/site-music";

export function SiteMusicPlayer() {
  const { data: music } = useActiveMusic();
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const a = ref.current;
    if (!a || !music) return;
    a.volume = Math.min(1, Math.max(0, music.volume / 100));
    a.play().then(() => setPlaying(true)).catch(() => {
      // Navegador bloqueou autoplay: toca na primeira interação do visitante.
      const start = () => a.play().then(() => setPlaying(true)).catch(() => {});
      window.addEventListener("pointerdown", start, { once: true });
      window.addEventListener("keydown", start, { once: true });
    });
    const ms = new Date(music.end_at).getTime() - Date.now();
    const t = window.setTimeout(() => { a.pause(); setPlaying(false); }, Math.max(0, Math.min(ms, 2_147_000_000)));
    return () => { window.clearTimeout(t); a.pause(); };
  }, [music]);

  if (!music) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full border bg-card px-3 py-2 text-sm shadow-lg">
      <audio ref={ref} src={music.file_url} loop={music.loop} onEnded={() => setPlaying(false)} />
      <Music className="h-4 w-4 text-primary" />
      <span className="max-w-[160px] truncate">{music.title}</span>
      <button
        type="button"
        aria-label={playing ? "Pausar música" : "Tocar música"}
        onClick={() => {
          const a = ref.current;
          if (!a) return;
          if (playing) { a.pause(); setPlaying(false); } else a.play().then(() => setPlaying(true)).catch(() => {});
        }}
        className="rounded-full bg-primary p-1.5 text-primary-foreground"
      >
        {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
