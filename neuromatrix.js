/**
 * ZENFOCUS PRO - NEUROMATRIX WORKING MEMORY PRIMER
 * Self-contained module: neuromatrix.js
 * Rule Enforced: Strictly no font size below 19px, zero emojis, no alert().
 */
(function initNeuroMatrix() {
  // 1. Scoped CSS Injection (Strictly >= 19px)
  const style = document.createElement('style');
  style.textContent = `
    .nm-modal {
      display: none;
      position: fixed;
      inset: 0;
      width: 100dvw;
      height: 100dvh;
      background: var(--bg, #f8fafc);
      color: var(--text-main, #0f172a);
      z-index: 2200;
      flex-direction: column;
      overflow-y: auto;
      box-sizing: border-box;
    }
    .nm-modal.active { display: flex; }
    .nm-header {
      height: 64px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
      background: var(--surface, #ffffff);
      border-bottom: 2px solid var(--border, #cbd5e1);
      flex-shrink: 0;
    }
    .nm-header h2 { font-size: calc(var(--font-size, 19px) + 2px); font-weight: 800; }
    .nm-close-btn {
      background: var(--surface-alt, #f1f5f9);
      border: 2px solid var(--border, #cbd5e1);
      color: var(--text-main, #0f172a);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: var(--font-size, 19px);
      font-weight: 700;
      cursor: pointer;
    }
    .nm-body {
      flex: 1;
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      max-width: 480px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }
    .nm-telemetry {
      display: flex;
      justify-content: space-between;
      width: 100%;
      background: var(--surface, #ffffff);
      border: 2px solid var(--border, #cbd5e1);
      padding: 14px 18px;
      border-radius: 12px;
      font-size: var(--font-size, 19px);
      font-weight: 700;
    }
    .nm-status-banner {
      width: 100%;
      text-align: center;
      font-size: var(--font-size, 19px);
      font-weight: 800;
      color: var(--primary, #4338ca);
      min-height: 28px;
    }
    .nm-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      width: 100%;
      max-width: 320px;
      aspect-ratio: 1;
      margin: 10px 0;
    }
    .nm-cell {
      background: var(--surface-alt, #f1f5f9);
      border: 3px solid var(--border, #cbd5e1);
      border-radius: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, transform 0.1s;
    }
    .nm-cell:active { transform: scale(0.95); }
    .nm-cell.active-flash {
      background: var(--primary, #4338ca) !important;
      border-color: var(--primary, #4338ca) !important;
    }
    .nm-cell.user-success {
      background: var(--success, #16a34a) !important;
      border-color: var(--success, #16a34a) !important;
    }
    .nm-cell.user-fail {
      background: var(--danger, #dc2626) !important;
      border-color: var(--danger, #dc2626) !important;
    }
    .nm-action-btn {
      width: 100%;
      background: var(--primary, #4338ca);
      color: #ffffff;
      border: none;
      padding: 16px;
      border-radius: 12px;
      font-size: var(--font-size, 19px);
      font-weight: 800;
      cursor: pointer;
    }
    .nm-action-btn:active { opacity: 0.9; }
  `;
  document.head.appendChild(style);

  // 2. DOM Construct: Modal
  const modal = document.createElement('div');
  modal.id = 'modalNeuroMatrix';
  modal.className = 'nm-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  modal.innerHTML = `
    <header class="nm-header">
      <h2>Neuro-Matrix Primer</h2>
      <button class="nm-close-btn" id="closeNeuroBtn">Close</button>
    </header>
    <div class="nm-body">
      <div class="nm-telemetry">
        <span>Span: <strong id="nmLevel">3 Nodes</strong></span>
        <span>Peak Score: <strong id="nmHighScore">0</strong></span>
      </div>
      <div id="nmStatus" class="nm-status-banner">Tap Start to Prime Working Memory</div>
      
      <div class="nm-grid" id="nmGrid">
        <button class="nm-cell" data-index="0" aria-label="Block 1"></button>
        <button class="nm-cell" data-index="1" aria-label="Block 2"></button>
        <button class="nm-cell" data-index="2" aria-label="Block 3"></button>
        <button class="nm-cell" data-index="3" aria-label="Block 4"></button>
        <button class="nm-cell" data-index="4" aria-label="Block 5"></button>
        <button class="nm-cell" data-index="5" aria-label="Block 6"></button>
        <button class="nm-cell" data-index="6" aria-label="Block 7"></button>
        <button class="nm-cell" data-index="7" aria-label="Block 8"></button>
        <button class="nm-cell" data-index="8" aria-label="Block 9"></button>
      </div>

      <button id="nmStartBtn" class="nm-action-btn">Initiate Sequence</button>
    </div>
  `;
  document.body.appendChild(modal);

  // 3. Audio & State Engine
  let audioCtx = null;
  const frequencies = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33];
  let sequence = [];
  let userPlayback = [];
  let currentLevel = 3;
  let isDisplaying = false;
  let highScore = parseInt(localStorage.getItem('zf_nm_highscore') || '0', 10);

  const levelDisplay = modal.querySelector('#nmLevel');
  const highScoreDisplay = modal.querySelector('#nmHighScore');
  const statusDisplay = modal.querySelector('#nmStatus');
  const startBtn = modal.querySelector('#nmStartBtn');
  const cells = modal.querySelectorAll('.nm-cell');

  highScoreDisplay.textContent = highScore.toString();

  function playTone(freq) {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  }

  async function displaySequence() {
    isDisplaying = true;
    userPlayback = [];
    statusDisplay.textContent = 'Memorize Sequence...';
    startBtn.style.opacity = '0.5';
    startBtn.disabled = true;

    for (let i = 0; i < sequence.length; i++) {
      await new Promise(r => setTimeout(r, 450));
      const cellIndex = sequence[i];
      cells[cellIndex].classList.add('active-flash');
      playTone(frequencies[cellIndex]);
      await new Promise(r => setTimeout(r, 400));
      cells[cellIndex].classList.remove('active-flash');
    }

    isDisplaying = false;
    statusDisplay.textContent = 'Replicate Sequence';
  }

  function handleCellClick(e) {
    if (isDisplaying || sequence.length === 0) return;
    const clickedIdx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
    userPlayback.push(clickedIdx);

    playTone(frequencies[clickedIdx]);
    const step = userPlayback.length - 1;

    if (userPlayback[step] !== sequence[step]) {
      // Failed sequence
      e.currentTarget.classList.add('user-fail');
      statusDisplay.textContent = 'Sequence Break. Memory Reset.';
      setTimeout(() => {
        e.currentTarget.classList.remove('user-fail');
        currentLevel = 3;
        levelDisplay.textContent = `${currentLevel} Nodes`;
        sequence = [];
        startBtn.disabled = false;
        startBtn.style.opacity = '1';
        startBtn.textContent = 'Try Again';
      }, 700);
      return;
    }

    // Flash success step
    e.currentTarget.classList.add('user-success');
    setTimeout(() => e.currentTarget.classList.remove('user-success'), 200);

    // Level Complete
    if (userPlayback.length === sequence.length) {
      statusDisplay.textContent = 'Span Synchronized!';
      if (currentLevel > highScore) {
        highScore = currentLevel;
        localStorage.setItem('zf_nm_highscore', highScore);
        highScoreDisplay.textContent = highScore.toString();
      }

      currentLevel++;
      levelDisplay.textContent = `${currentLevel} Nodes`;
      setTimeout(startRound, 1000);
    }
  }

  function startRound() {
    sequence = [];
    for (let i = 0; i < currentLevel; i++) {
      sequence.push(Math.floor(Math.random() * 9));
    }
    displaySequence();
  }

  startBtn.addEventListener('click', () => {
    currentLevel = 3;
    levelDisplay.textContent = `${currentLevel} Nodes`;
    startRound();
  });

  cells.forEach(c => c.addEventListener('click', handleCellClick));

  // Modal Open/Close Controls
  modal.querySelector('#closeNeuroBtn').addEventListener('click', () => {
    modal.classList.remove('active');
    sequence = [];
    isDisplaying = false;
  });

  // 4. Inject Launch Card into Android Viewport
  const viewport = document.querySelector('.android-viewport');
  if (viewport) {
    const launchCard = document.createElement('section');
    launchCard.className = 'mobile-card';
    launchCard.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h3 style="font-size:calc(var(--font-size, 19px) + 1px); font-weight:800; margin-bottom:4px;">Cognitive Primer</h3>
          <p style="color:var(--text-muted, #334155); font-size:var(--font-size, 19px);">Calibrate spatial working memory</p>
        </div>
        <button id="launchNeuroBtn" class="primary-btn" style="width:auto; padding:12px 18px; font-size:var(--font-size, 19px);">Engage</button>
      </div>
    `;
    viewport.insertBefore(launchCard, viewport.querySelector('.audio-shield-card'));
    document.getElementById('launchNeuroBtn').addEventListener('click', () => {
      modal.classList.add('active');
    });
  }
})();