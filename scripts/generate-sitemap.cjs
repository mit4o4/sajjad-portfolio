const fs = require('fs');
const path = require('path');

const projectDir = path.join(__dirname, '..', 'client', 'public', 'images', 'Project');
const sitemapPath = path.join(__dirname, '..', 'client', 'public', 'sitemap.xml');
const projectsDataPath = path.join(__dirname, '..', 'client', 'src', 'data', 'projectsData.ts');

const projectsDataContent = fs.readFileSync(projectsDataPath, 'utf8');

// Simple regex parser to extract projects from projectsData.ts
const projectRegex = /id:\s*['"]([^'"]+)['"][\s\S]*?title:\s*['"]([^'"]+)['"][\s\S]*?titleAr:\s*['"]([^'"]+)['"]/g;

const projectInfoMap = new Map();
let match;
while ((match = projectRegex.exec(projectsDataContent)) !== null) {
  const id = match[1];
  const title = match[2];
  const titleAr = match[3];
  projectInfoMap.set(id, { title, titleAr });
}

// Get all actual webp files in images/Project
const files = fs.readdirSync(projectDir)
  .filter(file => file.endsWith('.webp'))
  .sort();

console.log(`Found ${files.length} webp images in Project folder and ${projectInfoMap.size} projects in projectsData.ts.`);

const today = new Date().toISOString().split('T')[0];

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://sajjad-studio.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
`;

for (const file of files) {
  // Extract project id from filename, e.g., '00A-0060-1.webp' -> '00A-0060'
  const idMatch = file.match(/^(00A-\d{4})/);
  const id = idMatch ? idMatch[1] : '';
  const info = projectInfoMap.get(id);

  let caption = 'TeBIM Project Image';
  let title = 'TeBIM Architecture';
  if (info) {
    caption = `${info.titleAr} (${info.title}) - TeBIM`;
    title = info.titleAr;
  }

  // XML escape
  const escapeXml = (str) => str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });

  xml += `    <image:image>
      <image:loc>https://sajjad-studio.com/images/Project/${encodeURIComponent(file)}</image:loc>
      <image:caption>${escapeXml(caption)}</image:caption>
      <image:title>${escapeXml(title)}</image:title>
    </image:image>\n`;
}

xml += `  </url>
</urlset>\n`;

fs.writeFileSync(sitemapPath, xml, 'utf8');
console.log(`Successfully generated sitemap.xml with ${files.length} real images!`);
