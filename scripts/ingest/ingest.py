#!/usr/bin/env python
"""Image-ingestion prototype for an architect's portfolio.

Reads a flat, READ-ONLY source folder of renders and A1/A4 layout sheets,
classifies each file, smart-crops layout sheets (removes frame + title block /
consultancy branding), and writes WebP gallery + thumbnail files, a manifest
(json + csv) and a self-contained review.html contact sheet.

Run with:  python -I ingest.py --src "H:/Temp Work/TEMP" --out <outdir>
Only <outdir> is ever written to. Re-running is idempotent (cached analysis,
unchanged outputs are skipped, stale outputs are removed).
"""
import argparse
import csv
import hashlib
import html
import json
import os
import re
import sys
from collections import defaultdict

import cv2
import numpy as np
from PIL import Image, ImageDraw

Image.MAX_IMAGE_PIXELS = None
ALGO_VERSION = 9
ANALYSIS_EDGE = 2000          # long edge (px) of the downscaled analysis image
SHEET_MIN_EDGE = 3000         # long edge >= this relaxes the frame-line requirement
SHEET_BORDER_WHITE = 0.5      # white-border share => white-background sheet (renders <=0.21, sheets >=0.77)
TITLEBLOCK_BORDER_WHITE = 0.3 # a detected title-block strip counts as a sheet if border is at least this white
WHITE_MAX = 247               # min-channel below this counts as content
LINE_DARK = 215               # gray below this counts as line ink
HAIRLINE = (229, 229, 229)    # #e5e5e5
EXTS = (".jpg", ".jpeg", ".png")

# ----------------------------------------------------------------- filenames

CODE_RE = re.compile(r"^00A-0*(\d{1,4})(?=[\s\-_]|$)")
LATIN_TAIL_RE = re.compile(r"[A-Za-z][^\u0600-\u06FF()]*$")


def normalize_code(digits):
    """'200' -> '00A-0200'."""
    return "00A-%04d" % int(digits)


def parse_filename(fname):
    """Return dict(code, group, name_ar, sheet_label, sheet_set, hint_code)."""
    stem = os.path.splitext(fname)[0].strip()
    info = {"code": None, "group": None, "name_ar": None, "sheet_label": None,
            "sheet_set": None, "hint_code": None}
    low = stem.lower()
    for key in ("landscape", "type"):
        if low.startswith(key):
            info["group"] = key
            hint = re.search(r"00A-0*(\d{1,4})", stem)
            info["hint_code"] = normalize_code(hint.group(1)) if hint else None
            rest = re.sub(r"00A-0*\d{1,4}", "", stem[len(key):])
            rest = re.sub(r"\(\d+\)", "", rest)
            info["sheet_label"] = re.sub(r"\s+", " ", rest).strip(" _-") or None
            return info
    m = CODE_RE.match(stem)
    if not m:
        return info
    info["code"] = normalize_code(m.group(1))
    rest = stem[m.end():].strip(" -_")
    rest = re.sub(r"\s*\(\d+\)\s*$", "", rest)
    rest = re.sub(r"_Page_\d+\s*$", "", rest)
    rest = re.sub(r"\s*\(\d+\)\s*$", "", rest)
    sm = re.search(r"\s+(S\d+)$", rest)
    if sm:
        info["sheet_set"] = sm.group(1)
        rest = rest[:sm.start()]
    lm = LATIN_TAIL_RE.search(rest)
    if lm:
        info["sheet_label"] = lm.group(0).strip(" _-") or None
        rest = rest[:lm.start()]
    info["name_ar"] = re.sub(r"\s+", " ", rest).strip(" -_") or None
    return info


# ------------------------------------------------------------------- loading

def open_reduced(path, target_long=None):
    """Open an image, using JPEG draft mode to decode at reduced size.
    Returns (RGB PIL image, full_w, full_h)."""
    im = Image.open(path)
    full = im.size
    if target_long and im.format == "JPEG":
        f = min(1.0, target_long / max(full))
        im.draft("RGB", (max(1, int(full[0] * f)), max(1, int(full[1] * f))))
    if im.mode in ("RGBA", "LA", "P"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[-1])
        return bg, full[0], full[1]
    return im.convert("RGB"), full[0], full[1]


def analysis_array(path):
    """Downscaled BGR-free RGB uint8 array (long edge ANALYSIS_EDGE) + scale
    factor analysis->full-res."""
    im, fw, fh = open_reduced(path, ANALYSIS_EDGE)
    arr = np.asarray(im)
    h, w = arr.shape[:2]
    f = ANALYSIS_EDGE / max(w, h)
    if f < 1:
        arr = cv2.resize(arr, (round(w * f), round(h * f)), interpolation=cv2.INTER_AREA)
    return arr, fw / arr.shape[1], fh / arr.shape[0]


# ------------------------------------------------------------ frame / layout

def find_frame_lines(line, band=0.05, min_cover=0.5):
    """Locate the thin outer border: for each side, the INNERMOST row/col in the
    outer `band` whose ink coverage >= min_cover. Returns (l, t, r, b) as
    inner-edge pixel coords plus how many sides were found."""
    h, w = line.shape
    rows = line.mean(axis=1)
    cols = line.mean(axis=0)
    bh, bw = int(h * band), int(w * band)

    def inner(profile, lo, hi, step):
        idx = [i for i in range(lo, hi, step) if profile[i] >= min_cover]
        if not idx:
            return None
        return max(idx) if step > 0 else min(idx)

    t = inner(rows, 0, bh, 1)
    b = inner(rows, h - 1, h - 1 - bh, -1)
    l = inner(cols, 0, bw, 1)
    r = inner(cols, w - 1, w - 1 - bw, -1)
    pad = 3
    box = (0 if l is None else l + pad, 0 if t is None else t + pad,
           w if r is None else r - pad + 1, h if b is None else b - pad + 1)
    return box, sum(v is not None for v in (t, b, l, r))


def line_peaks(profile, lo, hi, outer, thresh=0.8, gap=0.35):
    """Indices in [lo,hi) that are full-span line peaks: coverage >= thresh and
    clearly above the neighbouring region on the page-edge side (`outer` is
    +1 when the edge lies at higher indices, -1 otherwise). Looking only
    outward keeps a divider detectable even when a picture touches it."""
    out = []
    n = len(profile)
    for i in range(max(lo, 8), min(hi, n - 8)):
        if profile[i] < thresh:
            continue
        nb = profile[i + 4:i + 9] if outer > 0 else profile[i - 8:i - 3]
        if profile[i] - nb.mean() > gap:
            out.append(i)
    return out


def find_title_block(line, box, zone=0.28):
    """Find a long straight line separating a narrow strip near an edge.
    Returns (side, coord) or None; coord is the divider position (full image
    coords), side in right|left|bottom|top. Picks the line nearest the centre
    inside the edge zone; prefers the right/bottom strips."""
    x0, y0, x1, y1 = box
    sub = line[y0:y1, x0:x1]
    h, w = sub.shape
    cols, rows = sub.mean(axis=0), sub.mean(axis=1)
    cands = []
    for side, prof, length in (("right", cols, w), ("bottom", rows, h),
                               ("left", cols, w), ("top", rows, h)):
        z = int(length * zone)
        lo, hi = ((length - z, length) if side in ("right", "bottom") else (0, z))
        peaks = line_peaks(prof, lo, hi, 1 if side in ("right", "bottom") else -1)
        if not peaks:
            continue
        pos = min(peaks) if side in ("right", "bottom") else max(peaks)
        strip = (length - pos) if side in ("right", "bottom") else pos
        if strip / length < 0.06:
            continue
        cands.append((strip / length, side, pos + (x0 if side in ("right", "left") else y0)))
    # candidates are in preference order (right, bottom, left, top)
    return (cands[0][1], cands[0][2]) if cands else None


def cut_title_block(box, tb):
    """Shrink the interior box so the title-block strip is excluded."""
    x0, y0, x1, y1 = box
    if tb is None:
        return box
    side, c = tb
    gap = 3
    if side == "right":
        x1 = c - gap
    elif side == "left":
        x0 = c + gap
    elif side == "bottom":
        y1 = c - gap
    else:
        y0 = c + gap
    return x0, y0, x1, y1


# ----------------------------------------------------------- content finding

def content_components(arr, box, close_frac):
    """Connected components of non-white content inside `box` after a
    morphological close. Returns list of (x0,y0,x1,y1,area) in full analysis
    coordinates, sorted by area desc."""
    x0, y0, x1, y1 = box
    sub = arr[y0:y1, x0:x1]
    mask = (sub.min(axis=2) < WHITE_MAX).astype(np.uint8)
    k = max(3, int(max(arr.shape[:2]) * close_frac)) | 1
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_RECT, (k, k)))
    n, _, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    comps = []
    for i in range(1, n):
        x, y, w, h, a = stats[i]
        comps.append((x + x0, y + y0, x + x0 + w, y + y0 + h, int(a)))
    comps.sort(key=lambda c: -c[4])
    return comps


def drop_small(comps, keep_ratio=0.02):
    """Remove specks and caption-like leftovers (area < 2% of the largest)."""
    if not comps:
        return comps
    big = comps[0][4]
    return [c for c in comps if c[4] >= keep_ratio * big]


def drop_bottom_captions(comps, max_area=0.05, max_h=0.06, band=0.85):
    """Remove tiny isolated view captions hanging below the drawing: a small,
    short component in the bottom 15% of the content box that does not overlap
    the main drawing. Conservative: only touches comps far smaller than the
    largest one."""
    if len(comps) < 2:
        return comps
    main = comps[0]
    ub = union_box(comps)
    uh = ub[3] - ub[1]
    keep = [main]
    for c in comps[1:]:
        small = c[4] < max_area * main[4] and (c[3] - c[1]) < max_h * uh
        low = c[1] >= ub[1] + band * uh
        apart = c[1] >= main[3] or c[2] <= main[0] or c[0] >= main[2]
        if not (small and low and apart):
            keep.append(c)
    return keep


def union_box(comps):
    return (min(c[0] for c in comps), min(c[1] for c in comps),
            max(c[2] for c in comps), max(c[3] for c in comps))


def pad_box(b, frac, limit):
    """Pad box by `frac` of its long side, clipped to `limit` box."""
    p = int(max(b[2] - b[0], b[3] - b[1]) * frac)
    return (max(limit[0], b[0] - p), max(limit[1], b[1] - p),
            min(limit[2], b[2] + p), min(limit[3], b[3] + p))


def find_viewports(arr, region, content, max_n=6):
    """Several large, separated drawings => their boxes (else [])."""
    comps = drop_small(content_components(arr, region, 0.03))
    ca = (content[2] - content[0]) * (content[3] - content[1])
    cw, ch = content[2] - content[0], content[3] - content[1]
    vps = [c for c in comps
           if (c[2] - c[0]) * (c[3] - c[1]) > 0.08 * ca
           and (c[2] - c[0]) > 0.12 * cw and (c[3] - c[1]) > 0.12 * ch]
    if len(vps) < 2 or len(vps) > max_n:
        return []
    for i, a in enumerate(vps):                       # must be disjoint
        for b in vps[i + 1:]:
            if a[0] < b[2] and b[0] < a[2] and a[1] < b[3] and b[1] < a[3]:
                return []
    return [pad_box(v[:4], 0.02, region) for v in sorted(vps, key=lambda v: (v[1] // 50, v[0]))]


# ---------------------------------------------------------------- classifier

def border_white_fraction(arr, frac=0.03):
    """Share of near-white pixels in the outer band (ignoring thin lines)."""
    h, w = arr.shape[:2]
    bh, bw = max(2, int(h * frac)), max(2, int(w * frac))
    m = arr.min(axis=2) >= 235
    band = np.concatenate([m[:bh].ravel(), m[-bh:].ravel(), m[:, :bw].ravel(), m[:, -bw:].ravel()])
    return float(band.mean())


def analyse(path):
    """Full analysis of one image. Pure function of file content."""
    arr, sx, sy = analysis_array(path)
    fh, fw = round(arr.shape[0] * sy), round(arr.shape[1] * sx)
    long_edge = max(fw, fh)
    gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
    line = gray < LINE_DARK
    frame_box, frame_sides = find_frame_lines(line)
    bw = border_white_fraction(arr)
    # Size-independent: a title-block strip or a white border/frame => sheet;
    # only full-bleed (non-white border) images stay renders.
    tb = find_title_block(line, frame_box)
    white_frame = bw > SHEET_BORDER_WHITE and (frame_sides >= 2 or tb is not None
                                               or long_edge >= SHEET_MIN_EDGE)
    tb_sheet = tb is not None and bw > TITLEBLOCK_BORDER_WHITE
    kind = "sheet" if (white_frame or tb_sheet) else "render"
    if kind == "sheet":
        reason = "title-block+white-border" if tb_sheet else "white-background framed sheet"
    else:
        reason = "full-bleed render (no white sheet border / title block)"
    res = {"kind": kind, "kind_reason": reason, "width": fw, "height": fh,
           "border_white": round(bw, 3), "frame_sides": frame_sides}
    if kind == "sheet":
        res.update(crop_sheet(arr, line, frame_box, frame_sides, (sx, sy)))
    return res


def crop_sheet(arr, line, frame_box, frame_sides, scale):
    """Smart crop decision; boxes returned in FULL-RES pixel coords."""
    tb = find_title_block(line, frame_box)
    region = cut_title_block(frame_box, tb)
    raw = content_components(arr, region, 0.012)
    comps = drop_bottom_captions(drop_small(raw))
    rw, rh = region[2] - region[0], region[3] - region[1]
    if not comps or rw < 50 or rh < 50:
        box, frac = frame_box, 0.0
    else:
        ub = union_box(comps)
        # padding must not swallow dropped captions lying below the drawing
        below = [c[1] for c in raw if c not in comps and c[1] >= ub[3]]
        limit = region if not below else (region[0], region[1], region[2], min(region[3], min(below) - 1))
        box = pad_box(ub, 0.02, limit)
        frac = ((box[2] - box[0]) * (box[3] - box[1])) / float(rw * rh)
    conf, method = score_crop(frame_sides, tb, frac, box, region, bool(comps))
    vps = find_viewports(arr, region, box) if conf != "low" else []
    sx, sy = scale
    full = lambda b: [round(b[0] * sx), round(b[1] * sy), round(b[2] * sx), round(b[3] * sy)]
    return {"crop_box": full(box), "viewport_boxes": [full(v) for v in vps],
            "titleblock": None if tb is None else tb[0], "crop_method": method,
            "confidence": conf, "content_fraction": round(frac, 3),
            "frame_box": full(frame_box), "region_box": full(region)}


def score_crop(frame_sides, tb, frac, box, region, found):
    """Confidence heuristics -> (high|medium|low, method string)."""
    parts = []
    parts.append("frame" if frame_sides >= 3 else ("partial-frame" if frame_sides else "no-frame"))
    parts.append("titleblock-" + tb[0] if tb else "no-titleblock")
    parts.append("content-bbox" if found else "fallback-full-region")
    touches = sum([box[0] <= region[0] + 2, box[1] <= region[1] + 2,
                   box[2] >= region[2] - 2, box[3] >= region[3] - 2])
    if not found or frac < 0.04 or frac > 0.985 or (not tb and frame_sides < 3):
        conf = "low"
    elif frame_sides >= 3 and tb and touches < 2:
        conf = "high"
    else:
        conf = "medium"
    if conf == "low":
        parts.append("mat-fallback")
    return conf, "+".join(parts)


# ------------------------------------------------------------------- output

def fit_long(im, edge):
    """Downscale (never upscale) so the long edge <= edge."""
    w, h = im.size
    f = edge / max(w, h)
    if f >= 1:
        return im
    return im.resize((max(1, round(w * f)), max(1, round(h * f))), Image.LANCZOS)


def add_mat(im, edge):
    """Fit inside `edge` incl. ~4% white padding per side + 1px #e5e5e5 hairline."""
    inner = fit_long(im, int(edge / 1.08))
    pad = max(2, round(max(inner.size) * 0.04))
    canvas = Image.new("RGB", (inner.width + 2 * pad, inner.height + 2 * pad), "white")
    canvas.paste(inner, (pad, pad))
    ImageDraw.Draw(canvas).rectangle([0, 0, canvas.width - 1, canvas.height - 1], outline=HAIRLINE, width=1)
    return canvas


def load_crop(path, box, full_size, edge):
    """Load only the needed region at roughly output resolution."""
    fw, fh = full_size
    bl = max(box[2] - box[0], box[3] - box[1]) if box else max(fw, fh)
    im, _, _ = open_reduced(path, edge * max(fw, fh) / max(bl, 1) * 1.05 if box else edge)
    sx, sy = im.size[0] / fw, im.size[1] / fh
    if box:
        im = im.crop((int(box[0] * sx), int(box[1] * sy), int(box[2] * sx), int(box[3] * sy)))
    return im


def save_pair(im, out_dir, stem, args, mat):
    """Write <stem>.webp (max-edge) and <stem>-thumb.webp; return names + bytes."""
    gal = add_mat(im, args.max_edge) if mat else fit_long(im, args.max_edge)
    thumb = fit_long(gal, args.thumb_edge)
    n1, n2 = stem + ".webp", stem + "-thumb.webp"
    gal.save(os.path.join(out_dir, n1), "WEBP", quality=args.quality, method=5)
    thumb.save(os.path.join(out_dir, n2), "WEBP", quality=args.thumb_quality, method=5)
    return [n1, n2], gal.size


def make_preview(path, rec, out_dir, name):
    """Review preview JPEG (long edge 760) with crop boxes outlined."""
    im, fw, fh = open_reduced(path, 900)
    f = 760 / max(im.size)
    im = im.resize((round(im.width * f), round(im.height * f)), Image.LANCZOS)
    d = ImageDraw.Draw(im)
    k = im.width / rec["width"]
    for key, col in (("crop_box", (230, 40, 40)), ("viewport_boxes", (240, 150, 0))):
        boxes = rec.get(key) or []
        boxes = [boxes] if key == "crop_box" and boxes else boxes
        for b in boxes:
            d.rectangle([b[0] * k, b[1] * k, b[2] * k, b[3] * k], outline=col, width=2)
    im.save(os.path.join(out_dir, name), "JPEG", quality=70)


# --------------------------------------------------------------- pipeline

def list_sources(src):
    return sorted(f for f in os.listdir(src) if f.lower().endswith(EXTS))


def file_sig(path):
    st = os.stat(path)
    return "%d-%d-v%d" % (st.st_size, st.st_mtime_ns, ALGO_VERSION)


def load_json(path, default):
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    except (OSError, ValueError):
        return default


def analyse_all(src, files, cache):
    """Analyse each file (cache keyed by filename + signature)."""
    out = {}
    for i, f in enumerate(files, 1):
        p = os.path.join(src, f)
        sig = file_sig(p)
        hit = cache.get(f)
        if hit and hit.get("sig") == sig:
            out[f] = hit
            continue
        rec = analyse(p)
        rec.update(parse_filename(f))
        rec.update({"file": f, "bytes": os.path.getsize(p), "sig": sig})
        out[f] = rec
        print("  analysed %3d/%d %-8s %s" % (i, len(files), rec["kind"], rec.get("confidence", "")), flush=True)
    return out


def stem_for(rec, counters):
    """Output stem: <code>-<n> or UNSORTED-<group>-<n>."""
    if rec["code"]:
        key, prefix = rec["code"], rec["code"]
    else:
        key = "UNSORTED-" + (rec["group"] or "other")
        prefix = key
    counters[key] += 1
    return "%s-%d" % (prefix, counters[key])


def ordered(recs):
    """Per group: renders first (by name) then sheets (by name)."""
    return sorted(recs, key=lambda r: (r["code"] or "~" + (r["group"] or "z"), r["kind"] != "render", r["file"]))


def process(rec, src, out_dir, args, counters, written):
    """Write outputs for one source file (+ viewport crops). Fills rec."""
    path = os.path.join(src, rec["file"])
    sheet = rec["kind"] == "sheet"
    mat = sheet and args.mat or (not sheet and args.mat_renders)
    if sheet and rec["confidence"] == "low":
        mat = True                                  # fallback: always a clean mat
    jobs = [("main", rec["crop_box"] if sheet else None)]
    jobs += [("viewport", b) for b in rec.get("viewport_boxes", [])]
    rec["outputs"], rec["viewport_outputs"] = [], []
    for role, box in jobs:
        stem = stem_for(rec, counters)
        key = hashlib.sha1(json.dumps([rec["sig"], box, mat, args.max_edge, args.thumb_edge,
                                       args.quality, args.thumb_quality]).encode()).hexdigest()
        names = [stem + ".webp", stem + "-thumb.webp"]
        if all(written.get(n) == key and os.path.exists(os.path.join(out_dir, n)) for n in names):
            pass                                    # unchanged: skip re-encode
        else:
            im = load_crop(path, box, (rec["width"], rec["height"]), args.max_edge)
            save_pair(im, out_dir, stem, args, mat)
            for n in names:
                written[n] = key
        (rec["outputs"] if role == "main" else rec["viewport_outputs"]).append(names)
    rec["out_bytes"] = sum(os.path.getsize(os.path.join(out_dir, n))
                           for pair in rec["outputs"] + rec["viewport_outputs"] for n in pair)


def remove_stale(out_dir, keep):
    for n in os.listdir(out_dir):
        if n.endswith(".webp") and n not in keep:
            os.remove(os.path.join(out_dir, n))


def write_manifest(recs, out_dir):
    rows = []
    for r in recs:
        gallery = [p[0] for p in r["outputs"] + r["viewport_outputs"]]
        thumbs = [p[1] for p in r["outputs"] + r["viewport_outputs"]]
        rows.append({
            "original_filename": r["file"], "project_code": r["code"], "group": r["group"],
            "hint_code": r["hint_code"], "name_ar": r["name_ar"], "sheet_label": r["sheet_label"],
            "sheet_set": r["sheet_set"], "width": r["width"], "height": r["height"],
            "bytes": r["bytes"], "kind": r["kind"], "kind_reason": r["kind_reason"],
            "output_files": gallery, "thumb_files": thumbs,
            "viewport_count": len(r["viewport_outputs"]),
            "crop_method": r.get("crop_method", "none (re-encode only)"),
            "confidence": r.get("confidence", "n/a"),
            "crop_box": r.get("crop_box"), "titleblock_side": r.get("titleblock"),
            "content_fraction": r.get("content_fraction"), "output_bytes": r["out_bytes"]})
    with open(os.path.join(out_dir, "manifest.json"), "w", encoding="utf-8") as fh:
        json.dump(rows, fh, ensure_ascii=False, indent=2)
    with open(os.path.join(out_dir, "manifest.csv"), "w", encoding="utf-8-sig", newline="") as fh:
        w = csv.writer(fh)
        cols = [k for k in rows[0] if k not in ("crop_box",)]
        w.writerow(cols)
        for row in rows:
            w.writerow([";".join(map(str, row[c])) if isinstance(row[c], list) else
                        ("" if row[c] is None else row[c]) for c in cols])
    return rows


# ---------------------------------------------------------------- review.html

CSS = """body{font:14px system-ui,sans-serif;margin:24px;background:#fafafa;color:#222}
h1{font-size:22px}h2{margin:36px 0 6px;border-bottom:2px solid #222;padding-bottom:4px}
h3{margin:18px 0 8px;font-size:14px;color:#555}.grid{display:flex;flex-wrap:wrap;gap:8px}
.grid figure{margin:0;width:200px}.grid img{width:200px;display:block;border:1px solid #ddd}
figcaption{font-size:11px;color:#666;word-break:break-all}
.row{display:flex;gap:12px;margin:10px 0;padding:10px;background:#fff;border:1px solid #e5e5e5}
.row.low{border-color:#d33;background:#fff5f5}.orig{width:380px;flex:none}.orig img{width:100%}
.crops{display:flex;flex-wrap:wrap;gap:8px;flex:1;align-content:flex-start}
.crops img{height:300px;max-width:100%;border:1px solid #ddd;background:#fff}
.meta{font-size:12px;color:#444;margin-top:4px}.badge{padding:1px 6px;border-radius:8px;color:#fff;font-size:11px}
.high{background:#2a8}.medium{background:#e90}.low{background:#d33}"""


def esc(s):
    return html.escape(str(s))


def sheet_row(r):
    crops = "".join('<img loading="lazy" src="%s" title="%s">' % (esc(p[0]), esc(p[0]))
                    for p in r["outputs"] + r["viewport_outputs"])
    meta = ('<div class="meta"><span class="badge %s">%s</span> %s<br>%s | %dx%d | tb:%s | content %.0f%%</div>'
            % (r["confidence"], r["confidence"], esc(r["crop_method"]), esc(r["file"].encode("ascii", "replace").decode()),
               r["width"], r["height"], r.get("titleblock"), 100 * (r.get("content_fraction") or 0)))
    return ('<div class="row %s"><div class="orig"><img loading="lazy" src="_review/%s">%s</div>'
            '<div class="crops">%s</div></div>'
            % ("low" if r["confidence"] == "low" else "", esc(r["preview"]), meta, crops))


def write_review(recs, out_dir):
    groups = defaultdict(list)
    for r in recs:
        groups[r["code"] or "UNSORTED-" + (r["group"] or "other")].append(r)
    parts = ["<!doctype html><meta charset=utf-8><title>Ingest review</title><style>%s</style>"
             "<h1>Ingest review</h1><p>Red box = crop; orange = extra viewports. Low-confidence rows are outlined red.</p>" % CSS]
    for code in sorted(groups):
        rs = groups[code]
        parts.append("<h2>%s <small>(%s)</small></h2>" % (esc(code), esc((rs[0]["name_ar"] or ""))))
        renders = [r for r in rs if r["kind"] == "render"]
        if renders:
            parts.append("<h3>Renders (%d)</h3><div class=grid>" % len(renders))
            for r in renders:
                n = r["outputs"][0]
                parts.append('<figure><img loading="lazy" src="%s"><figcaption>%s</figcaption></figure>' % (esc(n[1]), esc(n[0])))
            parts.append("</div>")
        sheets = [r for r in rs if r["kind"] == "sheet"]
        if sheets:
            parts.append("<h3>Sheets (%d)</h3>" % len(sheets))
            parts.extend(sheet_row(r) for r in sheets)
    with open(os.path.join(out_dir, "review.html"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(parts))


def print_summary(recs, out_dir):
    per = defaultdict(lambda: [0, 0, 0])
    for r in recs:
        c = per[r["code"] or "UNSORTED-" + (r["group"] or "other")]
        c[0 if r["kind"] == "render" else 1] += 1
        c[2] += 1 + len(r["viewport_outputs"]) if r["kind"] == "sheet" else 1
    print("\n%-22s %7s %6s %8s" % ("project", "renders", "sheets", "outputs"))
    for k in sorted(per):
        print("%-22s %7d %6d %8d" % (k, *per[k]))
    sheets = [r for r in recs if r["kind"] == "sheet"]
    low = [r for r in sheets if r["confidence"] == "low"]
    total = sum(r["out_bytes"] for r in recs)
    print("\nrenders=%d sheets=%d viewport-extras=%d low-confidence=%d total-output=%.1f MB"
          % (len(recs) - len(sheets), len(sheets), sum(len(r["viewport_outputs"]) for r in recs),
             len(low), total / 1048576))
    for r in low:
        print("  LOW:", r["file"].encode("ascii", "replace").decode(), r["crop_method"])


def main():
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--src", default=r"H:\Temp Work\TEMP", help="READ-ONLY source folder")
    ap.add_argument("--out", required=True, help="output folder (only place written)")
    ap.add_argument("--max-edge", type=int, default=2400)
    ap.add_argument("--thumb-edge", type=int, default=800)
    ap.add_argument("--quality", type=int, default=82)
    ap.add_argument("--thumb-quality", type=int, default=78)
    ap.add_argument("--no-mat", dest="mat", action="store_false", help="disable gallery mat on sheets")
    ap.add_argument("--mat-renders", action="store_true", help="also mat renders (default off)")
    args = ap.parse_args()
    os.makedirs(os.path.join(args.out, "_review"), exist_ok=True)
    os.makedirs(os.path.join(args.out, "_cache"), exist_ok=True)
    files = list_sources(args.src)
    cpath = os.path.join(args.out, "_cache", "analysis.json")
    wpath = os.path.join(args.out, "_cache", "written.json")
    print("analysing %d files from %s" % (len(files), args.src))
    analysis = analyse_all(args.src, files, load_json(cpath, {}))
    with open(cpath, "w", encoding="utf-8") as fh:
        json.dump(analysis, fh, ensure_ascii=False)
    written, counters = load_json(wpath, {}), defaultdict(int)
    recs = ordered(list(analysis.values()))
    for i, r in enumerate(recs, 1):
        process(r, args.src, args.out, args, counters, written)
        if r["kind"] == "sheet":
            r["preview"] = "p_%03d.jpg" % i
            make_preview(os.path.join(args.src, r["file"]), r, os.path.join(args.out, "_review"), r["preview"])
    keep = {n for r in recs for p in r["outputs"] + r["viewport_outputs"] for n in p}
    remove_stale(args.out, keep)
    with open(wpath, "w", encoding="utf-8") as fh:
        json.dump({k: v for k, v in written.items() if k in keep}, fh)
    write_manifest(recs, args.out)
    write_review(recs, args.out)
    print_summary(recs, args.out)


if __name__ == "__main__":
    main()
