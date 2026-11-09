import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { video } from './content/video.ts';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');

test('index.html is findable: search terms in the title, text outside JavaScript and a VideoObject of this lab video', () => {
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  assert.match(title, /fundo do rio Amazonas/);
  assert.match(title, /Hamza/);
  const root = html.match(/<div id="root">([\s\S]*?)<\/div>/)?.[1] ?? '';
  assert.ok(root.replace(/<[^>]+>/g, '').trim().length > 400, 'indexable text inside #root');
  const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(json, 'JSON-LD present');
  const data = JSON.parse(json!);
  assert.equal(data['@type'], 'VideoObject');
  assert.equal(data.name, video.title);
  assert.equal(data.embedUrl, `https://www.youtube.com/embed/${video.id}`);
  assert.ok(data.uploadDate && data.thumbnailUrl?.length && data.description);
  const [m, s] = video.duration.split(':').map(Number);
  assert.equal(data.duration, `PT${m}M${s}S`);
});

test('no text in the stylesheet is set below 11 px', () => {
  const sizes = [...css.matchAll(/font(?:-size)?:\s*(?:[\d]+\s+)?(\d+(?:\.\d+)?)px/g)].map(m => Number(m[1]));
  assert.ok(sizes.length > 50);
  for (const size of sizes) assert.ok(size >= 11, `fonte de ${size}px`);
});
