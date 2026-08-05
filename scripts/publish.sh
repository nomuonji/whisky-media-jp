#!/bin/bash
# Whisky Data JP - 記事公開スクリプト
# 使い方: bash scripts/publish.sh
# AIがMarkdownを content/blog/ に生成した後に実行する

set -e

SITE_DIR="$(cd "$(dirname "$0")/../site" && pwd)"

echo "=== Whisky Data JP: 記事をビルド中 ==="

cd "$SITE_DIR"

# 依存関係インストール（初回のみ）
if [ ! -d "node_modules" ]; then
  echo "📦 依存パッケージをインストール中..."
  npm install
fi

# ビルド
echo "🔨 サイトをビルド中..."
npm run build

# Git自動コミット
if git diff --quiet && git diff --cached --quiet; then
  echo "📝 変更なし"
else
  echo "📝 変更をコミット中..."
  git add -A
  git commit -m "新規記事公開: $(date '+%Y-%m-%d')" --no-gpg-sign
fi

# プッシュ（Cloudflare Pagesが自動デプロイ）
echo "🚀 デプロイ中..."
git push origin main

echo "✅ 完了！数分後に https://whisky-data.jp に反映されます"
