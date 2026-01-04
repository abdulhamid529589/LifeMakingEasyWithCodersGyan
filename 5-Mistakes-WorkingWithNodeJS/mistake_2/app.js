import fs from 'node:fs/promises';
import express from 'express';

const app = express();

/**
 * Not using Asynchronous features properly
 */

app.get('/', async (req, res) => {
    /**
     * ‼️ BAD example
     */
    // const data = fs.readFileSync('bigfile.txt', 'utf8');
    /**
     * ✅ Good example
     */

    const data = await fs.readFile('bigfile.txt', 'utf8');

    res.send(data);
});

app.listen(4500, () => console.log('Running server on 4500'));
