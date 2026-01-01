#!/usr/bin/env python3
"""
Update projectsData.ts to reference .webp files instead of .jpg/.png
"""

import re

# Read the file
with open('client/src/data/projectsData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all .jpg and .png extensions with .webp in image path references
# Match patterns like imagePath('filename.jpg') or imagePath('filename.png')
original_content = content

# Replace .jpg with .webp
content = re.sub(
    r"imagePath\('([^']+)\.jpg'\)",
    r"imagePath('\1.webp')",
    content
)

# Replace .png with .webp
content = re.sub(
    r"imagePath\('([^']+)\.png'\)",
    r"imagePath('\1.webp')",
    content
)

# Count changes
jpg_count = original_content.count('.jpg')
png_count = original_content.count('.png')
new_jpg_count = content.count('.jpg')
new_png_count = content.count('.png')

print(f"Original: {jpg_count} .jpg, {png_count} .png")
print(f"After:    {new_jpg_count} .jpg, {new_png_count} .png")
print(f"Replaced: {jpg_count - new_jpg_count} .jpg → .webp")
print(f"Replaced: {png_count - new_png_count} .png → .webp")

# Write back
with open('client/src/data/projectsData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ projectsData.ts updated successfully!")
