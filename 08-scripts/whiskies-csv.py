# -*- coding: utf-8 -*-
"""
銘柄データをCSVと相互変換する。表計算ソフトでまとめて編集するための道具。

  python 08-scripts/whiskies-csv.py export    # JSON -> 08-scripts/whiskies.csv
  python 08-scripts/whiskies-csv.py import    # CSV  -> site/src/content/whiskies/*.json

CSVはUTF-8 (BOM付き) で書き出すのでExcelでもそのまま開ける。
import は既存ファイルを上書きし、CSVに無いIDは触らない（削除は手動）。
"""
import csv
import glob
import io
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_DIR = os.path.join(ROOT, "site", "src", "content", "whiskies")
CSV_PATH = os.path.join(ROOT, "08-scripts", "whiskies.csv")

AXES = ["peat", "sweet", "fruity", "spicy", "oak", "smoky", "complex", "body"]
SCALARS = [
    "name", "nameEn", "distillery", "distillerySlug", "country", "region", "type",
    "age", "abv", "priceYen", "priceAsOf", "priceSource", "availability", "rating",
    "notes", "affiliateId",
]
COLUMNS = ["id"] + SCALARS + ["cask", "recommendedFor"] + [f"flavor.{a}" for a in AXES]

NUMERIC = {"age": int, "abv": float, "priceYen": int, "rating": int}


def export_csv():
    rows = []
    for path in sorted(glob.glob(os.path.join(JSON_DIR, "*.json"))):
        d = json.load(io.open(path, encoding="utf-8"))
        row = {"id": os.path.splitext(os.path.basename(path))[0]}
        for key in SCALARS:
            row[key] = d.get(key, "")
        row["cask"] = "|".join(d.get("cask", []))
        row["recommendedFor"] = "|".join(d.get("recommendedFor", []))
        for axis in AXES:
            row[f"flavor.{axis}"] = d["flavor"][axis]
        rows.append(row)

    with io.open(CSV_PATH, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=COLUMNS)
        writer.writeheader()
        writer.writerows(rows)
    print(f"書き出し: {len(rows)}件 -> {os.path.relpath(CSV_PATH, ROOT)}")


def import_csv():
    if not os.path.exists(CSV_PATH):
        raise SystemExit(f"{CSV_PATH} がありません。先に export を実行してください。")

    with io.open(CSV_PATH, encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))

    written = 0
    for row in rows:
        slug = (row.get("id") or "").strip()
        if not slug:
            continue

        d = {}
        for key in SCALARS:
            value = (row.get(key) or "").strip()
            if value == "":
                continue
            d[key] = NUMERIC[key](value) if key in NUMERIC else value

        d["cask"] = [c for c in (row.get("cask") or "").split("|") if c]
        d["recommendedFor"] = [c for c in (row.get("recommendedFor") or "").split("|") if c]
        d["flavor"] = {a: int(row[f"flavor.{a}"]) for a in AXES}

        # 味は0〜5の範囲。ここで弾いておかないとビルド時にエラーになる
        for axis, v in d["flavor"].items():
            if not 0 <= v <= 5:
                raise SystemExit(f"{slug}: flavor.{axis} が範囲外です（{v}）")

        order = ["name", "nameEn", "distillery", "distillerySlug", "country", "region",
                 "type", "age", "abv", "cask", "priceYen", "priceAsOf", "priceSource",
                 "availability", "rating", "flavor", "notes", "recommendedFor", "affiliateId"]
        d = {k: d[k] for k in order if k in d}

        with io.open(os.path.join(JSON_DIR, slug + ".json"), "w", encoding="utf-8", newline="\n") as f:
            f.write(json.dumps(d, ensure_ascii=False, indent=2) + "\n")
        written += 1

    print(f"取り込み: {written}件 -> site/src/content/whiskies/")
    print("価格を実際に確認した場合は priceSource を market に変えること。")


if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else ""
    if mode == "export":
        export_csv()
    elif mode == "import":
        import_csv()
    else:
        raise SystemExit(__doc__)
