const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        
        if (isDirectory && f === '(admin)') {
            return;
        }

        isDirectory ? 
            walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let modifiedFiles = 0;

walkDir(directoryPath, function(filePath) {
    if (!filePath.endsWith('.js') && !filePath.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Replace section paddings
    // e.g. py-6 md:py-16 or py-10 md:py-16 -> section-spacing
    content = content.replace(/py-[0-9]+\s+(?:md|sm|lg|xl):py-[0-9]+/g, 'section-spacing');
    
    // Replace grid configurations
    // e.g. grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6
    const gridRegex = /grid\s+grid-cols-[0-9]+\s+(?:md|sm|lg|xl):grid-cols-[0-9]+(?:\s+(?:md|sm|lg|xl):grid-cols-[0-9]+)?\s+gap-[0-9]+(?:\s+(?:md|sm|lg|xl):gap-[0-9]+)?/g;
    content = content.replace(gridRegex, 'product-grid');
    
    // Replace specific grid in MenuSection where it might be slightly different
    // e.g. grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6
    const gridRegex2 = /grid\s+grid-cols-[0-9]+(?:\s+(?:md|sm|lg|xl):grid-cols-[0-9]+)+\s+gap-[0-9]+(?:\s+(?:md|sm|lg|xl):gap-[0-9]+)*/g;
    content = content.replace(gridRegex2, 'product-grid');
    
    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated:', filePath);
        modifiedFiles++;
    }
});

console.log(`Updated ${modifiedFiles} files.`);
