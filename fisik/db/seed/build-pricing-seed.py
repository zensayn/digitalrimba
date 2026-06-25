#!/usr/bin/env python3
"""Convert harga-katalog-rimba.xlsx into pricing-seed.json.

The seed-pricing command consumes the JSON; this script keeps it reproducible
from the source spreadsheet. Re-run after the spreadsheet changes:

    python3 db/seed/build-pricing-seed.py \
        --xlsx fisik/harga-katalog-rimba.xlsx \
        --out  fisik/db/seed/pricing-seed.json

No third-party deps — reads the xlsx (a zip of XML) with the stdlib.
"""
import argparse
import json
import re
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

NS = {"a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
TIERS = [
    {"code": "t1", "label": "50-99 pcs", "min_qty": 50, "max_qty": 99, "sort_order": 0},
    {"code": "t2", "label": "100-299 pcs", "min_qty": 100, "max_qty": 299, "sort_order": 1},
    {"code": "t3", "label": "300-499 pcs", "min_qty": 300, "max_qty": 499, "sort_order": 2},
    {"code": "t4", "label": "500+ pcs", "min_qty": 500, "max_qty": None, "sort_order": 3},
]
TIER_CODES = [t["code"] for t in TIERS]


def col_num(ref: str) -> int:
    letters = re.match(r"([A-Z]+)", ref).group(1)
    n = 0
    for c in letters:
        n = n * 26 + (ord(c) - 64)
    return n


def read_rows(xlsx_path: Path):
    with zipfile.ZipFile(xlsx_path) as z:
        xml = z.read("xl/worksheets/sheet1.xml")
    # Excel sheet XML never declares a DTD; reject one to neutralize XXE /
    # billion-laughs from a tampered file before handing bytes to the parser.
    if re.search(rb"<!DOCTYPE", xml, re.IGNORECASE):
        raise ValueError("refusing to parse sheet XML containing a DOCTYPE")
    root = ET.fromstring(xml)
    rows = []
    for r in root.find("a:sheetData", NS).findall("a:row", NS):
        cells = {}
        for c in r.findall("a:c", NS):
            ref, t = c.get("r"), c.get("t")
            v, isv = c.find("a:v", NS), c.find("a:is", NS)
            val = ""
            if t == "inlineStr" and isv is not None:
                tn = isv.find("a:t", NS)
                val = tn.text if tn is not None else ""
            elif v is not None:
                val = v.text
            cells[col_num(ref)] = val
        if cells:
            mx = max(cells)
            rows.append([cells.get(i, "") for i in range(1, mx + 1)])
    return rows


def build(xlsx_path: Path) -> dict:
    products = []
    # Data rows have a "Kode Rimba" like "RS 01.1" / "RSH 01.1" / "RFH 01.1".
    code_re = re.compile(r"^(RSH|RFH|RS)\s+\d+\.\d+$")
    for row in read_rows(xlsx_path):
        if len(row) < 7:
            continue
        name, kode_rimba, kode_invitto = row[0].strip(), row[1].strip(), row[2].strip()
        if not code_re.match(kode_rimba):
            continue
        rimba_code = kode_rimba.lower().replace(" ", "-")
        collection_code = rimba_code.split("-", 1)[0]
        raw = row[3:7]
        pending = any("cek katalog" in str(x).lower() for x in raw)
        prices = {}
        if not pending:
            for tier, cell in zip(TIER_CODES, raw):
                prices[tier] = int(str(cell).strip())
        products.append({
            "rimba_code": rimba_code,
            "invitto_code": kode_invitto,
            "name": name,
            "collection_code": collection_code,
            "status": "pending" if pending else "available",
            "prices": prices,
        })
    return {
        "currency": "IDR",
        "source": "harga-katalog-rimba.xlsx",
        "tiers": TIERS,
        "products": products,
    }


def main():
    here = Path(__file__).resolve()
    default_xlsx = here.parents[2] / "harga-katalog-rimba.xlsx"  # fisik/harga-katalog-rimba.xlsx
    default_out = here.parent / "pricing-seed.json"
    ap = argparse.ArgumentParser()
    ap.add_argument("--xlsx", type=Path, default=default_xlsx)
    ap.add_argument("--out", type=Path, default=default_out)
    args = ap.parse_args()

    seed = build(args.xlsx)
    args.out.write_text(json.dumps(seed, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    avail = sum(1 for p in seed["products"] if p["status"] == "available")
    pending = sum(1 for p in seed["products"] if p["status"] == "pending")
    print(f"wrote {args.out}: {len(seed['products'])} products ({avail} available, {pending} pending)")


if __name__ == "__main__":
    main()
