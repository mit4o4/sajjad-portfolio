#!/usr/bin/env node

/**
 * Image Compression Script
 * تحويل الصور من PNG إلى WebP مع الحفاظ على الجودة
 * 
 * التثبيت:
 * npm install sharp
 * 
 * الاستخدام:
 * node compress-images.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const projectImagesDir = path.join(__dirname, 'client/public/images/Project');
const backupDir = path.join(__dirname, 'client/public/images/Project-backup');

async function compressImages() {
  console.log('🖼️  بدء ضغط الصور...\n');
  
  // إنشء مجلد النسخة الاحتياطية
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  try {
    const files = fs.readdirSync(projectImagesDir);
    const imageFiles = files.filter(file => /\.(png|jpg|jpeg)$/i.test(file));
    
    console.log(`📁 تم العثور على ${imageFiles.length} صورة\n`);
    
    let processedCount = 0;
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;

    for (const file of imageFiles) {
      const inputPath = path.join(projectImagesDir, file);
      const outputPath = path.join(projectImagesDir, `${path.parse(file).name}.webp`);
      const backupPath = path.join(backupDir, file);
      
      try {
        const stats = fs.statSync(inputPath);
        const originalSize = stats.size;
        totalOriginalSize += originalSize;

        // إنشاء نسخة احتياطية
        fs.copyFileSync(inputPath, backupPath);

        // ضغط الصورة
        const image = sharp(inputPath);
        const metadata = await image.metadata();
        
        let pipeline = image.webp({ quality: 85 });
        
        // تقليل الدقة إذا كانت كبيرة جداً
        if (metadata.width > 2000) {
          pipeline = pipeline.resize(2000, 1500, { fit: 'inside', withoutEnlargement: true });
        }
        
        await pipeline.toFile(outputPath);
        
        const compressedSize = fs.statSync(outputPath).size;
        totalCompressedSize += compressedSize;
        
        const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1);
        console.log(`✅ ${file}`);
        console.log(`   الأصلي: ${(originalSize / 1024).toFixed(2)} KB → المضغوط: ${(compressedSize / 1024).toFixed(2)} KB (توفير: ${savings}%)\n`);
        
        processedCount++;
      } catch (error) {
        console.error(`❌ خطأ في معالجة ${file}:`, error.message);
      }
    }

    console.log('\n📊 ملخص النتائج:');
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ تم معالجة: ${processedCount}/${imageFiles.length} صورة`);
    console.log(`📦 الحجم الأصلي: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📦 الحجم المضغوط: ${(totalCompressedSize / 1024 / 1024).toFixed(2)} MB`);
    const totalSavings = ((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(1);
    console.log(`💾 إجمالي التوفير: ${totalSavings}%`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    console.log(`✨ تم حفظ النسخة الاحتياطية في: ${backupDir}\n`);

  } catch (error) {
    console.error('❌ خطأ عام:', error.message);
    process.exit(1);
  }
}

// تشغيل البرنامج
compressImages().catch(console.error);
