const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'index.html'), 'utf8');

// Check JSON-LD
const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (match) {
  try {
    const json = JSON.parse(match[1]);
    console.log('✅ JSON-LD is 100% valid JSON!');
    console.log('Schemas:', json.map(x => x['@type']));
  } catch (err) {
    console.error('❌ JSON-LD Error:', err.message);
  }
} else {
  console.error('❌ No JSON-LD found');
}

// Check noscript
if (html.includes('<noscript>')) {
  console.log('✅ <noscript> fallback is present for AI crawlers!');
} else {
  console.error('❌ <noscript> missing');
}

// Check meta tags
console.log('Title present:', html.includes('<title>TeBIM |'));
console.log('Hreflang present:', html.includes('hreflang="ar"'));
console.log('Canonical present:', html.includes('https://sajjad-studio.com/'));
console.log('IBM Plex Font present:', html.includes('IBM+Plex+Sans+Arabic'));
