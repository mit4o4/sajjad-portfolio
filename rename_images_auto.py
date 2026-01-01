#!/usr/bin/env python3
"""
Rename image files to simple names (without Arabic characters or spaces)
This fixes browser loading issues with special characters
"""

import os
import shutil
from pathlib import Path
from collections import defaultdict

# Define images directory
IMAGES_DIR = Path('client/public/images/Project')

# Map of old filenames to new simple filenames
rename_map = {}
project_image_count = defaultdict(int)

print("=" * 80)
print("RENAMING IMAGES TO SIMPLE NAMES (No Arabic, No Spaces)")
print("=" * 80)

# Get all webp files
all_files = sorted(IMAGES_DIR.glob('*.webp'))

# Create mapping for simple names
for old_file in all_files:
    old_name = old_file.name
    
    # Extract project ID (first part before dash)
    parts = old_name.split('-')
    if len(parts) >= 2:
        project_id = f"{parts[0]}-{parts[1]}"  # e.g., "00A-0130"
    else:
        project_id = old_name.split('_')[0]
    
    # Increment counter for this project
    project_image_count[project_id] += 1
    count = project_image_count[project_id]
    
    # Create simple new name
    new_name = f"{project_id}-{count}.webp"
    rename_map[old_name] = new_name

# Show files with special characters
print("\n📋 FILES WITH SPECIAL CHARACTERS TO RENAME:\n")
special_files = []
for old_name in sorted(rename_map.keys()):
    if any(ord(c) > 127 for c in old_name) or ' ' in old_name:
        special_files.append(old_name)
        new_name = rename_map[old_name]
        print(f"  {old_name[:50]:50s} → {new_name}")

print(f"\n📁 Total files to rename: {len(special_files)}")
print(f"Total files in directory: {len(rename_map)}")

# Proceed without asking (automated)
print("\n⏳ Starting rename process...\n")

success_count = 0
skipped_count = 0
error_count = 0

for old_name, new_name in rename_map.items():
    old_path = IMAGES_DIR / old_name
    new_path = IMAGES_DIR / new_name
    
    # Skip if no special characters (already simple names)
    if not (any(ord(c) > 127 for c in old_name) or ' ' in old_name):
        continue
    
    try:
        if old_path.exists():
            if not new_path.exists():
                shutil.move(str(old_path), str(new_path))
                success_count += 1
                print(f"✓ {new_name}")
            else:
                skipped_count += 1
                print(f"⊘ {new_name} (already exists)")
        else:
            print(f"✗ {new_name} (source not found)")
            error_count += 1
    except Exception as e:
        error_count += 1
        print(f"✗ {new_name} - Error: {e}")

print(f"\n✅ Success: {success_count}")
print(f"⊘ Skipped: {skipped_count}")
print(f"✗ Errors: {error_count}")

# Generate mapping file for projectsData.ts update
print("\n" + "=" * 80)
print("MAPPING FOR projectsData.ts (First 5 projects as example)")
print("=" * 80)

# Group by project
grouped = defaultdict(list)
for old_name, new_name in sorted(rename_map.items()):
    # Extract project ID
    parts = old_name.split('-')
    if len(parts) >= 2:
        project_id = f"{parts[0]}-{parts[1]}"
        grouped[project_id].append((old_name, new_name))

# Print first few projects as example
for i, project_id in enumerate(sorted(grouped.keys())):
    if i >= 5:
        break
    print(f"\n{project_id}:")
    for old_name, new_name in grouped[project_id][:3]:
        print(f"  imagePath('{new_name}'),")
    if len(grouped[project_id]) > 3:
        print(f"  ... ({len(grouped[project_id]) - 3} more)")

# Save mapping to JSON for reference
import json
mapping_file = Path('image_rename_mapping.json')
with open(mapping_file, 'w', encoding='utf-8') as f:
    json.dump({
        'rename_map': rename_map,
        'grouped_by_project': {k: [(o, n) for o, n in v] for k, v in grouped.items()}
    }, f, ensure_ascii=False, indent=2)

print(f"\n📄 Complete mapping saved to: image_rename_mapping.json")
print(f"📊 Total unique projects: {len(grouped)}")

# List all projects and their image counts
print("\n" + "=" * 80)
print("SUMMARY BY PROJECT")
print("=" * 80)
for project_id in sorted(grouped.keys()):
    images = grouped[project_id]
    print(f"{project_id}: {len(images)} images")
