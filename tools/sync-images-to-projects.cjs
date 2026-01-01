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

    // find object start by locating previous top-level project object marker '\n  {' if possible
    let objStart = content.lastIndexOf('\n  {', idx);
    if (objStart === -1) {
      objStart = content.lastIndexOf('{', idx);
    }
    if (objStart === -1) continue;
    let depth = 0;
    let endIdx = -1;
    for (let i = objStart; i < content.length; i++) {
      const ch = content[i];
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) { endIdx = i + 1; break; }
      }
    }
    if (endIdx === -1) continue;
    // include trailing comma if present
    const after = content.slice(endIdx, endIdx + 4);
    if (/^\s*,/.test(after)) endIdx = endIdx + 1;
    const block = content.slice(objStart, endIdx);

    // build images array string using imagePath helper
    const imgs = files.map((f) => `      imagePath('${f.replace(/'/g, "\\'")}')`).join(',\n');
    const allImagesSnippet = `allImages: [\n${imgs}\n    ],`;

    if (/allImages\s*:/m.test(block)) {
      // replace existing allImages array within block
      const newBlock = block.replace(/allImages\s*:\s*\[[^\]]*\],?/m, allImagesSnippet + '\n');
      content = content.slice(0, objStart) + newBlock + content.slice(endIdx);
      updated++;
    } else {
      // insert before the final closing brace of the object
      const insertionPoint = endIdx - 1; // position of '}'
      const before = content.slice(0, insertionPoint);
      const after = content.slice(insertionPoint);
      const newBefore = before + '\n    ' + allImagesSnippet + '\n';
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
console.log('Found image groups for', Object.keys(map).length, 'project ids');
console.log(Object.keys(map).slice(0,40));
updateData(map);
