import { buildOAuthHeader } from './src/oauth1.mjs';
import { readFile } from 'node:fs/promises';

const cred = {
  consumerKey: 'fwCmLGGoZpH7DxjZpHyNnpSeV',
  consumerSecret: 'zNU8zwTuu4aY7IpV20fFGhRatLUFyikOqGfC3MDfpbAkGPpAKM',
  accessToken: '1698462113121931264-koJPGL5xqj6it4YYI0DzH7NZQ8y2FQ',
  accessTokenSecret: 'Nb4uFYvPfQcfWB1AWwlRQ9FbwLwXixnkVDC4TotgVQPvw',
};

const TWEET_URL = 'https://api.twitter.com/2/tweets';
const MEDIA_UPLOAD_URL = 'https://upload.twitter.com/1.1/media/upload.json';
const ip = await (await fetch('https://api.ipify.org?format=json')).json();
console.log('=== Runner IP:', ip.ip, '===');

const buffer = await readFile('public/ogp/article-2026-08-06-world-whisky.png');
console.log('image bytes:', buffer.length);

const authHeader = buildOAuthHeader(cred, 'POST', MEDIA_UPLOAD_URL);
const boundary = '----diag' + Date.now();
const body = Buffer.concat([
  Buffer.from('--' + boundary + '\r\nContent-Disposition: form-data; name="media"; filename="img.png"\r\nContent-Type: application/octet-stream\r\n\r\n'),
  buffer,
  Buffer.from('\r\n--' + boundary + '--\r\n'),
]);
const up = await fetch(MEDIA_UPLOAD_URL, {
  method: 'POST',
  headers: { Authorization: authHeader, 'Content-Type': 'multipart/form-data; boundary=' + boundary },
  body,
});
const upJson = await up.json().catch(() => ({}));
console.log('media upload ->', up.status, JSON.stringify(upJson).slice(0, 200));

if (upJson.media_id_string) {
  const text = '山崎12年 vs 白州12年——データで決着、あなたに合う1本';
  const res = await fetch(TWEET_URL, {
    method: 'POST',
    headers: { Authorization: buildOAuthHeader(cred, 'POST', TWEET_URL), 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, media: { media_ids: [upJson.media_id_string] } }),
  });
  const json = await res.json().catch(() => ({}));
  console.log('tweet with image ->', res.status, '| x-access-level:', res.headers.get('x-access-level'));
  console.log('  body:', JSON.stringify(json));
  if (res.ok && json.data?.id) {
    const delUrl = `https://api.twitter.com/2/tweets/${json.data.id}`;
    const del = await fetch(delUrl, { method: 'DELETE', headers: { Authorization: buildOAuthHeader(cred, 'DELETE', delUrl) } });
    console.log('  DELETED:', del.status);
  }
}
