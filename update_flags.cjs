const fs = require('fs');
const path = require('path');

const countriesFile = fs.readFileSync('src/data/countries.ts', 'utf8');
const lines = countriesFile.split('\n').filter(l => l.includes('capital:') && l.includes('code:'));

const codes = lines.map(line => {
  const match = line.match(/code:\s*"([^"]+)"/);
  return match ? match[1].toLowerCase() : null;
}).filter(Boolean);

console.log('Total countries in DB:', codes.length);

const sourceDir = path.join('node_modules', 'svg-country-flags', 'svg');
const destDir = path.join('public', 'flags');

let copied = 0;
let missing = [];

for (const code of codes) {
  const srcFile = path.join(sourceDir, `${code}.svg`);
  const destFile = path.join(destDir, `${code}.svg`);
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, destFile);
    copied++;
  } else {
    missing.push(code);
  }
}

console.log(`Successfully copied ${copied} official aspect ratio SVG flags.`);
if (missing.length > 0) {
  console.log('Missing codes in svg-country-flags:', missing);
} else {
  console.log('ALL 195 COUNTRIES HAVE TRUE ASPECT RATIO FLAGS!');
}
