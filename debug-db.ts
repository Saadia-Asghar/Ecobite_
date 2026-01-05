
import { initDB } from './server/db.js';
import fs from 'fs';

async function test() {
    const log = (msg) => fs.appendFileSync('debug-log.txt', msg + '\n');
    log('Starting DB init test...');
    try {
        await initDB();
        log('DB init SUCCESS');
    } catch (err) {
        log('DB init FAILED: ' + err.toString());
        if (err instanceof Error) log(err.stack || '');
    }
}

test();
