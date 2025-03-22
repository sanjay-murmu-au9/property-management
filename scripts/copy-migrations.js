const fs = require('fs');
const path = require('path');

// Create dist/migrations directory if it doesn't exist
const distMigrationsDir = path.join(__dirname, '..', 'dist', 'migrations');
if (!fs.existsSync(distMigrationsDir)) {
  fs.mkdirSync(distMigrationsDir, { recursive: true });
}

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