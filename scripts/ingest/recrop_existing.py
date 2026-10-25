#!/usr/bin/env python
"""Re-crop the EXISTING portfolio images with ingest.py's sheet logic.

Reads client/public/images/Project/*.webp (never modified), classifies each as
render or layout sheet via ingest.analyse(), and writes into --out:
  images/<same name>          sheets: cropped + matted WebP; renders: byte copy
  thumbs/<stem>-thumb.webp    800px long edge, q=78
  manifest.json               per-file record
  review/<code>[_N].jpg       BEFORE/AFTER contact sheets (changed files only)
  review/summary.json         per-code counts

Run with:  python -I recrop_existing.py --src <Project dir> --out <dir>
Viewport splitting is intentionally NOT applied (1:1 file mapping).
"""
import argparse
import json
import os
import re
import shutil
import sys
from collections import defaultdict
from concurrent.futures import ProcessPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ingest  # noqa: E402
from PIL import Image, ImageDraw  # noqa: E402

DEFAULT_SRC = os.path.join(os.path.dirname(__file__), "..", "..", "client", "public", "images", "Project")
EXCLUDED = {"00A-%04d" % n for n in (173, 179, 182, 189, 190, 191, 195, 196, 198, 200, 201, 204)}
CODE_RE = re.compile(r"^(00A-\d{4})")
CELL_W, CELL_H, CAP_H, GAP = 560, 420, 34, 10
BG = (225, 225, 225)
MAX_SHEET_BYTES = 1_200_000
ROWS_PER_PAGE = 10


def code_of(name):
    m = CODE_RE.match(name)
    return m.group(1) if m else None


def list_inputs(src, codes):
    out = []
    for f in sorted(os.listdir(src)):
        if not f.lower().endswith(".webp") or f.lower().endswith("-thumb.webp"):
            continue
        c = code_of(f)
        if c is None or c in EXCLUDED or (codes and c not in codes):
            continue
        out.append((f, c))
    return out


def process_one(job):
    """Worker: analyse + write outputs for one file. Returns manifest record."""
    f, code, src, out, quality, max_edge, thumb_edge, thumb_q = job
    path = os.path.join(src, f)
    stem = os.path.splitext(f)[0]
    rec = analyse_safe(path)
    sheet = rec["kind"] == "sheet"
    src_size = os.path.getsize(path)
    dst = os.path.join(out, "images", f)
    if sheet:
        im = ingest.load_crop(path, rec["crop_box"], (rec["width"], rec["height"]), max_edge)
        gal = ingest.add_mat(im, max_edge)      # low confidence => mat as well (same as ingest.process)
        gal.save(dst, "WEBP", quality=quality, method=5)
        thumb_src = gal
    else:
        shutil.copyfile(path, dst)              # untouched, no re-encode
        thumb_src, _, _ = ingest.open_reduced(path)
    ingest.fit_long(thumb_src, thumb_edge).save(
        os.path.join(out, "thumbs", stem + "-thumb.webp"), "WEBP", quality=thumb_q, method=5)
    return {"file": f, "code": code, "kind": rec["kind"], "changed": sheet,
            "method": rec.get("crop_method", "render-untouched"),
            "confidence": rec.get("confidence", "n/a"),
            "src_size": src_size, "out_size": os.path.getsize(dst),
            "src_px": [rec["width"], rec["height"]], "crop_box": rec.get("crop_box"),
            "viewports_ignored": len(rec.get("viewport_boxes", []))}


def analyse_safe(path):
    return ingest.analyse(path)


# ------------------------------------------------------------ review sheets

def fit_cell(path):
    im = Image.open(path).convert("RGB")
    im.thumbnail((CELL_W, CELL_H), Image.LANCZOS)
    cell = Image.new("RGB", (CELL_W, CELL_H), BG)
    cell.paste(im, ((CELL_W - im.width) // 2, (CELL_H - im.height) // 2))
    return cell


def render_page(rows, src, out):
    w = 2 * CELL_W + 3 * GAP
    rh = CELL_H + CAP_H + GAP
    page = Image.new("RGB", (w, rh * len(rows) + GAP), BG)
    d = ImageDraw.Draw(page)
    for i, r in enumerate(rows):
        y = GAP + i * rh
        page.paste(fit_cell(os.path.join(src, r["file"])), (GAP, y))
        page.paste(fit_cell(os.path.join(out, "images", r["file"])), (2 * GAP + CELL_W, y))
        cap = "%s | %s | %s" % (r["file"].encode("ascii", "replace").decode(), r["confidence"], r["method"])
        d.text((GAP, y + CELL_H + 4), "BEFORE/AFTER  " + cap, fill=(20, 20, 20))
    return page


def save_under_limit(page, path):
    for q, scale in ((72, 1.0), (66, 0.9), (60, 0.8), (55, 0.7), (50, 0.6), (45, 0.5)):
        im = page if scale == 1.0 else page.resize((round(page.width * scale), round(page.height * scale)), Image.LANCZOS)
        im.save(path, "JPEG", quality=q, optimize=True)
        if os.path.getsize(path) <= MAX_SHEET_BYTES:
            return


def write_review(recs, src, out):
    rdir = os.path.join(out, "review")
    os.makedirs(rdir, exist_ok=True)
    by_code = defaultdict(list)
    for r in recs:
        by_code[r["code"]].append(r)
    summary = {}
    for code, rs in sorted(by_code.items()):
        changed = [r for r in rs if r["changed"]]
        summary[code] = {"changed": len(changed), "unchanged": len(rs) - len(changed),
                         "low_confidence": [r["file"] for r in changed if r["confidence"] == "low"]}
        for p in range(0, len(changed), ROWS_PER_PAGE):
            name = code if p == 0 else "%s_%d" % (code, p // ROWS_PER_PAGE + 1)
            save_under_limit(render_page(changed[p:p + ROWS_PER_PAGE], src, out), os.path.join(rdir, name + ".jpg"))
    with open(os.path.join(rdir, "summary.json"), "w", encoding="utf-8") as fh:
        json.dump(summary, fh, ensure_ascii=False, indent=2)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--src", default=DEFAULT_SRC)
    ap.add_argument("--out", required=True)
    ap.add_argument("--codes", nargs="*", default=None, help="restrict to these project codes")
    ap.add_argument("--max-edge", type=int, default=2400)
    ap.add_argument("--thumb-edge", type=int, default=800)
    ap.add_argument("--quality", type=int, default=82)
    ap.add_argument("--thumb-quality", type=int, default=78)
    ap.add_argument("--workers", type=int, default=max(1, (os.cpu_count() or 2) - 1))
    a = ap.parse_args()
    src = os.path.abspath(a.src)
    for sub in ("images", "thumbs", "review"):
        os.makedirs(os.path.join(a.out, sub), exist_ok=True)
    inputs = list_inputs(src, set(a.codes) if a.codes else None)
    jobs = [(f, c, src, a.out, a.quality, a.max_edge, a.thumb_edge, a.thumb_quality) for f, c in inputs]
    print("processing %d files" % len(jobs), flush=True)
    with ProcessPoolExecutor(a.workers) as ex:
        recs = list(ex.map(process_one, jobs, chunksize=4))
    with open(os.path.join(a.out, "manifest.json"), "w", encoding="utf-8") as fh:
        json.dump(recs, fh, ensure_ascii=False, indent=2)
    write_review(recs, src, a.out)
    sheets = [r for r in recs if r["changed"]]
    low = [r["file"] for r in sheets if r["confidence"] == "low"]
    print("inputs=%d renders=%d sheets=%d low=%d before=%.1fMB after=%.1fMB" % (
        len(recs), len(recs) - len(sheets), len(sheets), len(low),
        sum(r["src_size"] for r in recs) / 1048576, sum(r["out_size"] for r in recs) / 1048576))


if __name__ == "__main__":
    main()
