/**
 * Not using timeouts
 */

async function callPayments(signal) {
    const res = await fetch('http://localhost:6500/api/products', {
        headers: { 'Content-Type': 'application/json' },
        signal,
    });

    if (!res.ok) throw new Error(`Payments failed: ${res.status}`);
    return res.json();
}

const controller = new AbortController();

const t = setTimeout(() => controller.abort(), 3000);

callPayments(controller.signal)
    .then(console.log)
    .catch((e) => console.error('[PAYMENTS_ERROR]', e.message))
    .finally(() => clearTimeout(t));
