const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting build process...');

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

        // Handle import statements
        content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g, 'const {$1} = require("$2")');

        // Write the modified content to the destination file
        fs.writeFileSync(destPath, content);
        console.log(`Copied: ${file} -> ${path.basename(destPath)}`);
    });

    console.log('Migration files copied successfully!');

    // Remove all TypeScript migration files from the source directory in dist
    // to prevent TypeORM from trying to load them directly
    console.log('Removing TypeScript migration files to prevent loading issues...');
    try {
        // Create a .js-only migrations directory in the final build
        if (fs.existsSync(path.join(__dirname, '..', 'migrations'))) {
            fs.readdirSync(path.join(__dirname, '..', 'migrations')).forEach(file => {
                if (file.endsWith('.ts')) {
                    // Delete any TypeScript files from the source directory to prevent TypeORM from finding them
                    fs.unlinkSync(path.join(__dirname, '..', 'migrations', file));
                    console.log(`Removed TypeScript file: ${file}`);
                }
            });
        }
    } catch (err) {
        console.error('Warning: Failed to clean up TypeScript migration files:', err);
    }
} else {
    console.log('No migrations directory found.');
}

// Ensure all source files are properly copied
// TypeScript sometimes has issues with the directory structure
console.log('Checking compiled source files...');

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const distDir = path.join(rootDir, 'dist');

// Check if we need to copy src files into dist
if (fs.existsSync(path.join(distDir, 'src'))) {
    console.log('Found dist/src - fixing file structure...');

    // Fix dist structure by moving files from dist/src to dist
    try {
        // Copy all contents from dist/src to dist
        fs.copySync(path.join(distDir, 'src'), distDir, { overwrite: true });
        console.log('Copied all files from dist/src to dist');
    } catch (err) {
        console.error('Error copying files:', err);
    }
}

// Verify key files exist
const requiredFiles = [
    'index.js',
    'config/database.js',
    'data-source.js'
];

let missingFiles = false;
requiredFiles.forEach(file => {
    const filePath = path.join(distDir, file);
    if (!fs.existsSync(filePath)) {
        console.error(`Missing required file: ${file}`);
        missingFiles = true;
    } else {
        console.log(`Verified file exists: ${file}`);
    }
});

if (missingFiles) {
    console.log('Attempting to fix missing files...');

    // Create config directory if it doesn't exist
    fs.ensureDirSync(path.join(distDir, 'config'));

    // Copy source files directly if they're missing in dist
    if (!fs.existsSync(path.join(distDir, 'config/database.js'))) {
        const dbConfigSrc = path.join(srcDir, 'config/database.ts');
        const dbConfigDest = path.join(distDir, 'config/database.js');

        if (fs.existsSync(dbConfigSrc)) {
            // Simple transform of TypeScript to JavaScript
            let content = fs.readFileSync(dbConfigSrc, 'utf8');
            content = content.replace(/\.ts/g, '.js');
            content = content.replace(/import\s+(\w+)\s+from\s+['"](.+)['"];?/g, 'const $1 = require("$2");');
            content = content.replace(/export\s+const/g, 'exports.');

            fs.writeFileSync(dbConfigDest, content);
            console.log('Created database.js from TypeScript source');
        }
    }

    if (!fs.existsSync(path.join(distDir, 'data-source.js'))) {
        const dataSourceSrc = path.join(srcDir, 'data-source.ts');
        const dataSourceDest = path.join(distDir, 'data-source.js');

        if (fs.existsSync(dataSourceSrc)) {
            // Simple transform of TypeScript to JavaScript
            let content = fs.readFileSync(dataSourceSrc, 'utf8');
            content = content.replace(/\.ts/g, '.js');
            content = content.replace(/import\s+(\w+)\s+from\s+['"](.+)['"];?/g, 'const $1 = require("$2");');
            content = content.replace(/export\s+const/g, 'exports.');

            fs.writeFileSync(dataSourceDest, content);
            console.log('Created data-source.js from TypeScript source');
        }
    }
}

// Set NODE_ENV for production in a .env file if it doesn't exist
const envPath = path.join(rootDir, '.env');
if (!fs.existsSync(envPath)) {
    console.log('Creating .env file for production...');
    fs.writeFileSync(envPath, 'NODE_ENV=production\n');
} else {
    // Make sure NODE_ENV is set to production
    let envContent = fs.readFileSync(envPath, 'utf8');
    if (!envContent.includes('NODE_ENV=production')) {
        fs.appendFileSync(envPath, '\nNODE_ENV=production\n');
    }
    console.log('Updated .env file with NODE_ENV=production');
}

console.log('Build process completed.');
