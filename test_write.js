const fs = require('fs');
try {
    fs.writeFileSync('I_WAS_HERE.txt', 'Hello from Node!');
    console.log('File written successfully');
} catch (e) {
    console.error('Error writing file:', e);
}
