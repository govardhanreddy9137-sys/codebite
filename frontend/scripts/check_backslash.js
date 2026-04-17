const fs = require('fs');
const content = fs.readFileSync('foods_utf8.json', 'utf8');
const lines = content.split('\n');
let found = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].indexOf('\\') !== -1) {
        console.log(`Line ${i + 1}: ${lines[i].trim()}`);
        found = true;
    }
}
if (!found) {
    console.log("No backslashes found");
}
