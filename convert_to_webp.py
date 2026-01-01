#!/usr/bin/env python3
"""
Convert all JPG and PNG images to compressed WebP format
"""

import os
from pathlib import Path
from PIL import Image

def convert_images_to_webp(source_dir, quality=80):
    """
    Convert all JPG and PNG images in a directory to WebP format
    
    Args:
        source_dir: Directory containing images
        quality: WebP quality (1-100, default 80 for good balance)
    """
    source_path = Path(source_dir)
    
    if not source_path.exists():
        print(f"Error: Directory {source_dir} does not exist")
        return
    
    # Find all JPG and PNG files
    image_files = list(source_path.glob('*.jpg')) + list(source_path.glob('*.JPG')) + \
                  list(source_path.glob('*.jpeg')) + list(source_path.glob('*.JPEG')) + \
                  list(source_path.glob('*.png')) + list(source_path.glob('*.PNG'))
    
    print(f"Found {len(image_files)} images to convert")
    
    converted = 0
    skipped = 0
    total_original_size = 0
    total_webp_size = 0
    
    for img_path in sorted(image_files):
        try:
            # Check if webp already exists
            webp_path = img_path.with_suffix('.webp')
            if webp_path.exists():
                print(f"⏭️  SKIP: {img_path.name} (webp exists)")
                skipped += 1
                continue
            
            # Get original file size
            original_size = img_path.stat().st_size
            total_original_size += original_size
            
            # Open and convert to WebP
            print(f"Converting: {img_path.name}", end=" ... ")
            img = Image.open(img_path)
            
            # Convert RGBA to RGB if needed (WebP with quality doesn't support alpha)
            if img.mode in ('RGBA', 'LA', 'P'):
                # Create white background
                bg = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                bg.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                img = bg
            
            # Save as WebP with compression
            img.save(webp_path, 'WEBP', quality=quality, method=6)
            
            # Get new file size
            webp_size = webp_path.stat().st_size
            total_webp_size += webp_size
            
            # Calculate compression ratio
            compression = ((original_size - webp_size) / original_size) * 100
            size_kb_orig = original_size / 1024
            size_kb_webp = webp_size / 1024
            
            print(f"✓ ({size_kb_orig:.1f}KB → {size_kb_webp:.1f}KB, {compression:.0f}% smaller)")
            
            # Delete original file
            img_path.unlink()
            converted += 1
            
        except Exception as e:
            print(f"❌ ERROR converting {img_path.name}: {str(e)}")
    
    # Summary
    print("\n" + "="*60)
    print(f"✅ Conversion Complete!")
    print(f"  Converted: {converted}")
    print(f"  Skipped: {skipped}")
    total_size_mb_orig = total_original_size / (1024 * 1024)
    total_size_mb_webp = total_webp_size / (1024 * 1024)
    total_compression = ((total_original_size - total_webp_size) / total_original_size) * 100
    print(f"  Total: {total_size_mb_orig:.1f}MB → {total_size_mb_webp:.1f}MB ({total_compression:.0f}% smaller)")
    print("="*60)

if __name__ == '__main__':
    project_images_dir = r'c:\Users\sajja\Downloads\sajjad-portfolio\client\public\images\Project'
    convert_images_to_webp(project_images_dir, quality=80)
