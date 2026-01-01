#!/usr/bin/env python3
import json
from pathlib import Path
import re

root = Path(r'C:/Users/sajja/Downloads/sajjad-portfolio')
projects_file = root / 'client' / 'src' / 'data' / 'projectsData.ts'
mapping_file = root / 'image_rename_mapping.json'
backup = projects_file.with_suffix('.ts.bak2')

with open(mapping_file, 'r', encoding='utf-8') as f:
    data = json.load(f)
    rename_map = data.get('rename_map', data) if isinstance(data, dict) else {}

text = projects_file.read_text(encoding='utf-8')
# Backup
backup.write_text(text, encoding='utf-8')

# Sort keys by length desc to avoid partial replacements
keys = sorted(rename_map.keys(), key=len, reverse=True)
replacements = 0
for old in keys:
    new = rename_map[old]
    # Escape for regex
    old_esc = re.escape(old)
    # Replace inside imagePath('...') or any quoted occurrence
    pattern = re.compile(r"(['\"])" + old_esc + r"\1")
    # replacement should keep same quote; use a function
    def repl(m):
        q = m.group(1)
        return f"{q}{new}{q}"
    new_text, count = pattern.subn(repl, text)
    if count:
        replacements += count
        text = new_text

if replacements:
    projects_file.write_text(text, encoding='utf-8')

print(f'Replacements applied: {replacements}')

# Save a small summary file
summary = root / 'apply_rename_summary.json'
summary.write_text(json.dumps({'replacements': replacements}, indent=2), encoding='utf-8')
print('Summary saved to', summary)
