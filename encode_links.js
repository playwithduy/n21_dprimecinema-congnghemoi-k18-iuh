const fs = require('fs');
const path = require('path');

const dir = 'C:\\xampp\\htdocs\\N25_CNM_DPRIME\\frontend\\public';

function walk(currentDir) {
    const files = fs.readdirSync(currentDir);
    for (const f of files) {
        const fullPath = path.join(currentDir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.php') || fullPath.endsWith('.js') || fullPath.endsWith('.css') || fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Regex to find "index.php?page=" followed by word-like characters
            const regex = /index\.php\?page=([a-zA-Z0-9-]+)/g;
            let modified = false;

            const newContent = content.replace(regex, (match, pageName) => {
                modified = true;
                const encoded = Buffer.from(pageName).toString('base64');
                return `index.php?p=${encoded}`;
            });

            if (modified) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Modified: ${fullPath}`);
            }
        }
    }
}

walk(dir);
console.log("Done transforming page links!");
