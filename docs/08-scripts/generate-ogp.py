# -*- coding: utf-8 -*-
"""
銘柄ページのOGP画像を生成する。

  python docs/08-scripts/generate-ogp.py

src/content/whiskies/*.json を読み、public/ogp/*.png を書き出す。
銘柄データを更新したら再実行すること（ビルドには含まれない）。

フォントについて:
  既定ではWindows同梱のメイリオ／游ゴシックを使う。
  出力はラスタ画像なのでフォントファイルの再配布には当たらないが、
  配布物のライセンスを明確にしたい場合は Noto Sans JP (SIL OFL) を
  fonts/ に置き、FONT_CANDIDATES の先頭に追加すること。
"""
import io
import json
import os
import glob

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, "src", "content", "whiskies")
OUT = os.path.join(ROOT, "public", "ogp")

W, H = 1200, 630
BG = (250, 249, 246)
SURFACE = (255, 255, 255)
TEXT = (44, 36, 22)
TEXT_SUB = (107, 94, 74)
TEXT_TERTIARY = (155, 142, 122)
BORDER = (224, 213, 193)
BRAND = (212, 160, 48)

REGION_COLORS = {
    "islay": (74, 124, 140), "speyside": (201, 162, 39), "highland": (122, 154, 91),
    "lowland": (168, 192, 160), "campbeltown": (107, 142, 158), "island": (91, 127, 166),
    "japan": (192, 96, 63), "kentucky": (184, 118, 58), "tennessee": (160, 99, 47),
    "ireland": (74, 140, 106), "taiwan": (201, 138, 58), "india": (181, 96, 63),
    "australia": (138, 111, 168),
}
REGION_LABELS = {
    "islay": "アイラ", "speyside": "スペイサイド", "highland": "ハイランド",
    "lowland": "ローランド", "campbeltown": "キャンベルタウン", "island": "アイランズ",
    "japan": "日本", "kentucky": "ケンタッキー", "tennessee": "テネシー",
    "ireland": "アイルランド", "taiwan": "台湾", "india": "インド", "australia": "オーストラリア",
}
TYPE_LABELS = {
    "single-malt": "シングルモルト", "blended": "ブレンデッド", "blended-malt": "ブレンデッドモルト",
    "grain": "グレーン", "bourbon": "バーボン", "tennessee": "テネシー", "rye": "ライ",
}
# OGPは横幅が限られるため、軸名は短縮形を使う
AXES = [("peat", "ピート"), ("sweet", "甘さ"), ("fruity", "果実味"), ("spicy", "スパイス"),
        ("oak", "オーク"), ("smoky", "スモーク"), ("complex", "複雑さ"), ("body", "ボディ")]

FONT_CANDIDATES = [
    (os.path.join(ROOT, "fonts", "NotoSansJP-Bold.ttf"), None),
    (r"C:\Windows\Fonts\meiryob.ttc", 0),
    (r"C:\Windows\Fonts\YuGothB.ttc", 0),
    (r"C:\Windows\Fonts\meiryo.ttc", 0),
]
FONT_CANDIDATES_REGULAR = [
    (os.path.join(ROOT, "fonts", "NotoSansJP-Regular.ttf"), None),
    (r"C:\Windows\Fonts\meiryo.ttc", 0),
    (r"C:\Windows\Fonts\YuGothR.ttc", 0),
]


def load_font(size, bold=False):
    for path, index in (FONT_CANDIDATES if bold else FONT_CANDIDATES_REGULAR):
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size, index=index or 0)
            except OSError:
                continue
    raise SystemExit("日本語フォントが見つかりません。fonts/NotoSansJP-*.ttf を置いてください。")


def wrap(draw, text, font, max_width):
    """日本語は単語区切りが無いので1文字ずつ幅を測って折り返す"""
    lines, line = [], ""
    for ch in text:
        candidate = line + ch
        if draw.textlength(candidate, font=font) > max_width and line:
            lines.append(line)
            line = ch
        else:
            line = candidate
    if line:
        lines.append(line)
    return lines


def draw_bottle(draw, x, y, scale, color, fill_ratio=0.6):
    """カードと同じ意匠のボトル。中身の高さは評価に連動させる"""
    def p(px, py):
        return (x + px * scale, y + py * scale)

    light = color + (70,)

    # 胴
    draw.rounded_rectangle([p(13, 24), p(27, 61)], radius=4 * scale, fill=light, outline=color, width=2)
    # 肩から首
    draw.polygon([p(14, 26), p(16.5, 19), p(23.5, 19), p(26, 26)], fill=light)
    draw.rectangle([p(16.5, 8), p(23.5, 20)], fill=light, outline=color, width=2)
    # 中身
    top = 61 - (61 - 26) * fill_ratio
    draw.rounded_rectangle([p(13.5, top), p(26.5, 60.5)], radius=4 * scale, fill=color)
    # キャップ
    draw.rounded_rectangle([p(15.5, 4), p(24.5, 9)], radius=1.5 * scale, fill=color)


PHOTO_DIR = os.path.join(ROOT, "public", "images", "whiskies")


def find_photo(slug):
    """その銘柄の写真ファイルがあればパスを返す（なければ None）"""
    for ext in (".jpg", ".jpeg", ".png", ".webp"):
        path = os.path.join(PHOTO_DIR, slug + ext)
        if os.path.exists(path):
            return path
    return None


def draw_photo(img, path, box):
    """写真をボックス内に cover で収めて角丸で描く"""
    x0, y0, x1, y1 = box
    bw, bh = x1 - x0, y1 - y0
    photo = Image.open(path).convert("RGB")

    # cover: 縦横比を揃えて中央で切り出す
    scale = max(bw / photo.width, bh / photo.height)
    nw, nh = int(photo.width * scale), int(photo.height * scale)
    photo = photo.resize((nw, nh), Image.LANCZOS)
    left = (nw - bw) // 2
    top = (nh - bh) // 2
    photo = photo.crop((left, top, left + bw, top + bh))

    mask = Image.new("L", (bw, bh), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, bw, bh], radius=20, fill=255)
    img.paste(photo, (x0, y0), mask)

    # 枠線
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([x0, y0, x1, y1], radius=20, outline=BORDER, width=2)


def render(data, slug):
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img, "RGBA")

    region = data.get("region", "highland")
    color = REGION_COLORS.get(region, BRAND)

    # 地域カラーの帯
    draw.rectangle([0, 0, 18, H], fill=color)

    # カード
    draw.rounded_rectangle([64, 56, W - 64, H - 56], radius=24, fill=SURFACE, outline=BORDER, width=2)

    f_site = load_font(24)
    f_meta = load_font(26)
    f_title = load_font(64, bold=True)
    f_en = load_font(24)
    f_num = load_font(76, bold=True)
    f_unit = load_font(24)
    f_axis = load_font(17)

    x = 108
    draw.text((x, 96), "WHISKY DATA JP", font=f_site, fill=TEXT_TERTIARY)

    # 銘柄名（最大2行）
    title_lines = wrap(draw, data["name"], f_title, 700)[:2]
    y = 148
    for line in title_lines:
        draw.text((x, y), line, font=f_title, fill=TEXT)
        y += 78

    draw.text((x, y + 4), data.get("nameEn", ""), font=f_en, fill=TEXT_TERTIARY)
    y += 52

    meta = "　".join(filter(None, [
        REGION_LABELS.get(region, region),
        TYPE_LABELS.get(data.get("type"), data.get("type", "")),
        f"{data['age']}年" if data.get("age") else "NAS",
        f"{data['abv']:g}%",
    ]))
    draw.text((x, y), meta, font=f_meta, fill=TEXT_SUB)
    y += 56

    # 味の8軸（棒グラフ）
    bar_w, gap, bar_h = 72, 12, 104
    bx = x
    base_y = H - 128
    for key, label in AXES:
        value = data["flavor"][key]
        h = int(bar_h * value / 5)
        draw.rounded_rectangle([bx, base_y - bar_h, bx + bar_w, base_y], radius=6, fill=(245, 240, 232))
        if h > 0:
            draw.rounded_rectangle([bx, base_y - h, bx + bar_w, base_y], radius=6, fill=color)
        tw = draw.textlength(label, font=f_axis)
        draw.text((bx + (bar_w - tw) / 2, base_y + 10), label, font=f_axis, fill=TEXT_TERTIARY)
        bx += bar_w + gap

    # 右側の数値
    rx = W - 108
    rating = str(data["rating"])
    rw = draw.textlength(rating, font=f_num)
    draw.text((rx - rw, 150), rating, font=f_num, fill=color)
    uw = draw.textlength("／100", font=f_unit)
    draw.text((rx - uw, 232), "／100", font=f_unit, fill=TEXT_TERTIARY)

    if data.get("priceYen"):
        price = f"{data['priceYen']:,}円"
        pw = draw.textlength(price, font=f_meta)
        draw.text((rx - pw, 278), price, font=f_meta, fill=TEXT_SUB)

    fill_ratio = min(0.85, max(0.35, (data["rating"] - 75) / 20 * 0.5 + 0.35))
    photo_path = find_photo(slug)
    if photo_path:
        draw_photo(img, photo_path, (W - 420, 296, W - 108, H - 128))
    else:
        draw_bottle(draw, W - 250, 296, 3.2, color, fill_ratio)

    os.makedirs(OUT, exist_ok=True)
    img.save(os.path.join(OUT, f"whisky-{slug}.png"), optimize=True)


def render_default():
    """サイト共通のOGP画像"""
    img = Image.new("RGB", (W, H), (44, 36, 22))
    draw = ImageDraw.Draw(img, "RGBA")

    for i in range(H):
        # 上から下へ琥珀色のグラデーション
        ratio = i / H
        draw.line([(0, i), (W, i)],
                  fill=(int(44 + 40 * ratio), int(36 + 28 * ratio), int(22 + 10 * ratio)))

    f_title = load_font(78, bold=True)
    f_sub = load_font(30)
    f_site = load_font(26)

    draw.text((96, 200), "データで読むウイスキー", font=f_title, fill=(245, 230, 211))
    draw.text((96, 310), "味の8軸・価格・コスパの数値で選ぶ", font=f_sub, fill=(200, 185, 165))
    draw.text((96, 96), "WHISKY DATA JP", font=f_site, fill=BRAND)
    draw.rectangle([96, 150, 200, 156], fill=BRAND)

    os.makedirs(os.path.join(ROOT, "public", "images"), exist_ok=True)
    img.save(os.path.join(ROOT, "public", "images", "ogp-default.png"), optimize=True)


def main():
    files = sorted(glob.glob(os.path.join(SRC, "*.json")))
    for path in files:
        slug = os.path.splitext(os.path.basename(path))[0]
        data = json.load(io.open(path, encoding="utf-8"))
        render(data, slug)
    render_default()
    print(f"生成: 銘柄 {len(files)}件 + デフォルト1件 -> public/ogp/, public/images/")


if __name__ == "__main__":
    main()
