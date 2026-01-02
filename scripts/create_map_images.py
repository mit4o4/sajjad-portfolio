#!/usr/bin/env python3
"""Create very small, optimized copies of project images for map markers.

Usage examples:
  python scripts/create_map_images.py --source client/public/images/Project
  python scripts/create_map_images.py --source client/public/images/Project --target client/public/images/Project-map --max-size 64 --quality 30

This script converts to WebP by default and keeps aspect ratio.
"""
from __future__ import annotations
import argparse
import os
from pathlib import Path
from typing import Iterable
from PIL import Image

SUPPORTED = {'.jpg', '.jpeg', '.png', '.webp', '.avif'}


def iter_images(src: Path) -> Iterable[Path]:
    for root, _, files in os.walk(src):
        for fn in files:
            p = Path(root) / fn
            if p.suffix.lower() in SUPPORTED:
                yield p


def make_target_path(src_path: Path, src_root: Path, target_root: Path) -> Path:
    rel = src_path.relative_to(src_root)
    # always use .webp for map images
    return (target_root / rel).with_suffix('.webp')


def process_image(src: Path, dst: Path, max_size: int, quality: int, dry_run: bool) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dry_run:
        print(f"[DRY] Would convert {src} -> {dst} (max={max_size}, q={quality})")
        return

    try:
        with Image.open(src) as im:
            im = im.convert('RGBA') if im.mode in ('LA', 'P') else im.convert('RGB')
            w, h = im.size
            scale = min(1.0, max_size / max(w, h))
            if scale < 1.0:
                new_size = (max(1, int(w * scale)), max(1, int(h * scale)))
                im = im.resize(new_size, Image.LANCZOS)

            # save as WebP; preserve transparency when present
            params = {'quality': quality}
            if 'A' in im.getbands():
                params['lossless'] = False

            dst_tmp = dst.with_suffix(dst.suffix + '.tmp')
            im.save(dst_tmp, format='WEBP', **params)
            dst_tmp.replace(dst)
            print(f"Wrote {dst}")
    except Exception as e:
        print(f"Error processing {src}: {e}")


def main() -> None:
    p = argparse.ArgumentParser(description='Create lightweight map copies of images')
    p.add_argument('--source', '-s', required=True, help='Source images root folder')
    p.add_argument('--target', '-t', help='Target folder (defaults to <source>-map)')
    p.add_argument('--max-size', type=int, default=64, help='Max width/height in pixels (default: 64)')
    p.add_argument('--scale', type=float, default=0.0, help='Scale factor as decimal (e.g. 0.5 for 50%%). If >0, overrides --max-size')
    p.add_argument('--quality', type=int, default=30, help='WebP quality 0-100 (default: 30)')
    p.add_argument('--dry-run', action='store_true', help='Show actions without writing files')
    p.add_argument('--max-files', type=int, default=0, help='Limit number of files to process (0 = all)')
    args = p.parse_args()

    src_root = Path(args.source)
    if not src_root.exists():
        raise SystemExit(f"Source folder does not exist: {src_root}")

    target_root = Path(args.target) if args.target else src_root.parent / (src_root.name + '-map')

    count = 0
    for src in iter_images(src_root):
        dst = make_target_path(src, src_root, target_root)
        # If scale provided (>0), resize by scale fraction; else use max_size logic
        if args.scale and args.scale > 0:
            try:
                with Image.open(src) as im_test:
                    w, h = im_test.size
            except Exception:
                w, h = (args.max_size, args.max_size)

            # compute a pseudo-max-size to pass to process_image while using scale
            # process_image will use max_size only if scale not used; so call process_image
            # with scale by temporarily resizing before saving: we'll add scale handling by
            # wrapping process_image behavior here.

            # Custom inline processing to honor scale without changing process_image signature
            dst.parent.mkdir(parents=True, exist_ok=True)
            if args.dry_run:
                print(f"[DRY] Would convert {src} -> {dst} (scale={args.scale}, q={args.quality})")
            else:
                try:
                    with Image.open(src) as im:
                        im = im.convert('RGBA') if im.mode in ('LA', 'P') else im.convert('RGB')
                        new_size = (max(1, int(w * args.scale)), max(1, int(h * args.scale)))
                        im = im.resize(new_size, Image.LANCZOS)
                        params = {'quality': args.quality}
                        if 'A' in im.getbands():
                            params['lossless'] = False
                        dst_tmp = dst.with_suffix(dst.suffix + '.tmp')
                        im.save(dst_tmp, format='WEBP', **params)
                        dst_tmp.replace(dst)
                        print(f"Wrote {dst}")
                except Exception as e:
                    print(f"Error processing {src}: {e}")
        else:
            process_image(src, dst, args.max_size, args.quality, args.dry_run)
        count += 1
        if args.max_files and count >= args.max_files:
            break

    print(f"Processed (or simulated) {count} files. Output folder: {target_root}")


if __name__ == '__main__':
    main()
