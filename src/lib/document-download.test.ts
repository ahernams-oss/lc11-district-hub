import { test } from 'node:test';
import assert from 'node:assert/strict';
import { documentDownloadTarget } from './document-download';

test('requests attachments while preserving signed storage access', () => {
  const target = documentDownloadTarget('https://storage.example/storage/v1/object/sign/site-images/documentos/123-estatuto.pdf?token=test-token');
  const url = new URL(target.url);
  assert.equal(url.searchParams.get('download'), 'estatuto.pdf');
  assert.equal(url.searchParams.get('token'), 'test-token');
  assert.equal(target.direct, true);
});
test('fetches external files instead of opening their URLs in a tab', () => {
  const target = documentDownloadTarget('https://example.org/estatuto.pdf');
  assert.equal(target.direct, false);
  assert.equal(target.filename, 'estatuto.pdf');
});
test('converts Google Drive viewers to file downloads', () => {
  const target = documentDownloadTarget('https://drive.google.com/file/d/file-id/view?usp=sharing');
  const url = new URL(target.url);
  assert.equal(url.hostname, 'drive.usercontent.google.com');
  assert.equal(url.searchParams.get('id'), 'file-id');
  assert.equal(url.searchParams.get('export'), 'download');
  assert.equal(target.direct, true);
});
