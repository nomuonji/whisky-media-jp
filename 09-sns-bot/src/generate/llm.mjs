// 任意・Phase 4: LLMによる投稿文のバリエーション生成。
// OpenAI互換エンドポイント（Chat Completions）にデータを渡して文を生成する。
// LLM_API_KEY 未設定・失敗時は null を返し、呼び出し側がテンプレ生成にフォールバックする。

export async function generateWithLlm(candidate, cfg) {
  const { apiKey, baseUrl, model } = cfg.llm;
  if (!apiKey || !baseUrl || !model) return null;

  const source = summarize(candidate);
  const system = [
    'あなたは日本のウイスキーメディアのX投稿文ライターです。',
    '制約: 280文字以内。ハッシュタグは自分で付けず、与えられたものだけを使う。',
    'アフィリエイトリンクを書かない。誇張表現をしない。',
    '文体は「データで読むウイスキー」の編集部として自然で読みやすい日本語で。',
  ].join(' ');

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.8,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: source },
        ],
      }),
    });
    if (!res.ok) {
      console.warn(`[llm] HTTP ${res.status} (${res.statusText}) → fallback to template`);
      return null;
    }
    const json = await res.json();
    const text = json?.choices?.[0]?.message?.content?.trim();
    return text || null;
  } catch (err) {
    console.warn(`[llm] ${err.message} → fallback to template`);
    return null;
  }
}

// LLMに渡す入力データ（サイトの情報だけで組み立てる）。
function summarize(candidate) {
  const c = candidate.data;
  if (candidate.kind === 'article') {
    return [
      '記事タイトル: ' + c.title,
      '要約: ' + (c.excerpt || ''),
      'カテゴリ: ' + (c.category || ''),
      'タグ: ' + (c.tags || []).join(', '),
      '記事URL: ' + c.slug,
      '投稿パターン: 記事告知。キャッチコピー＋補足＋URLの順で1投稿にまとめて。',
    ].join('\n');
  }
  if (candidate.kind === 'whisky') {
    return [
      '銘柄: ' + c.name + '（' + (c.nameEn || '') + '）',
      'タイプ: ' + (c.type || ''),
      'Whiskybase評価: ' + (c.rating ?? '?') + '/100',
      '市場価格: ' + (c.priceYen ?? '?') + '円',
      'テイスティング: ' + (c.notes || ''),
      'フレーバー: ' + JSON.stringify(c.flavor || {}),
      '投稿パターン: データ豆知識。評価・価格・特徴を短くまとめて。',
    ].join('\n');
  }
  return JSON.stringify(c, null, 2);
}
