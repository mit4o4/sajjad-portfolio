#!/usr/bin/env python3
import re
from pathlib import Path
import json

root = Path(r'C:/Users/sajja/Downloads/sajjad-portfolio')
images_dir = root / 'client' / 'public' / 'images' / 'Project'
mapping_file = root / 'image_rename_mapping.json'

files = [p for p in images_dir.iterdir() if p.is_file()]
proj_groups = {}
for p in files:
    m = re.search(r'(00A-\d{3,4})', p.name)
    if m:
        pid = m.group(1)
        proj_groups.setdefault(pid, []).append(p)

full_map = {}

for pid, plist in proj_groups.items():
    plist_sorted = sorted(plist, key=lambda x: x.name)
    temps = []
    # rename to temp to avoid collisions
    for i, p in enumerate(plist_sorted, start=1):
        temp = p.with_name(p.name + '.renametmp')
        p.rename(temp)
        temps.append(temp)
    # now rename temps to final sequential names
    for i, temp in enumerate(temps, start=1):
        ext = temp.suffix.replace('.renametmp','')
        # original extension before .renametmp
        # compute original ext
        orig_name = temp.name[:-len('.renametmp')]
        orig_ext = Path(orig_name).suffix.lstrip('.')
        final_name = f'{pid}-{i}.{orig_ext}'
        final_path = images_dir / final_name
        # ensure unique
        if final_path.exists():
            # find next
            j = 1
            while (images_dir / f'{pid}-{i+j}.{orig_ext}').exists():
                j += 1
            final_path = images_dir / f'{pid}-{i+j}.{orig_ext}'
        temp.rename(final_path)
        full_map[orig_name] = final_name

# write mapping
mapping_file.write_text(json.dumps({'rename_map': full_map}, indent=2, ensure_ascii=False), encoding='utf-8')
(root / 'force_renumber_summary.json').write_text(json.dumps({'renamed': len(full_map)}, indent=2, ensure_ascii=False), encoding='utf-8')
print('Force renumber complete. Files renamed:', len(full_map))
print('Mapping saved to', mapping_file)
