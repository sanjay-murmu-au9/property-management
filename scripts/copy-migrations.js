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

// Possible locations for index.js after TypeScript compilation
const possibleIndexPaths = [
  path.join(__dirname, '..', 'dist', 'src', 'index.js'),
  path.join(__dirname, '..', 'dist', 'index.js'), // Already might exist
  path.join(__dirname, '..', 'dist', 'src/index.js')
];

const destIndexPath = path.join(__dirname, '..', 'dist', 'index.js');

// Try to find and copy index.js from possible locations
let foundIndex = false;
for (const srcPath of possibleIndexPaths) {
  if (fs.existsSync(srcPath) && srcPath !== destIndexPath) {
    fs.copyFileSync(srcPath, destIndexPath);
    console.log(`Copied index.js from ${srcPath} to dist/ root directory`);
    foundIndex = true;
    break;
  }
}

// If index.js isn't found, create a simple entry point that requires from src/index.js
if (!foundIndex) {
  console.warn('Warning: Could not find index.js in expected locations');
  console.log('Creating a fallback entry point...');

  // Create a simple fallback entry point
  const fallbackContent = `
// Fallback entry point created by build script
try {
  require('./src/index.js');
} catch (error) {
  console.error('Failed to load application:', error);
  process.exit(1);
}
`;

  fs.writeFileSync(destIndexPath, fallbackContent);
  console.log('Created fallback entry point in dist/index.js');
}