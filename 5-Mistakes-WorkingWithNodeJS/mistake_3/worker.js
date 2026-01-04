import { parentPort } from 'node:worker_threads';

// Heavy work runs here, not blocking the main thread
// video processing, financial calculations, image processing, cryptography
let sum = 0;
for (let i = 0; i < 1e9; i++) {
    sum += i;
}

parentPort?.postMessage(sum);
