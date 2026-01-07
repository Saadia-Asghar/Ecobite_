
import fetch from 'node-fetch';

async function triggerSeed() {
    try {
        const response = await fetch('http://localhost:3002/api/test/seed', {
            method: 'POST'
        });
        const data = await response.json();
        console.log('Seed response:', data);
    } catch (error) {
        console.error('Seed trigger failed:', error);
    }
}

triggerSeed();
