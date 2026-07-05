import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontsDir = path.resolve(__dirname, '../public/fonts');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

const fontQueries = {
  'montserrat.ttf': 'https://fonts.googleapis.com/css?family=Montserrat:400',
  'montserratb.ttf': 'https://fonts.googleapis.com/css?family=Montserrat:700',
  'montserrati.ttf': 'https://fonts.googleapis.com/css?family=Montserrat:400i',
  'montserratz.ttf': 'https://fonts.googleapis.com/css?family=Montserrat:700i',
  'montserrat-extrabold.ttf': 'https://fonts.googleapis.com/css?family=Montserrat:800',
  'sourcesans.ttf': 'https://fonts.googleapis.com/css?family=Source+Sans+Pro:400',
  'sourcesansb.ttf': 'https://fonts.googleapis.com/css?family=Source+Sans+Pro:700',
  'sourcesansi.ttf': 'https://fonts.googleapis.com/css?family=Source+Sans+Pro:400i',
  'sourcesansz.ttf': 'https://fonts.googleapis.com/css?family=Source+Sans+Pro:700i'
};

async function getFontUrlFromCss(cssUrl) {
  const res = await fetch(cssUrl, {
    headers: {
      'User-Agent': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0)'
    }
  });
  if (!res.ok) {
    throw new Error(`CSS fetch error! status: ${res.status}`);
  }
  const cssText = await res.text();
  const match = cssText.match(/src:\s*url\(([^)]+)\)/);
  if (!match) {
    throw new Error(`Could not find font URL in CSS: ${cssText}`);
  }
  return match[1];
}

async function downloadFont(name, cssUrl) {
  const destPath = path.join(fontsDir, name);
  try {
    console.log(`Getting URL for ${name}...`);
    const fontUrl = await getFontUrlFromCss(cssUrl);
    console.log(`Downloading ${name} from ${fontUrl}...`);
    const res = await fetch(fontUrl);
    if (!res.ok) {
      throw new Error(`Font fetch error! status: ${res.status}`);
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(destPath, buffer);
    console.log(`Successfully saved ${name} to ${destPath}`);
  } catch (err) {
    console.error(`Failed to download ${name}:`, err.message);
  }
}

async function main() {
  for (const [name, cssUrl] of Object.entries(fontQueries)) {
    await downloadFont(name, cssUrl);
  }
  console.log('All custom fonts downloaded successfully!');
}

main().catch(err => {
  console.error('Fatal error in downloader:', err);
});
