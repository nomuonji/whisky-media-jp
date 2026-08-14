import { buildOAuthHeader } from './src/oauth1.mjs';

const cred = {
  consumerKey: 'fwCmLGGoZpH7DxjZpHyNnpSeV',
  consumerSecret: 'zNU8zwTuu4aY7IpV20fFGhRatLUFyikOqGfC3MDfpbAkGPpAKM',
  accessToken: '1698462113121931264-koJPGL5xqj6it4YYI0DzH7NZQ8y2FQ',
  accessTokenSecret: 'Nb4uFYvPfQcfWB1AWwlRQ9FbwLwXixnkVDC4TotgVQPvw',
};

const ip = await (await fetch('https://api.ipify.org?format=json')).json();
console.log('=== Runner IP:', ip.ip, '===');

const url = 'https://api.twitter.com/2/tweets';
const text = 'diag test from GH Actions - ' + Date.now();
const headers = { Authorization: buildOAuthHeader(cred, 'POST', url), 'Content-Type': 'application/json' };
const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ text }) });
const json = await res.json().catch(() => ({}));
console.log('POST /2/tweets -> ' + res.status);
console.log('  x-access-level:', res.headers.get('x-access-level'));
console.log('  x-rate-limit-remaining:', res.headers.get('x-rate-limit-remaining'));
console.log('  body:', JSON.stringify(json));

if (res.ok && json.data?.id) {
  const delUrl = `https://api.twitter.com/2/tweets/${json.data.id}`;
  const delRes = await fetch(delUrl, { method: 'DELETE', headers: { Authorization: buildOAuthHeader(cred, 'DELETE', delUrl) } });
  console.log('DELETE /2/tweets -> ' + delRes.status, await delRes.json().catch(() => ({})));
}
