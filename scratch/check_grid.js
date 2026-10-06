const fs = require('fs');
const content = fs.readFileSync('frontend_desktop/ai-soat-xet.html', 'utf8');
const lines = content.split('\n');

console.log('Line 50 length:', lines[49].length);
console.log('Line 51:', lines[50]);
console.log('Line 52 length:', lines[51].length);

const gridContent = lines[49] + '\n' + lines[50] + '\n' + lines[51];
const col5Idx = gridContent.indexOf('xl:col-span-5');
const col7Idx = gridContent.indexOf('xl:col-span-7');
console.log('col5Idx:', col5Idx);
console.log('col7Idx:', col7Idx);
console.log('Col5 snippet:', gridContent.substring(col5Idx, col5Idx + 200));
console.log('Col7 snippet:', gridContent.substring(col7Idx, col7Idx + 200));
