#!/usr/bin/env node
/**
 * Auto-generate media manifest from folder contents
 * Run: node scripts/generate-manifest.js
 * Watch mode: node scripts/generate-manifest.js --watch
 */

const fs = require('fs');
const path = require('path');

const MEDIA_DIR = path.join(__dirname, '../media');
const MANIFEST_PATH = path.join(MEDIA_DIR, 'manifest.json');
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];

function generateManifest() {
  const files = fs.readdirSync(MEDIA_DIR)
    .filter(file => {
      const ext = path.extname(file).toLowerCase();
      return IMAGE_EXTENSIONS.includes(ext);
    })
    .sort();

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(files, null, 2));
  console.log(`✓ Generated manifest.json with ${files.length} images`);
  return files;
}

// Watch mode
if (process.argv.includes('--watch')) {
  console.log('👀 Watching media folder for changes...');
  console.log('   Drop images into media/ folder - manifest auto-updates');
  console.log('   Press Ctrl+C to stop\n');

  generateManifest();

  let debounceTimer = null;
  fs.watch(MEDIA_DIR, (eventType, filename) => {
    if (!filename || filename === 'manifest.json') return;

    // Debounce to handle multiple rapid events
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const ext = path.extname(filename).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(ext)) {
        console.log(`\n📸 Detected: ${filename}`);
        generateManifest();
      }
    }, 300);
  });
} else {
  // One-time generation
  const files = generateManifest();
  files.forEach(f => console.log(`  - ${f}`));
}
