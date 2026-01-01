#!/usr/bin/env python3
import re
from pathlib import Path
import json

root = Path(r'C:/Users/sajja/Downloads/sajjad-portfolio')
images_dir = root / 'client' / 'public' / 'images' / 'Project'
mapping_file = root / 'image_rename_mapping.json'

# Load existing mapping if present
if mapping_file.exists():
    data = json.loads(mapping_file.read_text(encoding='utf-8'))
    rename_map = data.get('rename_map', {})
else:
    rename_map = {}

# Collect files grouped by project id
files = [p for p in images_dir.iterdir() if p.is_file()]
proj_groups = {}
for p in files:
    m = re.search(r'(00A-\d{3,4})', p.name)
    if m:
        pid = m.group(1)
        proj_groups.setdefault(pid, []).append(p)

new_mappings = {}

for pid, plist in proj_groups.items():
    # find existing sanitized indices
    sanitized = []
    others = []
    for p in plist:
        m2 = re.match(rf'{re.escape(pid)}-(\d+)\.(webp|jpg|jpeg)$', p.name, re.IGNORECASE)
        if m2:
            sanitized.append((int(m2.group(1)), p))
        else:
            others.append(p)
    used = {i for i,_ in sanitized}
    next_idx = max(used) + 1 if used else 1
    # rename others to next available indexes
    for p in sorted(others, key=lambda x: x.name):
        ext = p.suffix.lower().lstrip('.')
        new_name = f'{pid}-{next_idx}.{ext}'
        new_path = images_dir / new_name
        # avoid overwriting
        if new_path.exists():
            # find next unused
            while new_path.exists():
                next_idx += 1
                new_name = f'{pid}-{next_idx}.{ext}'
                new_path = images_dir / new_name
        try:
            p.rename(new_path)
            new_mappings[p.name] = new_name
            next_idx += 1
        except Exception as e:
            print('Failed to rename', p, e)

# Merge into rename_map and save
rename_map.update(new_mappings)
(mapping_file).write_text(json.dumps({'rename_map': rename_map}, indent=2, ensure_ascii=False), encoding='utf-8')
print('Normalization complete. New mappings:', len(new_mappings))
# save summary
(root / 'normalize_summary.json').write_text(json.dumps({'new_mappings': new_mappings}, indent=2, ensure_ascii=False), encoding='utf-8')
print('Summary saved to normalize_summary.json')