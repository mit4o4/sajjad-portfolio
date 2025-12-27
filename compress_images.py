#!/usr/bin/env python3

"""
Image Compression Script
تحويل الصور من PNG إلى WebP مع الحفاظ على الجودة
"""

import os
import shutil
from pathlib import Path
from PIL import Image
import sys

def get_size_mb(size_bytes):
    """تحويل البايتات إلى ميجابايت"""
    return round(size_bytes / (1024 * 1024), 2)

def get_size_kb(size_bytes):
    """تحويل البايتات إلى كيلوبايت"""
    return round(size_bytes / 1024, 2)

def compress_images():
    """ضغط الصور من PNG إلى WebP"""
    
    base_dir = Path(__file__).parent
    project_dir = base_dir / 'client' / 'public' / 'images' / 'Project'
    backup_dir = base_dir / 'client' / 'public' / 'images' / 'Project-backup'
    
    if not project_dir.exists():
        print(f"❌ المجلد غير موجود: {project_dir}")
        sys.exit(1)
    
    # إنشاء مجلد النسخة الاحتياطية
    if not backup_dir.exists():
        backup_dir.mkdir(parents=True, exist_ok=True)
        print(f"✅ تم إنشاء مجلد النسخة الاحتياطية: {backup_dir}\n")
    
    print("🖼️  بدء ضغط الصور...\n")
    print("=" * 60)
    
    # الحصول على قائمة الصور
    image_files = list(project_dir.glob('*.png')) + list(project_dir.glob('*.jpg')) + list(project_dir.glob('*.jpeg'))
    
    print(f"📁 تم العثور على {len(image_files)} صورة\n")
    
    processed_count = 0
    total_original_size = 0
    total_compressed_size = 0
    failed_files = []
    
    for idx, image_path in enumerate(image_files, 1):
        try:
            original_size = image_path.stat().st_size
            total_original_size += original_size
            
            # إنشاء نسخة احتياطية
            backup_path = backup_dir / image_path.name
            shutil.copy2(image_path, backup_path)
            
            # فتح الصورة
            img = Image.open(image_path)
            
            # تقليل الدقة إذا كانت كبيرة جداً
            if img.width > 2000 or img.height > 2000:
                ratio = min(2000 / img.width, 2000 / img.height)
                new_width = int(img.width * ratio)
                new_height = int(img.height * ratio)
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # حفظ كـ WebP
            webp_path = image_path.with_suffix('.webp')
            img.save(webp_path, 'WEBP', quality=85, method=6)
            
            compressed_size = webp_path.stat().st_size
            total_compressed_size += compressed_size
            
            savings_percent = ((1 - compressed_size / original_size) * 100)
            
            # طباعة النتائج
            filename = image_path.name
            print(f"[{idx:3d}] ✅ {filename}")
            print(f"      الأصلي: {get_size_kb(original_size):8.2f} KB → WebP: {get_size_kb(compressed_size):8.2f} KB | توفير: {savings_percent:5.1f}%")
            
            # حذف الملف الأصلي
            image_path.unlink()
            print(f"      🗑️  تم حذف الملف الأصلي\n")
            
            processed_count += 1
            
        except Exception as e:
            failed_files.append((image_path.name, str(e)))
            print(f"[{idx:3d}] ❌ {image_path.name}")
            print(f"      الخطأ: {str(e)}\n")
    
    # طباعة الملخص
    print("=" * 60)
    print("\n📊 ملخص النتائج:")
    print("=" * 60)
    print(f"✅ تم معالجة: {processed_count}/{len(image_files)} صورة")
    
    if failed_files:
        print(f"❌ فشل: {len(failed_files)} صورة")
        for filename, error in failed_files:
            print(f"   - {filename}: {error}")
    
    print(f"\n📦 الحجم الأصلي: {get_size_mb(total_original_size)} MB")
    print(f"📦 الحجم المضغوط: {get_size_mb(total_compressed_size)} MB")
    
    if total_original_size > 0:
        total_savings = ((1 - total_compressed_size / total_original_size) * 100)
        print(f"💾 إجمالي التوفير: {total_savings:.1f}%")
        saved_mb = get_size_mb(total_original_size - total_compressed_size)
        print(f"💾 تم توفير: {saved_mb} MB")
    
    print("=" * 60)
    print(f"\n✨ تم حفظ النسخة الاحتياطية في: {backup_dir}")
    print("✨ تم تحويل الصور إلى WebP بنجاح!\n")
    
    if failed_files:
        print(f"⚠️  تنبيه: {len(failed_files)} ملف لم يتم معالجتها")

if __name__ == '__main__':
    compress_images()
