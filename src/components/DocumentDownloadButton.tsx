import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { documentDownloadTarget, saveDocumentBlob } from '@/lib/document-download';
import type { DocumentItem } from '@/lib/documents';

export function DocumentDownloadButton({ document, beforeDownload }: {
  document: DocumentItem;
  beforeDownload?: () => boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [prepared, setPrepared] = useState<{ blob: Blob; filename: string } | null>(null);
  const source = document.file_url || document.external_url;
  const target = (() => { try { return source ? documentDownloadTarget(source) : null; } catch { return null; } })();

  async function download() {
    if (!target || beforeDownload?.() === false) return;
    setError('');
    if (prepared) {
      saveDocumentBlob(prepared.blob, prepared.filename);
      setPrepared(null);
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(target.url);
      if (!response.ok) throw new Error('Não foi possível baixar este documento. Tente novamente.');
      const blob = await response.blob();
      if (!blob.size || blob.type.includes('text/html')) throw new Error('Este link não aponta para um arquivo disponível para download.');
      const filename = target.filename.includes('.') ? target.filename : `${document.title.replace(/[\\/:*?"<>|]/g, '_')}${blob.type.includes('pdf') ? '.pdf' : ''}`;
      if (matchMedia('(pointer: coarse)').matches) setPrepared({ blob, filename });
      else saveDocumentBlob(blob, filename);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível baixar o documento.');
    } finally { setBusy(false); }
  }

  return <div className="flex shrink-0 flex-col items-start gap-2">
    {target?.direct ? <Button asChild>
      <a href={target.url} download={target.filename} onClick={(event) => {
        if (beforeDownload?.() === false) event.preventDefault();
      }}><Download /> Baixar</a>
    </Button> : <Button disabled={busy || !target} onClick={() => void download()}>
      {busy ? <Loader2 className="animate-spin" /> : <Download />}
      {busy ? 'Preparando...' : prepared ? 'Baixar arquivo' : 'Baixar'}
    </Button>}
    {error && <p role="alert" className="max-w-xs text-sm text-destructive">{error}</p>}
  </div>;
}
