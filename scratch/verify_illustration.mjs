import http from 'http';
import { spawn } from 'child_process';
import fs from 'fs';

async function run() {
  console.log('Testing Clario auth page illustration showcase in browser...');

  // Start Edge in remote debugging mode
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const userDataDir = 'C:\\Users\\Hp\\.gemini\\antigravity-ide\\brain\\5741739e-5837-46d9-bb5d-a32c4028fc71\\scratch\\edge_profile';

  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--no-sandbox',
    'http://localhost:5173/login'
  ]);

  // Wait for remote debugging endpoint
  await new Promise(r => setTimeout(r, 2500));

  try {
    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const pages = await listRes.json();
    const page = pages.find(p => p.url.includes('localhost:5173') || p.type === 'page');

    if (!page || !page.webSocketDebuggerUrl) {
      throw new Error('No page WebSocket URL found: ' + JSON.stringify(pages));
    }

    const ws = new globalThis.WebSocket(page.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        const handler = (evt) => {
          const msg = JSON.parse(evt.data);
          if (msg.id === id) {
            ws.removeEventListener('message', handler);
            if (msg.error) reject(msg.error);
            else resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    // Set viewport to 1280x800 desktop
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false
    });

    // Wait for render
    await new Promise(r => setTimeout(r, 2000));

    // Evaluate DOM
    const evalRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const showcase = document.querySelector('aside[aria-label="Clario workplace knowledge showcase"]');
        const illustration = document.querySelector('[role="img"]');
        const sourceDoc = document.body.innerText.includes('Parental_Leave_Policy.pdf');
        const verifiedBadge = document.body.innerText.includes('Evidence verified');
        const answerCard = document.body.innerText.includes('16 weeks of paid leave');
        const caption = document.body.innerText.includes('Every answer. Grounded in your knowledge.');
        const rightPanelForm = document.querySelector('form');
        const emailField = document.querySelector('input[type="email"]');
        const passwordField = document.querySelector('input[type="password"]');

        return {
          showcaseFound: !!showcase,
          illustrationFound: !!illustration,
          illustrationSvgCount: document.querySelectorAll('svg').length,
          sourceDocFound: sourceDoc,
          verifiedBadgeFound: verifiedBadge,
          answerCardFound: answerCard,
          captionFound: caption,
          formIntact: !!rightPanelForm,
          fieldsIntact: !!emailField && !!passwordField,
          showcaseRect: showcase ? {
            width: showcase.offsetWidth,
            height: showcase.offsetHeight
          } : null
        };
      })()`,
      returnByValue: true
    });

    console.log('DOM Evaluation Result:', JSON.stringify(evalRes.result.value, null, 2));

    // Capture light screenshot
    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    const screenshotPath = 'C:\\Users\\Hp\\.gemini\\antigravity-ide\\brain\\5741739e-5837-46d9-bb5d-a32c4028fc71\\scratch\\auth_illustration_showcase.png';
    fs.writeFileSync(screenshotPath, Buffer.from(screenshot.data, 'base64'));
    console.log('Light screenshot saved to:', screenshotPath);

    // Toggle dark mode
    await send('Runtime.evaluate', {
      expression: `document.documentElement.classList.add('dark')`
    });
    await new Promise(r => setTimeout(r, 800));

    // Capture dark screenshot
    const darkScreenshot = await send('Page.captureScreenshot', { format: 'png' });
    const darkPath = 'C:\\Users\\Hp\\.gemini\\antigravity-ide\\brain\\5741739e-5837-46d9-bb5d-a32c4028fc71\\scratch\\auth_illustration_showcase_dark.png';
    fs.writeFileSync(darkPath, Buffer.from(darkScreenshot.data, 'base64'));
    console.log('Dark screenshot saved to:', darkPath);

    ws.close();
  } finally {
    edge.kill();
  }
}

run().catch(err => {
  console.error('Error running test:', err);
  process.exit(1);
});
