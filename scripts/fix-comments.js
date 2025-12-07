/**
 * Script to convert single-line comments (//) to JSDoc block comments
 * @file scripts/fix-comments.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * Check if a line is a file header comment
 * @param {string} line - Line to check
 * @returns {boolean}
 */
function isFileHeaderComment(line) {
  const trimmed = line.trim();
  return trimmed.startsWith('//') && (
    trimmed.includes('src/') ||
    trimmed.includes('@file') ||
    trimmed.match(/^\/\/\s*(src|components|app|lib|context|api)/)
  );
}

/**
 * Convert file header comment to JSDoc
 * @param {string} line - Original comment line
 * @returns {string}
 */
function convertFileHeader(line) {
  const trimmed = line.trim();
  if (trimmed.startsWith('// src/')) {
    const filePath = trimmed.replace('// ', '');
    return `/**\n * ${filePath}\n * @file ${filePath}\n */`;
  }
  if (trimmed.startsWith('//')) {
    const content = trimmed.replace('//', '').trim();
    return `/**\n * ${content}\n */`;
  }
  return line;
}

/**
 * Convert regular comment to JSDoc
 * @param {string} line - Original comment line
 * @param {string} nextLine - Next line (to check context)
 * @returns {string}
 */
function convertComment(line, nextLine = '') {
  const trimmed = line.trim();
  
  if (!trimmed.startsWith('//')) {
    return line;
  }

  const commentContent = trimmed.replace(/^\/\/\s*/, '');
  
  if (commentContent.length === 0) {
    return line;
  }

  if (isFileHeaderComment(line)) {
    return convertFileHeader(line);
  }

  if (nextLine.trim().startsWith('function ') || 
      nextLine.trim().startsWith('const ') ||
      nextLine.trim().startsWith('let ') ||
      nextLine.trim().startsWith('export ')) {
    return `  /**\n   * ${commentContent}\n   */`;
  }

  return `  /** ${commentContent} */`;
}

/**
 * Process a single file
 * @param {string} filePath - Path to the file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const newLines = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const nextLine = i + 1 < lines.length ? lines[i + 1] : '';

      if (line.trim().startsWith('//') && !line.trim().startsWith('//*')) {
        if (isFileHeaderComment(line)) {
          const converted = convertFileHeader(line);
          newLines.push(...converted.split('\n'));
          i++;
          continue;
        }

        const converted = convertComment(line, nextLine);
        if (converted.includes('\n')) {
          newLines.push(...converted.split('\n'));
        } else {
          newLines.push(converted);
        }
      } else {
        newLines.push(line);
      }
      i++;
    }

    const newContent = newLines.join('\n');
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

/**
 * Recursively find all JS files
 * @param {string} dir - Directory to search
 * @param {Array<string>} fileList - Accumulated file list
 */
function findJSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
        findJSFiles(filePath, fileList);
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Main function
 */
function main() {
  const srcDir = path.join(projectRoot, 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error('src directory not found');
    process.exit(1);
  }

  const files = findJSFiles(srcDir);
  console.log(`Found ${files.length} files to process`);

  files.forEach(processFile);
  console.log('Done!');
}

main();




