const fs = require('fs-extra');
const path = require('path');

// Ensure dist directory exists
fs.ensureDirSync(path.join(__dirname, '..', 'dist'));

// Create dist/migrations directory if it doesn't exist
const distMigrationsDir = path.join(__dirname, '..', 'dist', 'migrations');
fs.ensureDirSync(distMigrationsDir);

// Read migration files from source
const migrationsDir = path.join(__dirname, '..', 'migrations');
if (fs.existsSync(migrationsDir)) {
  const files = fs.readdirSync(migrationsDir);

  console.log('Copying migration files to dist/migrations...');

  // Copy each migration file
  files.forEach(file => {
    // Skip non-typescript files
    if (!file.endsWith('.ts')) return;

    const srcPath = path.join(migrationsDir, file);
    // Rename the file to .js for production
    const destPath = path.join(distMigrationsDir, file.replace('.ts', '.js'));

    // Read the file content
    let content = fs.readFileSync(srcPath, 'utf8');

    // Modify the file for CommonJS compatibility
    content = content.replace('export default class', 'module.exports = class');
    content = content.replace('export class', 'module.exports = class');

    // Write the modified content to the destination file
    fs.writeFileSync(destPath, content);
    console.log(`Copied: ${file} -> ${path.basename(destPath)}`);
  });

  console.log('Migration files copied successfully!');
} else {
  console.log('No migrations directory found.');
}

// Copy index.js after TypeScript compilation
const srcIndexPath = path.join(__dirname, '..', 'dist', 'src', 'index.js');
const destIndexPath = path.join(__dirname, '..', 'dist', 'index.js');

// Check if the source index.js file exists
if (fs.existsSync(srcIndexPath)) {
  // Copy the file
  fs.copyFileSync(srcIndexPath, destIndexPath);
  console.log('Copied index.js to dist/ root directory');
} else {
  console.error('Error: src/index.js was not found after TypeScript compilation');
  process.exit(1);
}