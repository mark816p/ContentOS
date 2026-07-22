const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building Next.js app...');
execSync('npx next build', { stdio: 'inherit' });

console.log('Copying static assets for standalone server...');
const standaloneDir = path.join(__dirname, '.next', 'standalone');
const publicDir = path.join(__dirname, 'public');
const staticDir = path.join(__dirname, '.next', 'static');

const standalonePublicDir = path.join(standaloneDir, 'public');
const standaloneStaticDir = path.join(standaloneDir, '.next', 'static');

if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, standalonePublicDir, { recursive: true });
}

if (fs.existsSync(staticDir)) {
  fs.cpSync(staticDir, standaloneStaticDir, { recursive: true });
}

console.log('Static assets copied successfully.');
