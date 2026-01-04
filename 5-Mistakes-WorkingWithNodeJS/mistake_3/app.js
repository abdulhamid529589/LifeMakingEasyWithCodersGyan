import express from 'express';
import { Worker } from 'node:worker_threads';

const app = express();

function runWorker() {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./worker.js');

        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) reject(new Error(`Worker stopped with code ${code}`));
        });
    });
}

/**
 * Blocking event loop
 */
app.get('/', async (req, res) => {
    /**
     * ‼️ BAD example
     */
    // video processing, image processing, cryptography, financial calculation
    // let sum = 0;
    // for (let i = 0; i < 1e9; i++) {
    //     sum += i;
    // }

    /**
     * ✅ Good example
     */

    const result = await runWorker();

    res.send(`Done with blocking work!: ${result}`);
});

app.listen(4500, () => console.log('Running server on 4500'));
