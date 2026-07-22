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

console.log('Copying SQLite template database...');
const prismaStandaloneDir = path.join(standaloneDir, 'prisma');
if (!fs.existsSync(prismaStandaloneDir)) {
  fs.mkdirSync(prismaStandaloneDir);
}
const devDbPath = path.join(__dirname, 'prisma', 'dev.db');
if (fs.existsSync(devDbPath)) {
  fs.copyFileSync(devDbPath, path.join(prismaStandaloneDir, 'dev.db'));
}

console.log('Assets prepared successfully.');
