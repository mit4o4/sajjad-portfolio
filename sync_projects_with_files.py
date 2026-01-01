#!/usr/bin/env python3
import re
from pathlib import Path
import json

root = Path(r'C:/Users/sajja/Downloads/sajjad-portfolio')
projects_file = root / 'client' / 'src' / 'data' / 'projectsData.ts'
images_dir = root / 'client' / 'public' / 'images' / 'Project'
backup = projects_file.with_suffix('.ts.syncbak')

text = projects_file.read_text(encoding='utf-8')
backup.write_text(text, encoding='utf-8')

project_pattern = re.compile(r"\{\s*id:\s*['\"](00A-\d+)['\"](?P<body>.*?)\n\s*\},", re.DOTALL)
allimages_pat = re.compile(r"allImages:\s*\[([^\]]*)\]", re.DOTALL)
imagepath = lambda n: f"imagePath('{n}')"

changes = []

for m in project_pattern.finditer(text):
    pid = m.group(1)
    body = m.group('body')
    # find files in images_dir for pid
    files = sorted([p.name for p in images_dir.iterdir() if p.is_file() and p.name.startswith(pid + '-')],
                   key=lambda x: int(re.search(rf'{pid}-(\d+)', x).group(1)) if re.search(rf'{pid}-(\d+)', x) else 0)
    if not files:
        continue
    # build new allImages block
    imgs_lines = ",\n        ".join([imagepath(fn) for fn in files])
    new_all = f"allImages: [\n        {imgs_lines}\n      ]"

    # replace existing allImages in the project's body
    # find the location of allImages within body's text
    body_start = m.start('body')
    # search within body
    ai = allimages_pat.search(body)
    if ai:
        old_block = ai.group(0)
        new_body = body.replace(old_block, new_all, 1)
    else:
        # insert new_all before last newline
        insert_point = len(body)
        new_body = body[:insert_point] + '\n      ' + new_all + body[insert_point:]

    # ensure image field points to first file
    first_img = files[0]
    # replace or insert image: imagePath('...')
    img_field_pat = re.compile(r"image:\s*imagePath\(['\"][^'\"]+['\"]\)")
    if img_field_pat.search(new_body):
        new_body = img_field_pat.sub(f"image: imagePath('{first_img}')", new_body, count=1)
    else:
        # insert image line near start of body (after titleAr or so). We'll place after titleAr if exists
        titleAr_pat = re.compile(r"titleAr:\s*['\"].*?['\"],")
        tm = titleAr_pat.search(new_body)
        if tm:
            idx = tm.end()
            new_body = new_body[:idx] + '\n    image: imagePath(\'' + first_img + '\'),' + new_body[idx:]
        else:
            new_body = "\n    image: imagePath('" + first_img + "')," + new_body

    orig_block = m.group(0)
    new_block = orig_block.replace(body, new_body)
    text = text.replace(orig_block, new_block, 1)
    changes.append({'project': pid, 'new_images': files, 'cover': first_img})

# write back
projects_file.write_text(text, encoding='utf-8')
(root / 'sync_projects_summary.json').write_text(json.dumps({'projects_updated': len(changes)}, indent=2, ensure_ascii=False), encoding='utf-8')
print('Sync complete. Projects updated:', len(changes))
print('Summary saved to sync_projects_summary.json')
