// X（Twitter）API v2 への投稿クライアント。
// 認証: OAuth 1.0a（署名は oauth1.mjs）。dekio_g アカウントの認証情報は
// Consumer Key/Secret + Access Token/Secret の4点セットで、Bearer トークンではない。
//
// 画像添付: v1.1 media/upload に multipart でアップロードして media_id_string を取得
// （署名対象パラメータに body は含めない。book-discovery プロジェクトの
// bot/publish/x.ts と同一ロジック）。

import { buildOAuthHeader } from '../oauth1.mjs';

const TWEET_URL = 'https://api.twitter.com/2/tweets';
const MEDIA_UPLOAD_URL = 'https://upload.twitter.com/1.1/media/upload.json';

export async function postToX({ text, image }, cfg, credentials) {
  if (cfg.dryRun) {
    console.log(`[x] DRY-RUN: 投稿しません（BOT_DRY_RUN=true）`);
    return { posted: false, reason: 'dry-run' };
  }
  if (!credentials?.consumerKey || !credentials?.accessToken) {
    console.warn(`[x] 認証情報未設定のため X 投稿をスキップ`);
    return { posted: false, reason: 'no-token' };
  }

  try {
    const mediaId = image ? await uploadMedia(image, credentials) : null;
    const body = { text, ...(mediaId ? { media: { media_ids: [mediaId] } } : {}) };

    const authHeader = buildOAuthHeader(credentials, 'POST', TWEET_URL);
    const res = await fetch(TWEET_URL, {
      method: 'POST',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.data) {
      console.error(`[x] API error ${res.status}: ${JSON.stringify(json)}`);
      return { posted: false, reason: `api:${res.status}` };
    }
    console.log(`[x] 投稿成功 id=${json.data.id}`);
    return { posted: true, id: json.data.id };
  } catch (err) {
    console.error(`[x] 投稿失敗: ${err.message}`);
    return { posted: false, reason: 'error' };
  }
}

async function uploadMedia(image, credentials) {
  const imageRes = await fetch(image);
  if (!imageRes.ok) throw new Error(`画像の取得に失敗しました: ${imageRes.status} ${image}`);
  const buffer = Buffer.from(await imageRes.arrayBuffer());

  // OAuth1 の署名対象にmultipart bodyは含めない（book-discovery/bot/publish/x.ts と同じ）
  const authHeader = buildOAuthHeader(credentials, 'POST', MEDIA_UPLOAD_URL);

  const boundary = `----whiskybot${Date.now()}`;
  const body = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="media"; filename="image.jpg"\r\n` +
        `Content-Type: application/octet-stream\r\n\r\n`
    ),
    buffer,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  const res = await fetch(MEDIA_UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.media_id_string) {
    throw new Error(`メディアアップロード失敗: ${JSON.stringify(json.errors ?? json)}`);
  }
  return json.media_id_string;
}
