import express from 'express';

const app = express();

app.get('/api/products', async (req, res) => {
    // delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    res.json([{ id: 1, name: 'product 1' }]);
});

app.listen(6500, () => console.log('Running server on 6500'));
