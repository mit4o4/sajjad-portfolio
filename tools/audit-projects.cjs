#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const projectsPath = path.join(__dirname, '../client/src/data/projectsData.ts');
const imagesDir = path.join(__dirname, '../client/public/images/Project');

// Read projectsData
const projectsContent = fs.readFileSync(projectsPath, 'utf-8');

// Extract all projects from the file (simplified regex)
const projectMatches = projectsContent.match(/{\s*id:\s*['"`]([^'"`]+)['"`]/g) || [];
const projectIds = projectMatches.map(m => m.match(/['"`]([^'"`]+)['"`]/)[1]);

// Get all image files
const imageFiles = fs.readdirSync(imagesDir);

// Create map of images by project ID prefix
const imagesByProject = {};
imageFiles.forEach(file => {
  // Match pattern like 00A-0109-...
  const match = file.match(/^(00A-\d{4})/);
  if (match) {
    const projectId = match[1];
    if (!imagesByProject[projectId]) {
      imagesByProject[projectId] = [];
    }
    imagesByProject[projectId].push(file);
  }
});

console.log('\n=== PROJECT AUDIT REPORT ===\n');
console.log(`Total projects in data: ${projectIds.length}`);
console.log(`Total image folders: ${Object.keys(imagesByProject).length}\n`);

// Check each project
const issues = {
  missingImages: [],
  emptyProjects: [],
  extraImages: []
};

// Read the actual file content for more detailed analysis
const lines = projectsContent.split('\n');
const projectLines = {};
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("id: '")) {
    const match = lines[i].match(/id:\s*['"`]([^'"`]+)['"`]/);
    if (match) {
      projectLines[match[1]] = i;
    }
  }
}

// Check each project
console.log('DETAILED PROJECT CHECK:\n');
projectIds.forEach((id, idx) => {
  const hasImages = imagesByProject[id] || [];
  const lineNum = projectLines[id] || 0;
  
  console.log(`${idx + 1}. ${id}`);
  console.log(`   Line: ${lineNum + 1}`);
  console.log(`   Images in folder: ${hasImages.length}`);
  
  if (hasImages.length === 0) {
    issues.missingImages.push(id);
    console.log(`   ⚠️  NO IMAGES FOUND`);
  } else {
    console.log(`   ✓ Has ${hasImages.length} images`);
    // Show first few images
    hasImages.slice(0, 2).forEach(img => {
      const stats = fs.statSync(path.join(imagesDir, img));
      const sizeKB = (stats.size / 1024).toFixed(1);
      console.log(`     - ${img} (${sizeKB} KB)`);
    });
    if (hasImages.length > 2) {
      console.log(`     ... and ${hasImages.length - 2} more`);
    }
  }
  console.log('');
});

console.log('\n=== SUMMARY ===\n');
console.log(`Projects with no images: ${issues.missingImages.length}`);
if (issues.missingImages.length > 0) {
  console.log(`  ${issues.missingImages.join(', ')}`);
}

// List projects with images but not in data
console.log(`\nImage folders not in projectsData: ${Object.keys(imagesByProject).filter(id => !projectIds.includes(id)).length}`);
const extraProjects = Object.keys(imagesByProject).filter(id => !projectIds.includes(id));
if (extraProjects.length > 0) {
  extraProjects.forEach(id => {
    console.log(`  ${id} (${imagesByProject[id].length} images)`);
  });
}
