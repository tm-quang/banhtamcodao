/**
 * Simple script to convert file header comments from // to JSDoc
 * @file scripts/fix-comments-simple.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * Process a single file
 * @param {string} filePath - Path to the file
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    /**
     * Fix file header comments (// src/...)
     */
    const fileHeaderPattern = /^\/\/\s*(src\/[^\n]+)/m;
    if (fileHeaderPattern.test(content)) {
      const match = content.match(fileHeaderPattern);
      if (match) {
        const filePath = match[1];
        const replacement = `/**\n * ${filePath}\n * @file ${filePath}\n */`;
        content = content.replace(fileHeaderPattern, replacement);
        modified = true;
      }
    }

    /**
     * Fix simple // comments that are on their own line (not inline)
     */
    const lines = content.split('\n');
    const newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      /**
       * Skip if already JSDoc or if it's an inline comment
       */
      if (trimmed.startsWith('//') && !trimmed.startsWith('//*') && !trimmed.startsWith('//!')) {
        /**
         * Check if it's a standalone comment (not inline)
         */
        if (trimmed === '//' || trimmed.match(/^\/\/\s+[^/]/)) {
          const commentText = trimmed.replace(/^\/\/\s*/, '');
          if (commentText && !commentText.startsWith('http') && !commentText.startsWith('www')) {
            /**
             * Convert to JSDoc, preserving indentation
             */
            const indent = line.match(/^(\s*)/)[1];
            newLines.push(`${indent}/** ${commentText} */`);
            modified = true;
            continue;
          }
        }
      }
      
      newLines.push(line);
    }
    
    if (modified) {
      content = newLines.join('\n');
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed: ${path.relative(projectRoot, filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  const srcDir = path.join(projectRoot, 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error('src directory not found');
    process.exit(1);
  }

  /**
   * Find all JS files
   */
  const files = await glob('**/*.js', {
    cwd: srcDir,
    absolute: true,
    ignore: ['**/node_modules/**', '**/.next/**']
  });

  console.log(`Found ${files.length} files to process\n`);

  let fixedCount = 0;
  for (const file of files) {
    if (processFile(file)) {
      fixedCount++;
    }
  }

  console.log(`\n✓ Fixed ${fixedCount} out of ${files.length} files`);
}

main().catch(console.error);




