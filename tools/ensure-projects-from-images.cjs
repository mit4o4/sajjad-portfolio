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
  Object.keys(map).forEach((k) => map[k].sort());
  return map;
}

function ensureProjects(map) {
  if (!fs.existsSync(dataFile)) {
    console.error('projectsData.ts not found:', dataFile);
    process.exit(1);
  }
  let content = fs.readFileSync(dataFile, 'utf8');

  // gather existing ids
  const existing = new Set();
  const idRegex = /id:\s*'([^']+)'/g;
  let m;
  while ((m = idRegex.exec(content))) existing.add(m[1].toUpperCase());

  let added = 0;
  let updated = 0;

  for (const id of Object.keys(map)) {
    const files = map[id];
    // build allImages snippet
    const imgs = files.map((f) => `      imagePath('${f.replace(/'/g, "\\'")}')`).join(',\n');
    const allImagesSnippet = `allImages: [\n${imgs}\n    ],`;

    if (existing.has(id)) {
      // update existing project's allImages (if present replace, else insert)
      const idPattern = `id: '${id}'`;
      const idx = content.indexOf(idPattern);
      if (idx === -1) continue;
      let objStart = content.lastIndexOf('\n  {', idx);
      if (objStart === -1) objStart = content.lastIndexOf('{', idx);
      if (objStart === -1) continue;
      let depth = 0;
      let endIdx = -1;
      for (let i = objStart; i < content.length; i++) {
        const ch = content[i];
        if (ch === '{') depth++; else if (ch === '}') { depth--; if (depth === 0) { endIdx = i + 1; break; } }
      }
      if (endIdx === -1) continue;
      const block = content.slice(objStart, endIdx);
      if (/allImages\s*:/m.test(block)) {
        const newBlock = block.replace(/allImages\s*:\s*\[[^\]]*\],?/m, allImagesSnippet + '\n');
        content = content.slice(0, objStart) + newBlock + content.slice(endIdx);
        updated++;
      } else {
        const insertionPoint = endIdx - 1;
        const before = content.slice(0, insertionPoint);
        const after = content.slice(insertionPoint);
        const newBefore = before + '\n    ' + allImagesSnippet + '\n';
        content = newBefore + after;
        updated++;
      }
    } else {
      // create a minimal project object and insert before closing array
      const obj = [
        '  {',
        `    id: '${id}',`,
        `    title: '${id}',`,
        `    titleAr: '${id}',`,
        `    image: imagePath('${files[0].replace(/'/g, "\\'")}'),`,
        "    category: 'design',",
        "    description: '',",
        "    descriptionAr: '',",
        `    allImages: [`,
        files.map((f) => `      imagePath('${f.replace(/'/g, "\\'")}')`).join(',\n'),
        '    ],',
        '  },',
      ].join('\n');

      // insert before final closing bracket of array
      const arrClose = content.lastIndexOf('\n];');
      if (arrClose === -1) continue;
      content = content.slice(0, arrClose) + '\n' + obj + '\n' + content.slice(arrClose);
      added++;
    }
  }

  if (updated > 0 || added > 0) {
    fs.writeFileSync(dataFile, content, 'utf8');
    console.log(`Updated projectsData.ts: ${updated} existing projects updated, ${added} new projects added.`);
  } else {
    console.log('No changes required.');
  }
}

const map = readImages();
console.log('Found image groups for', Object.keys(map).length, 'project ids');
ensureProjects(map);
