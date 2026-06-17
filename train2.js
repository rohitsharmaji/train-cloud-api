const { chromium } = require('playwright-core');

async function getLiveTrainData(fromStn, toStn, date) {
    // Shared hosting ke liye low-resource configuration
    const browser = await chromium.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    const context = await browser.newContext();
    const page = await context.newPage();

    let targetData = null;
    
    // Live Network Request Interception
    page.on('response', async (response) => {
        if (response.url().includes('train-search') && response.status() === 200) {
            try {
                targetData = await response.json();
            } catch (e) {}
        }
    });

    const targetUrl = `https://www.confirmtkt.com/train-search?fromCode=${fromStn}&toCode=${toStn}&date=${date}`;
    
    try {
        await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (err) {
        // Timeout hone par bhi jitna data mila use process karne ka mauka milega
    }

    await browser.close();
    return targetData;
}

const args = process.argv.slice(2);
getLiveTrainData(args[0], args[1], args[2]).then(data => {
    if (data) {
        console.log(JSON.stringify(data));
    } else {
        console.log(JSON.stringify({ success: false, message: "No intercepted data found" }));
    }
});