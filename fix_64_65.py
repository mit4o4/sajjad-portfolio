#!/usr/bin/env python3
from pathlib import Path
import re
import json

root = Path(r'C:/Users/sajja/Downloads/sajjad-portfolio')
projects_file = root / 'client' / 'src' / 'data' / 'projectsData.ts'
images_dir = root / 'client' / 'public' / 'images' / 'Project'
backup = projects_file.with_name(projects_file.name + '.bak64_65')
backup.write_text(projects_file.read_text(encoding='utf-8'), encoding='utf-8')

pids = ['00A-0064','00A-0065']
text = projects_file.read_text(encoding='utf-8')

for pid in pids:
    files = sorted([p.name for p in images_dir.iterdir() if p.is_file() and p.name.startswith(pid + '-')],
                   key=lambda x: int(re.search(rf'{pid}-(\d+)', x).group(1)) if re.search(rf'{pid}-(\d+)', x) else 0)
    if not files:
        print(f'No files for {pid}, skipping')
        continue
    # build new allImages block
    def imagePath(name):
        return f"imagePath('{name}')"
    imgs_lines = ",\n          ".join([imagePath(fn) for fn in files])
    new_all = f"allImages: [\n          {imgs_lines}\n        ]"
    # replace project's allImages block
    proj_pattern = re.compile(rf"(\{{\s*id:\s*['\"]{pid}['\"][^\}}]*?)allImages:\s*\[[^\]]*\]", re.DOTALL)
    m = proj_pattern.search(text)
    if m:
        start, end = m.span()
        prefix = m.group(1)
        new_block = prefix + new_all
        text = text[:start] + new_block + text[end:]
    else:
        # try to insert before the closing of project object (before \n  },)
        proj_block_pat = re.compile(rf"(\{{\s*id:\s*['\"]{pid}['\"][^\}}]*?)\n\s*\}},", re.DOTALL)
        mm = proj_block_pat.search(text)
        if mm:
            block_start, block_end = mm.span(1)
            body = mm.group(1)
            # add new_all at end of body
            new_body = body + '\n        ' + new_all
            text = text[:block_start] + new_body + text[block_end:]
        else:
            print(f'Could not find project block for {pid}')
            continue
    # set cover image to first file
    first = files[0]
    img_field_pat = re.compile(rf"(id:\s*['\"]{pid}['\"][\s\S]*?)image:\s*imagePath\(['\"][^'\"]+['\"]\)", re.DOTALL)
    mi = img_field_pat.search(text)
    if mi:
        new_segment = mi.group(1) + f"image: imagePath('{first}')"
        text = text[:mi.start()] + new_segment + text[mi.end():]
    else:
        # insert image line after titleAr
        titleAr_pat = re.compile(rf"(id:\s*['\"]{pid}['\"][\s\S]*?titleAr:\s*['\"][^'\"]*['\"]))", re.DOTALL)
        m2 = titleAr_pat.search(text)
        if m2:
            insert_pos = m2.end()
            text = text[:insert_pos] + f"\n    image: imagePath('{first}')," + text[insert_pos:]

# write back
projects_file.write_text(text, encoding='utf-8')
print('Updated projectsData.ts for', pids)

# Save per-project summary
summary = {pid: sorted([p.name for p in images_dir.iterdir() if p.is_file() and p.name.startswith(pid + '-')]) for pid in pids}
(root / 'fix_64_65_summary.json').write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding='utf-8')
print('Summary written to fix_64_65_summary.json')
