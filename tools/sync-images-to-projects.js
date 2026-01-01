const fs = require('fs');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');
const imagesDir = path.join(workspaceRoot, 'client', 'public', 'images', 'Project');
const dataFile = path.join(workspaceRoot, 'client', 'src', 'data', 'projectsData.ts');

function readImages() {
  if (!fs.existsSync(imagesDir)) {
    console.error('images directory not found:', imagesDir);
    process.exit(1);
  }
  const files = fs.readdirSync(imagesDir).filter((f) => /\.(png|jpg|jpeg|webp|gif)$/i.test(f));
  const map = {};
  files.forEach((f) => {
    const m = f.match(/^([0-9A-Z]{4}-[0-9]{4}|00A-[0-9]{4}|[0-9A-Z-]+?)[-_]/i) || f.match(/^(00A-[0-9]{4})/i) || f.match(/^([0-9A-Z-]+)[.]/i);
    const id = m ? m[1] : null;
    if (!id) return;
    const key = id.toUpperCase();
    map[key] = map[key] || [];
    map[key].push(f);
  });
  // sort lists
  Object.keys(map).forEach((k) => map[k].sort());
  return map;
}

function updateData(map) {
  if (!fs.existsSync(dataFile)) {
    console.error('projectsData.ts not found:', dataFile);
    process.exit(1);
  }
  let content = fs.readFileSync(dataFile, 'utf8');
  let updated = 0;

  for (const id of Object.keys(map)) {
    const files = map[id];
    // find project by id
    const idPattern = `id: '${id}'`;
    const idx = content.indexOf(idPattern);
    if (idx === -1) continue;
    // find object end: look for '\n  },' after idx
    const objEndMatch = content.slice(idx).match(/\n\s*\},\n/);
    let endIdx = -1;
    if (objEndMatch) {
      endIdx = idx + objEndMatch.index + objEndMatch[0].length - 1; // position after closing brace
    } else {
      // fallback: find next '\n  }\n' or end of array
      const alt = content.slice(idx).match(/\n\s*\}\n/);
      if (alt) endIdx = idx + alt.index + alt[0].length - 1;
    }
    if (endIdx === -1) continue;

    // extract block
    const block = content.slice(idx, endIdx);

    // build images array string using imagePath helper
    const imgs = files.map((f) => `      imagePath('${f.replace(/'/g, "\\'")}')`).join(',\n');
    const allImagesSnippet = `allImages: [\n${imgs}\n    ],`;

    if (/allImages\s*:/m.test(block)) {
      // replace existing allImages array
      const newBlock = block.replace(/allImages\s*:\s*\[[^\]]*\],?/m, allImagesSnippet + '\n');
      content = content.slice(0, idx) + newBlock + content.slice(endIdx);
      updated++;
    } else {
      // insert before endIdx (before closing brace)
      const insertPos = idx + block.length - 1; // before the closing brace line
      // find position of final newline before closing '}'
      const before = content.slice(0, endIdx);
      const after = content.slice(endIdx);
      // insert allImages before the closing brace line
      const newBefore = before.replace(/\n\s*\}\s*$/m, '\n    ' + allImagesSnippet + '\n  }');
      content = newBefore + after;
      updated++;
    }
  }

  if (updated > 0) {
    fs.writeFileSync(dataFile, content, 'utf8');
    console.log('Updated projectsData.ts with images for', updated, 'projects.');
  } else {
    console.log('No updates applied.');
  }
}

const map = readImages();
updateData(map);
