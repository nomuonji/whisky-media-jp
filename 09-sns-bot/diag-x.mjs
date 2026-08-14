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
  'A-実文面(4tag+emoji+2行)': 'スコッチ・バーボンだけじゃない——世界のウイスキー4地域をデータで比較\n台湾・インド・オーストラリアの注目ウイスキーを味の8軸で比較。カバラン、アムルット、スターワードなど、世界を代表するワールドウイスキーの個性を解説。👇\nhttps://whisky-jp.antonbase.com/2026-08-06-world-whisky/\n\n#ウイスキー #Whisky #ワールドウイスキー #ウイスキー好きと繋がりたい',
  'B-絵文字なし': 'スコッチ・バーボンだけじゃない——世界のウイスキー4地域をデータで比較\n台湾・インド・オーストラリアの注目ウイスキーを味の8軸で比較。カバラン、アムルット、スターワードなど、世界を代表するワールドウイスキーの個性を解説。\nhttps://whisky-jp.antonbase.com/2026-08-06-world-whisky/\n\n#ウイスキー #Whisky #ワールドウイスキー #ウイスキー好きと繋がりたい',
  'C-ハッシュタグ3個': 'スコッチ・バーボンだけじゃない——世界のウイスキー4地域をデータで比較\n台湾・インド・オーストラリアの注目ウイスキーを味の8軸で比較。カバラン、アムルット、スターワードなど、世界を代表するワールドウイスキーの個性を解説。👇\nhttps://whisky-jp.antonbase.com/2026-08-06-world-whisky/\n\n#ウイスキー #Whisky #ワールドウイスキー',
  'D-1行文+4tag': 'スコッチ・バーボンだけじゃない。世界のウイスキー4地域をデータで比較👇\nhttps://whisky-jp.antonbase.com/2026-08-06-world-whisky/\n\n#ウイスキー #Whisky #ワールドウイスキー #ウイスキー好きと繋がりたい',
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
  await new Promise((r) => setTimeout(r, 1500));
}
