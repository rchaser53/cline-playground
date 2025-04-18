#!/usr/bin/env node

/**
 * Create executables using NW.js directly
 * This script downloads NW.js binaries and packages the application
 * without relying on nw-builder
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import https from 'https';
import { createWriteStream } from 'fs';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Promisify exec
const execAsync = promisify(exec);

// NW.js version to use
const NW_VERSION = '0.70.1';

// All available platforms
const ALL_PLATFORMS = [
  { name: 'win32', displayName: 'Windows 32-bit', url: `https://dl.nwjs.io/v${NW_VERSION}/nwjs-v${NW_VERSION}-win-ia32.zip` },
  { name: 'win64', displayName: 'Windows 64-bit', url: `https://dl.nwjs.io/v${NW_VERSION}/nwjs-v${NW_VERSION}-win-x64.zip` },
  { name: 'osx64', displayName: 'macOS 64-bit', url: `https://dl.nwjs.io/v${NW_VERSION}/nwjs-v${NW_VERSION}-osx-x64.zip` },
  { name: 'linux32', displayName: 'Linux 32-bit', url: `https://dl.nwjs.io/v${NW_VERSION}/nwjs-v${NW_VERSION}-linux-ia32.tar.gz` },
  { name: 'linux64', displayName: 'Linux 64-bit', url: `https://dl.nwjs.io/v${NW_VERSION}/nwjs-v${NW_VERSION}-linux-x64.tar.gz` }
];

// Get target platforms from environment variable
const TARGET_PLATFORM = process.env.TARGET_PLATFORM;

// Filter platforms based on environment variable
let PLATFORMS = ALL_PLATFORMS;

if (TARGET_PLATFORM) {
  // Split by comma if multiple platforms are specified
  const targetPlatforms = TARGET_PLATFORM.split(',').map(p => p.trim());
  
  // Filter platforms
  PLATFORMS = ALL_PLATFORMS.filter(platform => 
    targetPlatforms.includes(platform.name)
  );
  
  // Log selected platforms
  if (PLATFORMS.length === 0) {
    console.warn(`Warning: No valid platforms found for TARGET_PLATFORM=${TARGET_PLATFORM}`);
    console.warn('Valid platform names are: ' + ALL_PLATFORMS.map(p => p.name).join(', '));
    console.warn('Building for all platforms instead.');
    PLATFORMS = ALL_PLATFORMS;
  } else {
    console.log(`Building for platforms: ${PLATFORMS.map(p => p.displayName).join(', ')}`);
  }
} else {
  console.log('TARGET_PLATFORM environment variable not set. Building for all platforms.');
}

// Directories
const BUILD_DIR = path.resolve('./build');
const CACHE_DIR = path.resolve('./cache');
const OUTPUT_DIR = path.resolve('./executables');

/**
 * Create directory if it doesn't exist
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

/**
 * Download a file from a URL
 */
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode} ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

/**
 * Extract a zip file
 */
function extractZip(zipFile, destDir) {
  return execAsync(`unzip -o "${zipFile}" -d "${destDir}"`);
}

/**
 * Extract a tar.gz file
 */
function extractTarGz(tarGzFile, destDir) {
  return execAsync(`tar -xzf "${tarGzFile}" -C "${destDir}"`);
}

/**
 * Copy directory recursively
 */
function copyDir(src, dest) {
  return execAsync(`cp -R "${src}"/* "${dest}"`);
}

/**
 * Create executables for all platforms
 */
async function createExecutables() {
  try {
    console.log('Creating executables using NW.js directly...');
    console.log(`NW.js version: ${NW_VERSION}`);
    
    // Check if build directory exists
    if (!fs.existsSync(BUILD_DIR)) {
      console.error(`Error: Build directory '${BUILD_DIR}' does not exist.`);
      console.error('Please run \'npm run package\' first to create the build directory.');
      process.exit(1);
    }
    
    // Create cache and output directories
    ensureDir(CACHE_DIR);
    ensureDir(OUTPUT_DIR);
    
    // Process each platform
    for (const platform of PLATFORMS) {
      console.log(`\nProcessing ${platform.displayName}...`);
      
      // Create platform-specific output directory
      const platformOutputDir = path.join(OUTPUT_DIR, platform.name);
      ensureDir(platformOutputDir);
      
      // Download NW.js if not already cached
      const nwjsFileName = path.basename(platform.url);
      const nwjsFilePath = path.join(CACHE_DIR, nwjsFileName);
      
      if (!fs.existsSync(nwjsFilePath)) {
        console.log(`Downloading NW.js for ${platform.displayName}...`);
        await downloadFile(platform.url, nwjsFilePath);
        console.log('Download complete.');
      } else {
        console.log(`Using cached NW.js for ${platform.displayName}.`);
      }
      
      // Extract NW.js
      console.log(`Extracting NW.js for ${platform.displayName}...`);
      const extractDir = path.join(CACHE_DIR, `nwjs-${platform.name}`);
      ensureDir(extractDir);
      
      if (nwjsFileName.endsWith('.zip')) {
        await extractZip(nwjsFilePath, extractDir);
      } else if (nwjsFileName.endsWith('.tar.gz')) {
        await extractTarGz(nwjsFilePath, extractDir);
      }
      
      // Find the extracted NW.js directory
      const nwjsDirName = fs.readdirSync(extractDir).find(name => name.startsWith('nwjs'));
      if (!nwjsDirName) {
        throw new Error(`Could not find NW.js directory in ${extractDir}`);
      }
      
      const nwjsDir = path.join(extractDir, nwjsDirName);
      
      // Copy NW.js to output directory
      console.log(`Copying NW.js to output directory...`);
      await copyDir(nwjsDir, platformOutputDir);
      
      // Package the application
      console.log(`Packaging application for ${platform.displayName}...`);
      
      if (platform.name.startsWith('win')) {
        // For Windows, create a package.nw directory
        const packageDir = path.join(platformOutputDir, 'package.nw');
        ensureDir(packageDir);
        await copyDir(BUILD_DIR, packageDir);
      } else if (platform.name.startsWith('osx')) {
        // For macOS, handle app packaging with idempotency
        const appName = 'NW.js Image Viewer';
        const sourceApp = path.join(platformOutputDir, 'nwjs.app');
        const targetApp = path.join(platformOutputDir, `${appName}.app`);
        
        // Check if target app already exists and remove it if necessary
        if (fs.existsSync(targetApp)) {
          console.log(`Target app already exists. Removing ${targetApp}...`);
          await execAsync(`rm -rf "${targetApp}"`);
        }
        
        // Check if source app exists
        if (fs.existsSync(sourceApp)) {
          // Copy files to nwjs.app/Contents/Resources/app.nw
          const appDir = path.join(sourceApp, 'Contents', 'Resources', 'app.nw');
          ensureDir(appDir);
          await copyDir(BUILD_DIR, appDir);
          
          // Rename the app
          console.log(`Renaming app to ${appName}.app...`);
          await execAsync(`mv "${sourceApp}" "${targetApp}"`);
        } else if (!fs.existsSync(targetApp)) {
          // Neither source nor target exists, extract again
          console.log('Source app not found. Re-extracting NW.js...');
          
          // Re-extract NW.js
          const nwjsFileName = path.basename(platform.url);
          const nwjsFilePath = path.join(CACHE_DIR, nwjsFileName);
          const extractDir = path.join(CACHE_DIR, `nwjs-${platform.name}`);
          
          // Clear extract directory and re-extract
          await execAsync(`rm -rf "${extractDir}"`);
          ensureDir(extractDir);
          
          if (nwjsFileName.endsWith('.zip')) {
            await extractZip(nwjsFilePath, extractDir);
          } else if (nwjsFileName.endsWith('.tar.gz')) {
            await extractTarGz(nwjsFilePath, extractDir);
          }
          
          // Find the extracted NW.js directory
          const nwjsDirName = fs.readdirSync(extractDir).find(name => name.startsWith('nwjs'));
          if (!nwjsDirName) {
            throw new Error(`Could not find NW.js directory in ${extractDir}`);
          }
          
          const nwjsDir = path.join(extractDir, nwjsDirName);
          
          // Copy NW.js to output directory
          await copyDir(nwjsDir, platformOutputDir);
          
          // Now continue with app packaging
          const appDir = path.join(sourceApp, 'Contents', 'Resources', 'app.nw');
          ensureDir(appDir);
          await copyDir(BUILD_DIR, appDir);
          
          // Rename the app
          console.log(`Renaming app to ${appName}.app...`);
          await execAsync(`mv "${sourceApp}" "${targetApp}"`);
        } else {
          // Target app already exists but source doesn't
          console.log(`${appName}.app already exists. Updating application files...`);
          
          // Update app files
          const appDir = path.join(targetApp, 'Contents', 'Resources', 'app.nw');
          ensureDir(appDir);
          await copyDir(BUILD_DIR, appDir);
        }
      } else {
        // For Linux, create a package.nw directory
        const packageDir = path.join(platformOutputDir, 'package.nw');
        ensureDir(packageDir);
        await copyDir(BUILD_DIR, packageDir);
      }
      
      console.log(`Successfully packaged application for ${platform.displayName}.`);
    }
    
    console.log('\nExecutables created successfully!');
    console.log(`Output directory: ${OUTPUT_DIR}`);
    
  } catch (error) {
    console.error('Error creating executables:', error);
    process.exit(1);
  }
}

// Run the script
createExecutables();
