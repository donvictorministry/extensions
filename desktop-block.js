/**
 * STRICT ANDROID DEVICE ENFORCEMENT ENGINE
 * Immediately halts execution and locks out desktop computers.
 */
(function enforceAndroidOnly() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  const isAndroid = /android/i.test(ua);
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isDesktopPointer = window.matchMedia('(pointer: fine)').matches && !isAndroid;

  // Detect non-Android or Desktop Computer
  if (!isAndroid || (isDesktopPointer && !hasTouch)) {
    // Stop all script execution
    window.stop();

    // Render an un-dismissible, edge-to-edge Android Lockout Screen
    document.documentElement.innerHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Access Restricted - Android Only</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, sans-serif; }
          body {
            background-color: #090d16;
            color: #f8fafc;
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            text-align: center;
          }
          .lock-card {
            background: #111827;
            border: 3px solid #dc2626;
            border-radius: 20px;
            padding: 32px 24px;
            max-width: 500px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            align-items: center;
          }
          .lock-icon { width: 64px; height: 64px; fill: #dc2626; }
          h1 { font-size: 24px; font-weight: 900; color: #ef4444; }
          p { font-size: 19px; line-height: 1.6; color: #cbd5e1; }
          .badge {
            background: rgba(220, 38, 38, 0.2);
            color: #ef4444;
            padding: 8px 16px;
            border-radius: 30px;
            font-size: 19px;
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        <div class="lock-card">
          <svg class="lock-icon" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <div class="badge">DEVICE ACCESS DENIED</div>
          <h1>Android Smartphone Required</h1>
          <p>ZenFocus Pro is calibrated exclusively for Android mobile touchscreens.</p>
          <p>Desktop and laptop computers are permanently prohibited from operating this software. Please open this link on an Android smartphone.</p>
        </div>
      </body>
      </html>
    `;
    throw new Error('Non-Android execution terminated.');
  }
})();