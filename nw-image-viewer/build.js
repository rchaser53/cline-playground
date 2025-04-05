/**
 * Custom build script for NW.js application
 * This script creates a build directory and copies all necessary files
 * to create a distributable application.
 */

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

// Convert callbacks to promises
const execAsync = promisify(exec);
const mkdirAsync = promisify(fs.mkdir);
const copyFileAsync = promisify(fs.copyFile);
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build directory
const BUILD_DIR = path.join(__dirname, 'build');
const DIST_DIR = path.join(__dirname, 'dist');

/**
 * Create directory if it doesn't exist
 */
async function ensureDir(dir) {
  try {
    await mkdirAsync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
}

/**
 * Copy a file from source to destination
 */
async function copyFile(src, dest) {
  try {
    await copyFileAsync(src, dest);
    console.log(`Copied: ${src} -> ${dest}`);
  } catch (err) {
    console.error(`Error copying ${src} to ${dest}:`, err);
    throw err;
  }
}

/**
 * Copy a directory recursively
 */
async function copyDir(src, dest) {
  try {
    await execAsync(`cp -R "${src}" "${dest}"`);
    console.log(`Copied directory: ${src} -> ${dest}`);
  } catch (err) {
    console.error(`Error copying directory ${src} to ${dest}:`, err);
    throw err;
  }
}

/**
 * Create a package.json file for the build
 */
async function createPackageJson() {
  try {
    const packageJsonPath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(await readFileAsync(packageJsonPath, 'utf8'));
    
    // Create a simplified package.json for the build
    const buildPackageJson = {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
      main: 'index.html',
      window: packageJson.window,
      'chromium-args': packageJson['chromium-args'],
      'node-remote': packageJson['node-remote'],
      permissions: packageJson.permissions
    };
    
    const buildPackageJsonPath = path.join(BUILD_DIR, 'package.json');
    await writeFileAsync(buildPackageJsonPath, JSON.stringify(buildPackageJson, null, 2));
    console.log(`Created build package.json at ${buildPackageJsonPath}`);
  } catch (err) {
    console.error('Error creating package.json for build:', err);
    throw err;
  }
}

/**
 * Main build function
 */
async function build() {
  try {
    console.log('Starting build process...');
    
    // Create build directory
    await ensureDir(BUILD_DIR);
    
    // Copy index.html
    await copyFile(
      path.join(__dirname, 'index.html'),
      path.join(BUILD_DIR, 'index.html')
    );
    
    // Copy dist directory (webpack output)
    await copyDir(DIST_DIR, path.join(BUILD_DIR, 'dist'));
    
    // Create package.json for build
    await createPackageJson();
    
    console.log('\nBuild completed successfully!');
    console.log(`Build directory: ${BUILD_DIR}`);
    console.log('\nTo create executables, run:');
    console.log('  npm install -g nw-builder');
    console.log(`  nwbuild -p win32,win64,osx64,linux32,linux64 -o ./executables ${BUILD_DIR}`);
    
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }
}

// Run the build
build();
