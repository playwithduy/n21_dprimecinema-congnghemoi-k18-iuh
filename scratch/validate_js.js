const fs = require('fs');
const content = fs.readFileSync('e:\\N25_CNM_DPRIME\\admin\\pages\\rooms.php', 'utf8');
const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/gi);
if (scriptMatch) {
    scriptMatch.forEach((script, i) => {
        const code = script.replace(/<script>/i, '').replace(/<\/script>/i, '');
        try {
            new Function(code);
            console.log(`Script ${i+1} is syntactically valid.`);
        } catch (e) {
            console.error(`Script ${i+1} has a syntax error:`, e.message);
            // Print surrounding lines of error
            const lines = code.split('\n');
            // Unfortunately Function constructor doesn't give line numbers easily
        }
    });
}
