/*
 * Oliver's Pizza - tartalom frissito script
 *
 * Mappak:
 *   content/uploads/images  -> galeria fotok (amit ide masolsz, megjelenik a galeria elejen)
 *   content/uploads/videos  -> galeria videok
 *   content/uploads/logos   -> partner logok
 *   content/uploads/fovideo -> a nyitokepernyo videoja (egy fajl)
 *   content/oldal           -> az oldalba fixen beepitett kepek/videok (index.html hivatkozik rajuk)
 *   content/archivum        -> sehol nem hasznalt fajlok, ezeket a script figyelmen kivul hagyja
 *
 * Generalt fajlok (kezzel nem kell szerkeszteni):
 *   content/gallery-data.js
 *   content/logos-data.js
 *   content/site-data.js
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const uploadsImagesDir = path.join(root, 'content', 'uploads', 'images');
const uploadsVideosDir = path.join(root, 'content', 'uploads', 'videos');
const uploadsLogosDir = path.join(root, 'content', 'uploads', 'logos');
const uploadsHeroDir = path.join(root, 'content', 'uploads', 'fovideo');
const oldalDir = path.join(root, 'content', 'oldal');
const galleryDataFile = path.join(root, 'content', 'gallery-data.js');
const logosDataFile = path.join(root, 'content', 'logos-data.js');
const siteDataFile = path.join(root, 'content', 'site-data.js');

const imageExts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const videoExts = new Set(['.mp4', '.webm', '.mov']);
const videoMimes = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime'
};

// Ezek a kepek a content/oldal mappaban vannak, mert az index.html fixen hasznalja oket.
// A galeria vegen is megjelennek, ebben a sorrendben.
const oldalGalleryItems = [
  { file: 'pizza-hero.jpg', alt: 'Pizza' },
  { file: 'pizza2.jpg', alt: 'Pizza' },
  { file: 'pizza3.jpg', alt: 'Pizza' },
  { file: 'pizza-oven2.jpg', alt: 'Pizza kemencéből' },
  { file: 'chef-kitchen.jpg', alt: 'Oliver a konyhában' },
  { file: 'proud-chef.jpg', alt: 'Oliver' },
  { file: 'pizza-chef2.jpg', alt: 'Pizza chef' }
];

// Logo fajlnev -> megjelenitendo ceg nev. Ha egy fajl nincs a listaban,
// a script a fajlnevbol keszit nevet.
const logoNames = {
  '01-allianz.jpeg': 'Allianz',
  '02-kpmg.webp': 'KPMG',
  '03-ds-smith.jpeg': 'DS Smith',
  '04-brands-and-more-hungary.png': 'Brands and More Hungary',
  '05-terra.png': 'TERRA',
  '06-younic.png': 'Younic',
  '07-complet-party-service.png': 'Complet Party Service',
  '08-paller-csarnok.png': 'Pallér Csarnok',
  '09-corvina.webp': 'Corvina',
  '10-klanzo-higienia.jpg': 'Klanzo Higiénia Kft.',
  '11-jcdecaux.png': 'JCDecaux'
};

// Logo fajlnev -> magassag pixelben. Ha nincs megadva, a script a kep aranyabol szamolja.
const logoHeights = {
  '01-allianz.jpeg': 54,
  '02-kpmg.webp': 54,
  '03-ds-smith.jpeg': 64,
  '04-brands-and-more-hungary.png': 54,
  '05-terra.png': 48,
  '06-younic.png': 58,
  '07-complet-party-service.png': 64,
  '08-paller-csarnok.png': 64,
  '09-corvina.webp': 64,
  '10-klanzo-higienia.jpg': 64,
  '11-jcdecaux.png': 48
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function listFiles(dir) {
  ensureDir(dir);
  return fs.readdirSync(dir)
    .filter((file) => !file.startsWith('.'))
    .filter((file) => fs.statSync(path.join(dir, file)).isFile())
    .sort((a, b) => a.localeCompare(b, 'hu', { numeric: true, sensitivity: 'base' }));
}

function toSitePath(absPath) {
  return path.relative(root, absPath).split(path.sep).join('/');
}

function humanizeFilename(file) {
  return path.basename(file, path.extname(file))
    .replace(/^\d+[-_\s]+/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase()) || 'Feltöltött kép';
}

function readUInt24LE(buffer, offset) {
  return buffer[offset] + (buffer[offset + 1] << 8) + (buffer[offset + 2] << 16);
}

function getPngSize(buffer) {
  if (buffer.length < 24 || buffer.toString('ascii', 1, 4) !== 'PNG') return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function getGifSize(buffer) {
  if (buffer.length < 10 || !buffer.toString('ascii', 0, 3).startsWith('GIF')) return null;
  return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
}

function getJpegSize(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) return null;
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7)
      };
    }
    offset += 2 + length;
  }
  return null;
}

function getWebpSize(buffer) {
  if (buffer.length < 30 || buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') {
    return null;
  }
  const format = buffer.toString('ascii', 12, 16);
  if (format === 'VP8 ') {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff
    };
  }
  if (format === 'VP8L') {
    const b0 = buffer[21];
    const b1 = buffer[22];
    const b2 = buffer[23];
    const b3 = buffer[24];
    return {
      width: 1 + (((b1 & 0x3f) << 8) | b0),
      height: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6))
    };
  }
  if (format === 'VP8X') {
    return {
      width: 1 + readUInt24LE(buffer, 24),
      height: 1 + readUInt24LE(buffer, 27)
    };
  }
  return null;
}

function getImageSize(absPath) {
  const buffer = fs.readFileSync(absPath);
  return getPngSize(buffer) || getGifSize(buffer) || getJpegSize(buffer) || getWebpSize(buffer);
}

// A csempe alakja: allo kep magasabb, szeles kep szelesebb helyet kap.
function shapeFor(absPath, type) {
  if (type === 'video') return 'wide';
  const size = getImageSize(absPath);
  if (!size) return '';
  const ratio = size.width / size.height;
  return ratio >= 1.45 ? 'wide' : ratio <= 0.78 ? 'tall' : '';
}

function logoHeightFor(absPath) {
  const size = getImageSize(absPath);
  if (!size) return 64;
  const ratio = size.width / size.height;
  if (ratio >= 2.4) return 48;
  if (ratio >= 1.8) return 54;
  return 64;
}

function collectMedia(dir, allowedExts, defaultAlt) {
  return listFiles(dir)
    .filter((file) => allowedExts.has(path.extname(file).toLowerCase()))
    .map((file) => {
      const absPath = path.join(dir, file);
      const ext = path.extname(file).toLowerCase();
      const type = videoExts.has(ext) ? 'video' : 'image';
      return {
        type,
        src: toSitePath(absPath),
        alt: defaultAlt,
        mime: type === 'video' ? videoMimes[ext] : undefined,
        shape: shapeFor(absPath, type)
      };
    });
}

function buildGallery() {
  // Sorrend: feltoltott fotok, feltoltott videok, vegul az oldal fix kepei.
  const uploaded = [
    ...collectMedia(uploadsImagesDir, imageExts, 'Rendezvényfotó'),
    ...collectMedia(uploadsVideosDir, videoExts, 'Rendezvényvideó')
  ];

  const oldalItems = oldalGalleryItems
    .filter((item) => fs.existsSync(path.join(oldalDir, item.file)))
    .map((item) => {
      const absPath = path.join(oldalDir, item.file);
      return {
        type: 'image',
        src: toSitePath(absPath),
        alt: item.alt,
        mime: undefined,
        shape: shapeFor(absPath, 'image')
      };
    });

  const items = [...uploaded, ...oldalItems].map((item, index) => {
    const delay = index % 3 === 1 ? 'd1' : index % 3 === 2 ? 'd2' : '';
    return {
      type: item.type,
      src: item.src,
      alt: item.alt,
      mime: item.mime,
      className: [delay, item.shape].filter(Boolean).join(' ')
    };
  });

  return { items, uploadedCount: uploaded.length };
}

function buildLogos() {
  return listFiles(uploadsLogosDir)
    .filter((file) => imageExts.has(path.extname(file).toLowerCase()))
    .map((file) => {
      const absPath = path.join(uploadsLogosDir, file);
      return {
        src: toSitePath(absPath),
        alt: logoNames[file] || humanizeFilename(file),
        height: logoHeights[file] || logoHeightFor(absPath)
      };
    });
}

// A nyitokepernyo videoja: a content/uploads/fovideo mappa elso videofajlja.
function buildSite() {
  const heroFile = listFiles(uploadsHeroDir)
    .find((file) => videoExts.has(path.extname(file).toLowerCase()));

  if (!heroFile) return { heroVideo: null };

  const ext = path.extname(heroFile).toLowerCase();
  return {
    heroVideo: {
      src: toSitePath(path.join(uploadsHeroDir, heroFile)),
      mime: videoMimes[ext]
    }
  };
}

function writeJsData(filePath, globalName, data) {
  const js = `window.${globalName} = ${JSON.stringify(data, null, 2)};\n`;
  fs.writeFileSync(filePath, js, 'utf8');
}

function main() {
  const gallery = buildGallery();
  const logos = buildLogos();
  const site = buildSite();

  writeJsData(galleryDataFile, 'OLIVERS_GALLERY_ITEMS', gallery.items);
  writeJsData(logosDataFile, 'OLIVERS_LOGOS', logos);
  writeJsData(siteDataFile, 'OLIVERS_SITE', site);

  console.log(`Galéria frissítve: ${gallery.items.length} elem (${gallery.uploadedCount} feltöltött, elöl).`);
  console.log(`Logók frissítve: ${logos.length} elem.`);
  console.log(site.heroVideo
    ? `Fővideó: ${site.heroVideo.src}`
    : 'Fővideó: NINCS - tegyél egy videót a content/uploads/fovideo mappába!');
}

main();
