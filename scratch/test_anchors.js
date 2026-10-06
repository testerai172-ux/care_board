const fs = require('fs');

const orig = fs.readFileSync('frontend_desktop/ai-soat-xet.html', 'utf8');

console.log('Original length:', orig.length);
console.log('Contains auth.js:', orig.includes('<script src="../auth.js"></script>'));
console.log('Contains grid:', orig.includes('grid grid-cols-1 xl:grid-cols-12 gap-space-md w-full items-start'));
console.log('Contains toast-notification:', orig.includes('id="toast-notification"'));
