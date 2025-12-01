const fs = require('fs');
fs.writeFileSync('test_execution.log', 'Script started\n');
console.log("Hello from test script");
setTimeout(() => {
    fs.appendFileSync('test_execution.log', 'Still running...\n');
}, 2000);
setTimeout(() => {
    fs.appendFileSync('test_execution.log', 'Exiting...\n');
}, 4000);
