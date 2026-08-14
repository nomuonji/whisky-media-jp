import { buildOAuthHeader } from './src/oauth1.mjs';

const cred = {
  consumerKey: 'fwCmLGGoZpH7DxjZpHyNnpSeV',
  consumerSecret: 'zNU8zwTuu4aY7IpV20fFGhRatLUFyikOqGfC3MDfpbAkGPpAKM',
  accessToken: '1698462113121931264-koJPGL5xqj6it4YYI0DzH7NZQ8y2FQ',
  accessTokenSecret: 'Nb4uFYvPfQcfWB1AWwlRQ9FbwLwXixnkVDC4TotgVQPvw',
};

const url = 'https://api.twitter.com/2/tweets';
const ip = await (await fetch('https://api.ipify.org?format=json')).json();
console.log('=== Runner IP:', ip.ip, '===');

const tests = {
  '1-日本語のみ': 'スコッチ・バーボンだけじゃない世界のウイスキーを4地域でデータ比較しました',
  '2-日本語+URL': 'スコッチ・バーボンだけじゃない。世界のウイスキー4地域をデータで比較 https://whisky-jp.antonbase.com/2026-08-06-world-whisky/',
  '3-日本語+URL+絵文字': 'スコッチ・バーボンだけじゃない。世界のウイスキー4地域をデータで比較👇\nhttps://whisky-jp.antonbase.com/2026-08-06-world-whisky/',
  '4-日本語+URL+ハッシュタグ': 'スコッチ・バーボンだけじゃない。世界のウイスキー4地域をデータで比較\nhttps://whisky-jp.antonbase.com/2026-08-06-world-whisky/\n\n#ウイスキー #Whisky #ワールドウイスキー',
  '5-英語+絵文字+URL': 'World whisky in 4 regions, compared with data👇\nhttps://whisky-jp.antonbase.com/2026-08-06-world-whisky/',
};

for (const [name, text] of Object.entries(tests)) {
  const headers = { Authorization: buildOAuthHeader(cred, 'POST', url), 'Content-Type': 'application/json' };
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ text }) });
  const json = await res.json().catch(() => ({}));
  console.log(`--- ${name}: ${res.status}`);
  console.log('  BODY:', JSON.stringify(json));
  if (res.ok && json.data?.id) {
    const delUrl = `https://api.twitter.com/2/tweets/${json.data.id}`;
    await fetch(delUrl, { method: 'DELETE', headers: { Authorization: buildOAuthHeader(cred, 'DELETE', delUrl) } });
    console.log('  DELETED:', json.data.id);
  }
  await new Promise((r) => setTimeout(r, 1200));
}
