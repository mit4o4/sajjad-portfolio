#!/usr/bin/env python3
import re
import json
from pathlib import Path
root = Path(r'C:/Users/sajja/Downloads/sajjad-portfolio')
projects_file = root / 'client' / 'src' / 'data' / 'projectsData.ts'
images_dir = root / 'client' / 'public' / 'images' / 'Project'

content = projects_file.read_text(encoding='utf-8')
imagepath_pat = re.compile(r"imagePath\(['\"]([^'\"]+)['\"]\)")
project_pat = re.compile(r"\{\s*id:\s*['\"](00A-\d+)['\"].*?\n\s*\},", re.DOTALL)

all_image_refs = imagepath_pat.findall(content)
missing = []
missing_by_project = {}

for m in project_pat.finditer(content):
    proj_id = m.group(1)
    block = m.group(0)
    imgs = imagepath_pat.findall(block)
    missing_imgs = [img for img in imgs if not (images_dir / img).exists()]
    if missing_imgs:
        missing_by_project[proj_id] = missing_imgs
        missing.extend([(proj_id, img) for img in missing_imgs])

out = root / 'project_image_check.json'
res = {
    'total_image_references': len(all_image_refs),
    'unique_images': len(set(all_image_refs)),
    'missing_total': len(missing),
    'missing_by_project': missing_by_project
}
out.write_text(json.dumps(res, indent=2, ensure_ascii=False), encoding='utf-8')
print('Verification complete. Missing total:', res['missing_total'])
print('Mapping saved to', out)
