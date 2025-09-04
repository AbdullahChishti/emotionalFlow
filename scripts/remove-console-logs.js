#!/usr/bin/env node

/**
 * Script to remove console.log statements from production build
 * This helps reduce bundle size and improve performance
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Files to process
const srcDir = path.join(__dirname, '../src');
const patterns = [
  '**/*.tsx',
  '**/*.ts',
  '**/*.js',
  '**/*.jsx'
];

// Exclude test files and node_modules
const excludePatterns = [
  '**/node_modules/**',
  '**/*.test.*',
  '**/*.spec.*',
  '**/test/**',
  '**/debug/**'
];

function removeConsoleLogs(content) {
  // Remove console.log statements but keep console.error and console.warn
  return content
    .replace(/console\.log\([^)]*\);?\s*/g, '')
    .replace(/console\.debug\([^)]*\);?\s*/g, '')
    .replace(/console\.info\([^)]*\);?\s*/g, '')
    // Keep console.error and console.warn for production debugging
    // .replace(/console\.error\([^)]*\);?\s*/g, '')
    // .replace(/console\.warn\([^)]*\);?\s*/g, '')
    .replace(/\n\s*\n\s*\n/g, '\n\n'); // Clean up extra newlines
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const cleanedContent = removeConsoleLogs(content);
    
    if (content !== cleanedContent) {
      fs.writeFileSync(filePath, cleanedContent);
      console.log(`Cleaned: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function main() {
  console.log('Removing console.log statements from source files...');
  
  patterns.forEach(pattern => {
    const files = glob.sync(pattern, {
      cwd: srcDir,
      ignore: excludePatterns,
      absolute: true
    });
    
    files.forEach(processFile);
  });
  
  console.log('Console.log removal complete!');
}

if (require.main === module) {
  main();
}

module.exports = { removeConsoleLogs, processFile };
