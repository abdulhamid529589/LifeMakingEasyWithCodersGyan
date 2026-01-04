import express from 'express';
import pino from 'pino';

const app = express();
const logger = pino({ level: 'info' });

app.get('/', (req, res) => {
    /**
     * ‼️ BAD example
     */
    // console.log('Request received:', req.url);

    /**
     * ✅ Good example
     */
    logger.info({ url: req.url }, 'Request received');
    res.send('Hello World');
});

app.listen(4500, () => console.log('Running server on 4500'));
