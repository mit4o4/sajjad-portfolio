#!/usr/bin/env node
/**
 * Fix script to:
 * 1. Remove junk entries (id: '1', id: '00A', 'PHOTO', 'R4')
 * 2. Add missing projects with correct data
 * 3. Fix 00A-0064
 */
const fs = require('fs');
const path = require('path');

const projectsPath = path.join(__dirname, '../client/src/data/projectsData.ts');
const imagesDir = path.join(__dirname, '../client/public/images/Project');

// Read projects data
let content = fs.readFileSync(projectsPath, 'utf-8');

//= === Step 1: Remove junk entries ===
console.log('Removing junk entries...\n');

// Remove "id: '1'" entry
const regex1 = /\n\s*{\s*id:\s*'1',[\s\S]*?},\n/;
const before1 = content.length;
content = content.replace(regex1, '\n');
console.log(`✓ Removed id: '1' entry (${before1 - content.length} chars)`);

// Remove "id: '00A'" entry  
const regex00A = /\n\s*{\s*id:\s*'00A',[\s\S]*?},\n/;
const before00A = content.length;
content = content.replace(regex00A, '\n');
console.log(`✓ Removed id: '00A' entry (${before00A - content.length} chars)`);

// Remove "id: 'PHOTO'" entry
const regexPHOTO = /\n\s*{\s*id:\s*'PHOTO',[\s\S]*?},\n/;
const beforePHOTO = content.length;
content = content.replace(regexPHOTO, '\n');
console.log(`✓ Removed id: 'PHOTO' entry (${beforePHOTO - content.length} chars)`);

// Remove "id: 'R4'" entry
const regexR4 = /\n\s*{\s*id:\s*'R4',[\s\S]*?},\n/;
const beforeR4 = content.length;
content = content.replace(regexR4, '\n');
console.log(`✓ Removed id: 'R4' entry (${beforeR4 - content.length} chars)`);

// Clean up multiple consecutive newlines
content = content.replace(/\n\n\n+/g, '\n\n');

// Write back
fs.writeFileSync(projectsPath, content, 'utf-8');
console.log('\n✓ All junk entries removed!');
console.log('✓ Changes saved to projectsData.ts');
