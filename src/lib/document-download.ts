/** Preserve signed URLs while requesting an attachment from Cloud storage. */
export function documentDownloadTarget(source: string) {
  const url = new URL(source);
  if (url.hostname === 'drive.google.com') {
    const id = url.pathname.match(/^\/file\/d\/([\w-]+)/)?.[1] ?? url.searchParams.get('id');
    if (id && /^[\w-]+$/.test(id)) {
      const download = new URL('https://drive.usercontent.google.com/download');
      download.searchParams.set('id', id);
      download.searchParams.set('export', 'download');
      const resourceKey = url.searchParams.get('resourcekey');
      if (resourceKey) download.searchParams.set('resourcekey', resourceKey);
      return { url: download.toString(), filename: 'documento', direct: true };
    }
  }
  const encodedName = url.pathname.split('/').pop() ?? '';
  let name = 'documento';
  try { name = decodeURIComponent(encodedName).replace(/^\d+-/, '') || name; } catch { /* Use the fallback for malformed filenames. */ }
  name = name.replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_');
  const direct = /\/storage\/v1\/object\/(?:sign|public)\//.test(url.pathname);
  if (direct) url.searchParams.set('download', name);
  return { url: url.toString(), filename: name, direct };
}

export function saveDocumentBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
