
console.log('Starting test script...');
try {
    const sqlite3 = require('sqlite3');
    const { open } = require('sqlite');
    console.log('Modules loaded');

    (async () => {
        console.log('Opening DB...');
        const db = await open({
            filename: './test.db',
            driver: sqlite3.Database
        });
        console.log('DB Opened');
        await db.exec('CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY)');
        console.log('Table created');
    })();
} catch (error) {
    console.error('Error:', error);
}
