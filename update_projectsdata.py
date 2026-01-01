#!/usr/bin/env python3
"""
Update projectsData.ts to use new simple image filenames
"""

import json
import re
from pathlib import Path

# Load the mapping file
mapping_file = Path('image_rename_mapping.json')
with open(mapping_file, 'r', encoding='utf-8') as f:
    mapping_data = json.load(f)

rename_map = mapping_data['rename_map']

# Read projectsData.ts
projects_file = Path('client/src/data/projectsData.ts')
content = projects_file.read_text(encoding='utf-8')

# Create reverse mapping (old -> new)
old_to_new = rename_map

# Replace all old image names with new ones
print("=" * 80)
print("UPDATING projectsData.ts WITH NEW IMAGE FILENAMES")
print("=" * 80)

count = 0
for old_name, new_name in sorted(old_to_new.items()):
    # Skip names that are already simple (no special chars)
    if not (any(ord(c) > 127 for c in old_name) or ' ' in old_name):
        continue
    
    # Create pattern to find imagePath('old_name')
    pattern = f"imagePath\\('{re.escape(old_name)}'\\)"
    replacement = f"imagePath('{new_name}')"
    
    new_content = re.sub(pattern, replacement, content)
    
    if new_content != content:
        count += 1
        print(f"✓ {old_name[:50]:50s} → {new_name}")
        content = new_content

print(f"\n✅ Total replacements: {count}")

# Write back to projectsData.ts
projects_file.write_text(content, encoding='utf-8')
print(f"📄 Updated: {projects_file}")

print("\n" + "=" * 80)
print("VERIFICATION: Checking for old filenames still in code")
print("=" * 80)

# Check if any old names are still in the file
remaining = []
for old_name in old_to_new.keys():
    if any(ord(c) > 127 for c in old_name) or ' ' in old_name:
        if old_name in content:
            remaining.append(old_name)

if remaining:
    print(f"\n⚠️  Found {len(remaining)} remaining old filenames:")
    for name in remaining[:5]:
        print(f"  - {name[:60]}")
else:
    print("\n✅ No old filenames found - all successfully replaced!")

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print(f"Total image references updated: {count}")
print(f"File saved: client/src/data/projectsData.ts")
