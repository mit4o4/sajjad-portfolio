#!/usr/bin/env python3
from pathlib import Path
import re
import json

root = Path(r'C:/Users/sajja/Downloads/sajjad-portfolio')
projects_file = root / 'client' / 'src' / 'data' / 'projectsData.ts'
images_dir = root / 'client' / 'public' / 'images' / 'Project'
backup = projects_file.with_name(projects_file.name + '.bak64_65b')
backup.write_text(projects_file.read_text(encoding='utf-8'), encoding='utf-8')

pid = '00A-0064'
text = projects_file.read_text(encoding='utf-8')
# get 0064 files
files = sorted([p.name for p in images_dir.iterdir() if p.is_file() and p.name.startswith(pid + '-')], key=lambda x: x)
# get unique files already referenced in the 0064 block
proj_block_pat = re.compile(rf"(\{{\s*id:\s*['\"]{pid}['\"][\s\S]*?\n\s*\}},)", re.DOTALL)
m = proj_block_pat.search(text)
if not m:
    print('Project block not found')
    raise SystemExit(1)
block = m.group(0)
# find all references to 00A-0065-* inside block
refs = re.findall(r"00A-0065-[^'\)\,\s]+", block)
refs = list(dict.fromkeys(refs))
print('Found refs to replace:', refs)
# prepare candidate replacements = files not already present in block
existing = set(re.findall(r"00A-0064-[^'\)\,\s]+", block))
candidates = [f for f in files if f not in existing]
if len(candidates) < len(refs):
    print('Not enough candidates to replace; will reuse if needed')

new_block = block
replacements = {}
for i, ref in enumerate(refs):
    if i < len(candidates):
        new = candidates[i]
    else:
        new = candidates[-1] if candidates else ref
    replacements[ref] = new
    new_block = new_block.replace(ref, new)

# write back
text = text.replace(block, new_block, 1)
projects_file.write_text(text, encoding='utf-8')
(root / 'replace_0065_in_0064_mapping.json').write_text(json.dumps(replacements, indent=2, ensure_ascii=False), encoding='utf-8')
print('Replacements applied:', replacements)
