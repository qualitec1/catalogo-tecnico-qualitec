import fs from 'fs';
import path from 'path';

const fontsDir = path.resolve('public/fonts');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

async function downloadFontFile(url, destName) {
  const destPath = path.join(fontsDir, destName);
  console.log(`Downloading ${url} -> ${destName}...`);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(buffer));
    console.log(`Saved ${destName}`);
  } catch (e) {
    console.error(`Error saving ${destName}:`, e.message);
  }
}

async function fetchFontUrls(family, variants) {
  const url = `https://fonts.googleapis.com/css2?family=${family.replace(' ', '+')}:${variants}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch CSS for ${family}: ${res.status}`);
    const css = await res.text();
    
    const blockRegex = /@font-face\s*\{([^}]+)\}/gi;
    let blockMatch;
    const results = [];
    
    while ((blockMatch = blockRegex.exec(css)) !== null) {
      const content = blockMatch[1];
      const styleMatch = /font-style:\s*([^;]+)/i.exec(content);
      const weightMatch = /font-weight:\s*([^;]+)/i.exec(content);
      const urlMatch = /url\((https:\/\/[^)]+\.ttf)\)/i.exec(content);
      
      if (styleMatch && weightMatch && urlMatch) {
        results.push({
          style: styleMatch[1].trim().toLowerCase(),
          weight: parseInt(weightMatch[1].trim(), 10),
          url: urlMatch[1].trim()
        });
      }
    }
    return results;
  } catch (e) {
    console.error(`Error fetching URLs for ${family}:`, e.message);
    return [];
  }
}

async function main() {
  const configs = [
    { family: 'Roboto', variants: 'ital,wght@0,400;0,700;1,400;1,700', prefix: 'roboto' },
    { family: 'Inter', variants: 'ital,wght@0,400;0,700;1,400;1,700', prefix: 'inter' },
    { family: 'Outfit', variants: 'wght@400;700', prefix: 'outfit' },
    { family: 'Hanken Grotesk', variants: 'ital,wght@0,400;0,700;1,400;1,700', prefix: 'hankengrotesk' }
  ];

  for (const config of configs) {
    console.log(`\nProcessing family ${config.family}...`);
    const fontFaces = await fetchFontUrls(config.family, config.variants);
    console.log(`Found ${fontFaces.length} font files for ${config.family}`);
    
    for (const face of fontFaces) {
      const isBold = face.weight >= 700;
      const isItalic = face.style === 'italic';
      
      let suffix = '';
      if (isBold && isItalic) suffix = 'z';
      else if (isBold) suffix = 'b';
      else if (isItalic) suffix = 'i';
      else suffix = '';
      
      const filename = `${config.prefix}${suffix}.ttf`;
      await downloadFontFile(face.url, filename);
    }
    
    // Generate fallbacks for Outfit (which doesn't have native italic/bolditalic in wght-only variants)
    if (config.prefix === 'outfit') {
      const regFile = path.join(fontsDir, 'outfit.ttf');
      const boldFile = path.join(fontsDir, 'outfitb.ttf');
      
      if (fs.existsSync(regFile) && !fs.existsSync(path.join(fontsDir, 'outfiti.ttf'))) {
        fs.copyFileSync(regFile, path.join(fontsDir, 'outfiti.ttf'));
        console.log(`Generated fallback outfiti.ttf`);
      }
      if (fs.existsSync(boldFile) && !fs.existsSync(path.join(fontsDir, 'outfitz.ttf'))) {
        fs.copyFileSync(boldFile, path.join(fontsDir, 'outfitz.ttf'));
        console.log(`Generated fallback outfitz.ttf`);
      }
    }
  }

  console.log('\nAll Google Fonts downloaded successfully!');
}

main();
