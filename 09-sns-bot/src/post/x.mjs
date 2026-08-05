// X（Twitter）API v2 への投稿クライアント。
// 認証: OAuth2.0 Bearer（Write権限が必要）。画像添付は OAuth1.0a が必要になるため、
// 未設定の場合は添付なしで投稿する（TODO: Phase 2で対応）。

// 投稿結果。posted=false のとき reason に理由が入る。
export async function postToX({ text, image }, cfg) {
  if (cfg.dryRun) {
    console.log(`[x] DRY-RUN: 投稿しません（BOT_DRY_RUN=true）`);
    return { posted: false, reason: 'dry-run' };
  }
  if (!cfg.x.bearerToken) {
    console.warn(`[x] X_API_BEARER_TOKEN 未設定のため X 投稿をスキップ`);
    return { posted: false, reason: 'no-token' };
  }

  const mediaId = image ? await uploadMedia(image, cfg) : null;
  const body = {
    text,
    ...(mediaId ? { media: { media_ids: [mediaId] } } : {}),
  };

  const res = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.x.bearerToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`[x] API error ${res.status}: ${JSON.stringify(json)}`);
    return { posted: false, reason: `api:${res.status}` };
  }
  console.log(`[x] 投稿成功 id=${json?.data?.id}`);
  return { posted: true, id: json?.data?.id };
}

// OAuth1.0a の署名が必要な media/upload は未実装。
// Phase 2 で x を追加する前に、accessToken/accessSecret による署名と 3step アップロードを実装すること。
async function uploadMedia(image, cfg) {
  if (!image) return null;
  if (!cfg.x.accessToken || !cfg.x.accessSecret) {
    console.warn(`[x] 画像添付は OAuth1.0a が必要（X_API_ACCESS_TOKEN / SECRET 未設定）。画像なしで投稿します。TODO: Phase 2で media/upload を実装`);
    return null;
  }
  throw new Error('media/upload (OAuth1.0a) は未実装。TODO を参照');
}
