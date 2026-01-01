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

# Show preview before renaming
print("\n📋 PREVIEW OF RENAMES:\n")
for old_name, new_name in sorted(rename_map.items()):
    if any(ord(c) > 127 for c in old_name) or ' ' in old_name:
        print(f"  {old_name[:60]:60s} → {new_name}")

# Ask for confirmation
count_special = sum(1 for name in rename_map.keys() if any(ord(c) > 127 for c in name) or ' ' in name)
print(f"\n📁 Files to rename: {count_special}")

confirm = input("\nProceed with renaming? (yes/no): ")

if confirm.lower() == 'yes':
    print("\n⏳ Renaming files...\n")
    
    success_count = 0
    for old_name, new_name in rename_map.items():
        old_path = IMAGES_DIR / old_name
        new_path = IMAGES_DIR / new_name
        
        try:
            # Don't overwrite if file already exists with new name
            if not new_path.exists():
                shutil.move(str(old_path), str(new_path))
                success_count += 1
                print(f"  ✓ {new_name}")
            else:
                print(f"  ⊘ {new_name} (already exists)")
        except Exception as e:
            print(f"  ✗ {new_name} - Error: {e}")
    
    print(f"\n✅ Renamed {success_count} files successfully")
    
    # Generate mapping file for projectsData.ts update
    print("\n" + "=" * 80)
    print("MAPPING FOR projectsData.ts")
    print("=" * 80)
    
    # Group by project
    grouped = defaultdict(list)
    for old_name, new_name in sorted(rename_map.items()):
        # Extract project ID
        parts = old_name.split('-')
        if len(parts) >= 2:
            project_id = f"{parts[0]}-{parts[1]}"
            grouped[project_id].append((old_name, new_name))
    
    # Print mapping by project
    for project_id in sorted(grouped.keys()):
        print(f"\n{project_id}:")
        for old_name, new_name in grouped[project_id]:
            print(f"  imagePath('{new_name}'),")
    
    # Save mapping to JSON for reference
    import json
    mapping_file = Path('image_rename_mapping.json')
    with open(mapping_file, 'w', encoding='utf-8') as f:
        json.dump({
            'rename_map': rename_map,
            'grouped_by_project': {k: [(o, n) for o, n in v] for k, v in grouped.items()}
        }, f, ensure_ascii=False, indent=2)
    
    print(f"\n📄 Mapping saved to: {mapping_file}")
    
else:
    print("Cancelled.")
