#!/usr/bin/env python3
import re
import json
from pathlib import Path
from datetime import datetime

root = Path(r'C:/Users/sajja/Downloads/sajjad-portfolio')
projects_file = root / 'client' / 'src' / 'data' / 'projectsData.ts'
images_dir = root / 'client' / 'public' / 'images' / 'Project'
backup = projects_file.with_name(projects_file.name + '.synccoordsbak.' + datetime.now().strftime('%Y%m%d%H%M%S'))
backup.write_text(projects_file.read_text(encoding='utf-8'), encoding='utf-8')

# Load coordinate map from apply_coordinates.py (we'll import by reading file)
coords = {}
apply_py = root / 'apply_coordinates.py'
if apply_py.exists():
    text = apply_py.read_text(encoding='utf-8')
    # crude parse of coords_map dict
    m = re.search(r"coords_map\s*=\s*\{([\s\S]*?)\}\n", text)
    if m:
        body = m.group(1)
        # find lines like '  '00A-0084': (32.0392, 44.3483),'
        for line in body.splitlines():
            lm = re.search(r"['\"](00A-\d{4})['\"]\s*:\s*\(([^,]+)\s*,\s*([^\)]+)\)", line)
            if lm:
                pid = lm.group(1)
                lat = float(lm.group(2).strip())
                lng = float(lm.group(3).strip())
                coords[pid] = (lat, lng)

# Also accept a JSON mapping file if present
json_coords = root / 'apply_coordinates_summary.json'
if json_coords.exists():
    try:
        data = json.loads(json_coords.read_text(encoding='utf-8'))
        # this file only has updated_projects; ignore
    except Exception:
        pass

# Build filesystem image groups
files = [p for p in images_dir.iterdir() if p.is_file()]
proj_files = {}
for p in files:
    m = re.match(r'(00A-\d{4})[-_\s]?.*', p.name)
    if m:
        pid = m.group(1)
        proj_files.setdefault(pid, []).append(p.name)

# parse projectsData.ts into project blocks
content = projects_file.read_text(encoding='utf-8')
proj_pattern = re.compile(r"(\{\s*id:\s*['\"](00A-\d{4})['\"][\s\S]*?\n\s*\},)", re.DOTALL)

updated = []
inserted_coords = []

for m in proj_pattern.finditer(content):
    block = m.group(0)
    pid = m.group(2)
    changed = False
    # Sync allImages with filesystem if we have files
    if pid in proj_files:
        files_list = sorted(proj_files[pid])
        # build new allImages block
        images_lines = ",\n      ".join([f"imagePath('{fn}')" for fn in files_list])
        new_all = f"allImages: [\n      {images_lines}\n    ]"
        # replace existing allImages if present
        if 'allImages:' in block:
            block_new = re.sub(r"allImages:\s*\[[^\]]*\]", new_all, block, flags=re.DOTALL)
        else:
            # insert before the closing of object
            block_new = block.replace('\n  },', f"\n    {new_all}\n  }},")
        # ensure image (cover) is first file
        first = files_list[0]
        if 'image:' in block_new:
            block_new = re.sub(r"image:\s*imagePath\(['\"][^'\"]+['\"]\)", f"image: imagePath('{first}')", block_new, count=1)
        else:
            # insert after titleAr if exists
            ta = re.search(r"titleAr:\s*['\"][^'\"]+['\"],", block_new)
            if ta:
                idx = ta.end()
                block_new = block_new[:idx] + f"\n    image: imagePath('{first}')," + block_new[idx:]
            else:
                block_new = block_new.replace('\n  },', f"\n    image: imagePath('{first}'),\n  }},")
        if block_new != block:
            content = content.replace(block, block_new, 1)
            changed = True
            updated.append({'project': pid, 'files_count': len(files_list)})
    # Insert coordinates if in coords map and not present
    if pid in coords:
        lat,lng = coords[pid]
        if 'coordinates:' not in content[m.start():m.end()]:
            # find block inside updated content (re-find)
            # build insertion: coordinates: { lat: X, lng: Y },
            insertion = f"\n    coordinates: {{ lat: {lat}, lng: {lng} }},"
            # insert before closing of object
            # find the current block again robustly by pid
            block2_match = re.search(r"(\{\s*id:\s*['\"]" + re.escape(pid) + r"['\"][\s\S]*?\n\s*\},)", content, re.DOTALL)
            if block2_match:
                block2 = block2_match.group(0)
                block2_new = block2.replace('\n  },', insertion + '\n  },')
                content = content.replace(block2, block2_new, 1)
                inserted_coords.append(pid)

# write back
projects_file.write_text(content, encoding='utf-8')
summary = {
    'updated_projects_images': updated,
    'inserted_coordinates': inserted_coords,
    'projects_with_no_files_found': [p for p in coords.keys() if p not in proj_files]
}
(root / 'sync_coords_images_summary.json').write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding='utf-8')
print('Done. Summary written to sync_coords_images_summary.json')
print('Updated projects:', len(updated))
print('Inserted coords:', len(inserted_coords))
