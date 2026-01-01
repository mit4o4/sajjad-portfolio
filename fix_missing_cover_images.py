#!/usr/bin/env python3
import re
import os
import json
from pathlib import Path
from datetime import datetime

root = Path(r'C:/Users/sajja/Downloads/sajjad-portfolio')
projects_file = root / 'client' / 'src' / 'data' / 'projectsData.ts'
images_dir = root / 'client' / 'public' / 'images' / 'Project'
backup_file = projects_file.with_name('projectsData.ts.bak.' + datetime.now().strftime('%Y%m%d%H%M%S'))

with open(projects_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Backup
with open(backup_file, 'w', encoding='utf-8') as f:
    f.write(content)
print(f'Backup created at: {backup_file}')

project_pattern = re.compile(r"\{\s*id:\s*['\"](00A-\d+)['\"](?P<body>.*?)\n\s*\},", re.DOTALL)
imagepath_pat = re.compile(r"imagePath\(['\"]([^'\"]+)['\"]\)")
allimages_pat = re.compile(r"allImages:\s*\[([^\]]*)\]", re.DOTALL)

changes = []
missing_projects = []

for m in project_pattern.finditer(content):
    proj_id = m.group(1)
    body = m.group('body')

    # find cover image in body
    img_match = imagepath_pat.search(body)
    current_image = img_match.group(1) if img_match else None

    def exists(name):
        p = images_dir / name
        return p.exists()

    cover_ok = current_image and exists(current_image)
    if cover_ok:
        continue

    # not ok -> try to find replacement from allImages
    all_match = allimages_pat.search(body)
    replacement = None
    if all_match:
        imgs_block = all_match.group(1)
        imgs = imagepath_pat.findall(imgs_block)
        for im in imgs:
            if exists(im):
                replacement = im
                break

    # if still not found, search filesystem for any file starting with proj_id-
    if not replacement:
        candidates = sorted([p.name for p in images_dir.iterdir() if p.is_file() and p.name.startswith(proj_id + '-')])
        if candidates:
            replacement = candidates[0]

    if replacement:
        # Replace the first imagePath(...) occurrence in the project's body (the image field)
        # Build new body
        if img_match:
            old_expr = img_match.group(0)
            new_expr = f"imagePath('{replacement}')"
            new_body = body.replace(old_expr, new_expr, 1)
        else:
            # No image field present; add image: imagePath('...'), before category or description
            insert_point = None
            # try to find 'category:' position
            cat_match = re.search(r"\n\s*category:\s*['\"].*?['\"]", body)
            if cat_match:
                insert_point = cat_match.start()
            else:
                # fallback: insert at start of body
                insert_point = 0
            new_body = body[:insert_point] + "\n    image: imagePath('%s')," % replacement + body[insert_point:]

        # Replace this project's original block in content
        orig_block = m.group(0)
        new_block = orig_block.replace(body, new_body)
        content = content.replace(orig_block, new_block, 1)
        changes.append({'project': proj_id, 'replacement': replacement, 'previous': current_image})
    else:
        missing_projects.append(proj_id)

# Write changes if any
if changes:
    with open(projects_file, 'w', encoding='utf-8') as f:
        f.write(content)

mapping = {
    'timestamp': datetime.now().isoformat(),
    'changes': changes,
    'missing_projects': missing_projects
}

out = root / 'project_image_fixes.json'
with open(out, 'w', encoding='utf-8') as f:
    json.dump(mapping, f, indent=2, ensure_ascii=False)

print(f"Done. Changes: {len(changes)}. Missing projects with no images found: {len(missing_projects)}")
print(f"Mapping saved to: {out}")
