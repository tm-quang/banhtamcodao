const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        
        // Bỏ qua admin và tailwindcss (modals)
        if (isDirectory && (f === '(admin)' || f === 'tailwindcss')) {
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
    
    // 1. Replace container
    content = content.replace(/max-w-\[1200px\]\s+mx-auto\s+px-[a-z0-9:-]+(?:\s+(?:md|sm|lg|xl):px-[a-z0-9:-]+)*/g, 'page-container');
    
    // Header special case
    content = content.replace(/max-w-\[1200px\]\s+mx-auto\s+flex\s+h-full\s+justify-between\s+items-center\s+px-2/g, 'page-container flex h-full justify-between items-center');

    // Footer special case
    content = content.replace(/relative\s+mx-auto\s+max-w-\[1200px\]\s+px-4\s+pt-12\s+pb-8\s+sm:px-6\s+lg:px-8/g, 'relative page-container pt-8 pb-6');
    content = content.replace(/mx-auto\s+max-w-\[1200px\]\s+px-4\s+sm:px-6\s+lg:px-8/g, 'page-container');

    // 2. Replace section paddings carefully
    // Only replace on `<section ` or `<div ` that currently use py-*
    const sectionPaddingRegexes = [
        /className="([^"]*)py-6\s+md:py-16([^"]*)"/g,
        /className="([^"]*)py-10\s+md:py-16([^"]*)"/g,
        /className="([^"]*)py-12\s+md:py-20([^"]*)"/g,
        /className="([^"]*)py-8\s+md:py-12([^"]*)"/g,
        /className="([^"]*)py-4\s+md:py-8([^"]*)"/g,
        /className="([^"]*)py-4\s+md:py-6([^"]*)"/g,
        /className="([^"]*)py-4\s+md:py-2([^"]*)"/g,
        /className="([^"]*)py-16\s+md:py-20([^"]*)"/g,
        /className="([^"]*)py-8([^"]*)"/g, // Be careful with this one
    ];

    // More safely, let's just replace the exact padding strings
    const paddingsToReplace = [
        'py-6 md:py-16',
        'py-10 md:py-16',
        'py-12 md:py-20',
        'py-8 md:py-12',
        'py-4 md:py-8',
        'py-4 md:py-6',
        'py-4 md:py-2',
        'py-16 md:py-20',
        'pt-24 pb-12 md:py-0', // Hero Section
        'py-16 md:py-24',
    ];

    paddingsToReplace.forEach(pad => {
        // Look for pad within className="..."
        // Replace with section-spacing
        let regex = new RegExp('className="([^"]*?)' + pad.replace(/([-\s])/g, '\\$1') + '([^"]*?)"', 'g');
        content = content.replace(regex, 'className="$1section-spacing$2"');
    });

    // 3. Replace product grids only
    // grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 -> product-grid
    content = content.replace(/grid\s+grid-cols-2\s+md:grid-cols-3\s+lg:grid-cols-4\s+gap-4\s+md:gap-6/g, 'product-grid');
    content = content.replace(/grid\s+grid-cols-1\s+md:grid-cols-3\s+gap-4\s+md:gap-8/g, 'product-grid'); // CategoryHighlights
    
    // 4. ProductCard padding
    if (filePath.endsWith('ProductCard.js')) {
        content = content.replace(/p-3 md:p-4 lg:p-4/g, 'card-padding');
        content = content.replace(/py-3 px-3/g, 'card-padding');
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated:', filePath);
        modifiedFiles++;
    }
});

console.log(`Updated ${modifiedFiles} files.`);
