import sharp from 'sharp';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// SVG para el logo principal
const logoSVG = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4F46E5"/>
      <stop offset="100%" style="stop-color:#7C3AED"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <text x="256" y="380" font-family="Arial Black, sans-serif" font-size="320" font-weight="900" fill="white" text-anchor="middle">S</text>
  <circle cx="410" cy="140" r="32" fill="#FBBF24"/>
</svg>`;

const faviconSVG = `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4F46E5"/>
      <stop offset="100%" style="stop-color:#7C3AED"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="12" fill="url(#bg2)"/>
  <text x="32" y="50" font-family="Arial Black, sans-serif" font-size="40" font-weight="900" fill="white" text-anchor="middle">S</text>
</svg>`;

const appleTouchIconSVG = `
<svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4F46E5"/>
      <stop offset="100%" style="stop-color:#7C3AED"/>
    </linearGradient>
  </defs>
  <rect width="180" height="180" rx="40" fill="url(#bg3)"/>
  <text x="90" y="135" font-family="Arial Black, sans-serif" font-size="110" font-weight="900" fill="white" text-anchor="middle">S</text>
  <circle cx="145" cy="50" r="12" fill="#FBBF24"/>
</svg>`;

async function generateFavicons() {
  const publicDir = join(__dirname, '../public');
  
  console.log('🎨 Generando favicons y assets...\n');

  try {
    // 1. Logo principal (512x512)
    console.log('📦 Generando logo principal (logo-512.png)...');
    await sharp(Buffer.from(logoSVG))
      .resize(512, 512)
      .png()
      .toFile(join(publicDir, 'logo-512.png'));

    // 2. Logo para manifest (192x192)
    console.log('📦 Generando logo para manifest (logo-192.png)...');
    await sharp(Buffer.from(logoSVG))
      .resize(192, 192)
      .png()
      .toFile(join(publicDir, 'logo-192.png'));

    // 3. Favicon ICO (32x32)
    console.log('📦 Generando favicon.ico (32x32)...');
    await sharp(Buffer.from(faviconSVG))
      .resize(32, 32)
      .toFile(join(publicDir, 'favicon.ico'));

    // 4. Favicon PNG (32x32)
    console.log('📦 Generando favicon-32x32.png...');
    await sharp(Buffer.from(faviconSVG))
      .resize(32, 32)
      .png()
      .toFile(join(publicDir, 'favicon-32x32.png'));

    // 5. Favicon PNG (16x16)
    console.log('📦 Generando favicon-16x16.png...');
    await sharp(Buffer.from(faviconSVG))
      .resize(16, 16)
      .png()
      .toFile(join(publicDir, 'favicon-16x16.png'));

    // 6. Apple Touch Icon
    console.log('📦 Generando apple-touch-icon.png (180x180)...');
    await sharp(Buffer.from(appleTouchIconSVG))
      .resize(180, 180)
      .png()
      .toFile(join(publicDir, 'apple-touch-icon.png'));

    // 7. Android Chrome icons
    console.log('📦 Generando android-chrome-192x192.png...');
    await sharp(Buffer.from(logoSVG))
      .resize(192, 192)
      .png()
      .toFile(join(publicDir, 'android-chrome-192x192.png'));

    console.log('📦 Generando android-chrome-512x512.png...');
    await sharp(Buffer.from(logoSVG))
      .resize(512, 512)
      .png()
      .toFile(join(publicDir, 'android-chrome-512x512.png'));

    // 8. Manifest.json
    console.log('📦 Generando manifest.json...');
    const manifest = {
      name: 'STIA CRM',
      short_name: 'STIA',
      description: 'Sistema de gestión empresarial multi-compañía para Centroamérica',
      start_url: '/',
      display: 'standalone',
      background_color: '#0F172A',
      theme_color: '#4F46E5',
      icons: [
        {
          src: '/logo-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/logo-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    };

    await fs.writeFile(
      join(publicDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    console.log('\n✅ Todos los assets generados exitosamente!\n');
    console.log('📁 Archivos creados:');
    console.log('   ✓ favicon.ico');
    console.log('   ✓ favicon.svg');
    console.log('   ✓ favicon-16x16.png');
    console.log('   ✓ favicon-32x32.png');
    console.log('   ✓ apple-touch-icon.png');
    console.log('   ✓ logo-192.png');
    console.log('   ✓ logo-512.png');
    console.log('   ✓ android-chrome-192x192.png');
    console.log('   ✓ android-chrome-512x512.png');
    console.log('   ✓ manifest.json');
    console.log('   ✓ logo.svg');

  } catch (error) {
    console.error('❌ Error generando favicons:', error);
    process.exit(1);
  }
}

generateFavicons();
