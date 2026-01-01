#!/usr/bin/env python3
import os
import re
import json
from pathlib import Path
from collections import defaultdict

# Paths
project2_dir = r'C:\Users\sajja\Downloads\sajjad-portfolio\client\public\images\Project\Project 2'
main_project_dir = r'C:\Users\sajja\Downloads\sajjad-portfolio\client\public\images\Project'
projectsdata_path = r'C:\Users\sajja\Downloads\sajjad-portfolio\client\src\data\projectsData.ts'

# Dictionary to track project IDs and their current image counts
project_image_counts = defaultdict(int)

# Step 1: Count existing images for each project
print("Step 1: Counting existing images...")
for file in os.listdir(main_project_dir):
    if file.startswith('00A-') and file[0:8] not in ['Project-', 'Project ']:
        # Extract project ID (e.g., "00A-0060" from "00A-0060-1.webp")
        match = re.match(r'(00A-\d+)', file)
        if match:
            project_id = match.group(1)
            # Extract sequence number from name
            seq_match = re.search(r'-(\d+)\.(webp|jpg)$', file)
            if seq_match:
                seq_num = int(seq_match.group(1))
                if seq_num > project_image_counts[project_id]:
                    project_image_counts[project_id] = seq_num

print(f"Found {len(project_image_counts)} projects with existing images")
print("Sample counts:", dict(list(project_image_counts.items())[:5]))

# Step 2: Process Project 2 folder
print("\nStep 2: Processing Project 2 folder...")
project2_files = sorted([f for f in os.listdir(project2_dir) if f.endswith(('.webp', '.jpg'))])

# Dictionary to track mappings and files to move
move_operations = []

for file in project2_files:
    # Extract project ID from filename
    match = re.match(r'(00A-\d+)', file)
    if match:
        project_id = match.group(1)
        
        # Get next sequence number for this project
        project_image_counts[project_id] += 1
        seq_num = project_image_counts[project_id]
        
        # Get file extension
        ext = file.split('.')[-1]
        
        # New filename
        new_filename = f'{project_id}-{seq_num}.{ext}'
        
        # Store operation
        old_path = os.path.join(project2_dir, file)
        new_path = os.path.join(main_project_dir, new_filename)
        
        move_operations.append({
            'old_file': file,
            'old_path': old_path,
            'new_file': new_filename,
            'new_path': new_path,
            'project_id': project_id,
            'seq_num': seq_num
        })

print(f"Prepared {len(move_operations)} files for moving/renaming")
print("Sample operations:", move_operations[:3])

# Step 3: Perform the moves/renames
print("\nStep 3: Moving and renaming files...")
success_count = 0
error_count = 0

for op in move_operations:
    try:
        os.rename(op['old_path'], op['new_path'])
        success_count += 1
        if success_count % 20 == 0:
            print(f"  Processed {success_count}/{len(move_operations)}...")
    except Exception as e:
        print(f"  ERROR: {op['old_file']} -> {op['new_file']}: {e}")
        error_count += 1

print(f"\nMove/Rename Results: Success={success_count}, Errors={error_count}")

# Step 4: Update projectsData.ts
print("\nStep 4: Updating projectsData.ts...")

# Read the file
with open(projectsdata_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Group move operations by project ID
updates_by_project = defaultdict(list)
for op in move_operations:
    updates_by_project[op['project_id']].append(op['new_file'])

# For each project, find its allImages array and add the new images
updated_content = content
replacements_made = 0

for project_id in sorted(updates_by_project.keys()):
    new_images = updates_by_project[project_id]
    
    # Find the project entry
    project_pattern = rf"id:\s*['\"]({project_id})['\"]"
    
    if re.search(project_pattern, updated_content):
        # Find the allImages array for this project
        # Pattern: look for "id: 'PROJECT_ID'" then find the nearest "allImages: ["
        
        # Find project ID position
        id_match = re.search(project_pattern, updated_content)
        if id_match:
            id_pos = id_match.start()
            
            # Find allImages after this position
            search_after = updated_content[id_pos:]
            allimages_match = re.search(r'allImages:\s*\[\s*([^\]]*)\s*\]', search_after, re.DOTALL)
            
            if allimages_match:
                old_images_str = allimages_match.group(1).strip()
                
                # Parse existing images
                existing_images = [m.group(1) for m in re.finditer(r"imagePath\(['\"]([^'\"]+)['\"]\)", old_images_str)]
                
                # Add new images
                for new_image in new_images:
                    if new_image not in existing_images:
                        existing_images.append(new_image)
                
                # Build new allImages string
                new_images_lines = ",\n        ".join([f"imagePath('{img}')" for img in existing_images])
                new_allimages_str = f"allImages: [\n        {new_images_lines}\n      ]"
                
                # Find the full allImages pattern in the original content
                # We need to find it relative to the actual file position
                full_pattern = rf"({project_pattern}[^{{]*?allImages:\s*\[\s*[^\]]*\s*\])"
                
                def replace_allimages(match):
                    global replacements_made
                    replacements_made += 1
                    full_text = match.group(0)
                    # Replace only the allImages part
                    return re.sub(r'allImages:\s*\[\s*[^\]]*\s*\]', new_allimages_str, full_text)
                
                updated_content = re.sub(full_pattern, replace_allimages, updated_content, count=1, flags=re.DOTALL)

print(f"Updated {replacements_made} projects with new images")

# Write the updated content back
with open(projectsdata_path, 'w', encoding='utf-8') as f:
    f.write(updated_content)

print("projectsData.ts has been updated successfully!")

# Step 5: Create mapping file for reference
mapping = {
    'total_files_processed': len(move_operations),
    'successful_moves': success_count,
    'errors': error_count,
    'updates_made': replacements_made,
    'files_by_project': {
        project_id: [op['new_file'] for op in move_operations if op['project_id'] == project_id]
        for project_id in sorted(updates_by_project.keys())
    }
}

mapping_file = r'C:\Users\sajja\Downloads\sajjad-portfolio\project2_mapping.json'
with open(mapping_file, 'w', encoding='utf-8') as f:
    json.dump(mapping, f, indent=2, ensure_ascii=False)

print(f"\nMapping saved to: {mapping_file}")
print("\n=== SUMMARY ===")
print(f"Files moved: {success_count}")
print(f"Errors: {error_count}")
print(f"Projects updated: {replacements_made}")
print(f"Total projects affected: {len(updates_by_project)}")
