import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fontsDir = path.resolve(__dirname, '../public/fonts');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

const fontUrls = {
  'montserrat.ttf': 'https://github.com/JulietaUla/Montserrat/raw/master/fonts/ttf/Montserrat-Regular.ttf',
  'montserratb.ttf': 'https://github.com/JulietaUla/Montserrat/raw/master/fonts/ttf/Montserrat-Bold.ttf',
  'montserrati.ttf': 'https://github.com/JulietaUla/Montserrat/raw/master/fonts/ttf/Montserrat-Italic.ttf',
  'montserratz.ttf': 'https://github.com/JulietaUla/Montserrat/raw/master/fonts/ttf/Montserrat-BoldItalic.ttf',
  'montserrat-extrabold.ttf': 'https://github.com/JulietaUla/Montserrat/raw/master/fonts/ttf/Montserrat-ExtraBold.ttf',
  
  'sourcesans.ttf': 'https://github.com/adobe-fonts/source-sans/raw/release/TTF/SourceSans3-Regular.ttf',
  'sourcesansb.ttf': 'https://github.com/adobe-fonts/source-sans/raw/release/TTF/SourceSans3-Bold.ttf',
  'sourcesansi.ttf': 'https://github.com/adobe-fonts/source-sans/raw/release/TTF/SourceSans3-It.ttf',
  'sourcesansz.ttf': 'https://github.com/adobe-fonts/source-sans/raw/release/TTF/SourceSans3-BoldIt.ttf'
};

async function downloadFont(name, url) {
  const destPath = path.join(fontsDir, name);
  console.log(`Downloading ${name} from ${url}...`);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Fetch error! status: ${res.status}`);
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(destPath, buffer);
    console.log(`Saved ${name} (${buffer.length} bytes) to ${destPath}`);
  } catch (err) {
    console.error(`Failed to download ${name}:`, err.message);
  }
}

async function main() {
  for (const [name, url] of Object.entries(fontUrls)) {
    await downloadFont(name, url);
  }
  console.log('All real TTF fonts downloaded successfully!');
}

main().catch(err => {
  console.error('Fatal error in downloader:', err);
});
