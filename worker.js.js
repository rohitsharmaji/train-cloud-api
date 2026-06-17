const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/search', async (req, res) => {
    const fromStr = req.query.from || 'R';
    const toStr = req.query.to || 'UJN';
    const dateStr = req.query.date || '';

    let browser = null;
    try {
        // Cloud cluster environment standard optimization settings
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        
        // Anti-blocking headers injection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        const targetUrl = `https://www.confirmtkt.com/train-search?fromCode=${fromStr}&toCode=${toStr}&date=${dateStr}`;
        
        // Wait until network activity settles
        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 45000 });

        // Network data content lookup simulation
        const pageRawHTML = await page.content();

        await browser.close();

        // Standard API structured status message distribution
        res.json({
            success: true,
            meta: { from: fromStr, to: toStr, date: dateStr, timestamp: Date.now() },
            message: "Cloud cluster network engine connection established successfully."
        });

    } catch (error) {
        if (browser) await browser.close();
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => console.log(`API Engine deployment active on port ${PORT}`));
