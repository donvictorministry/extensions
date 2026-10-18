/**
 * ZENFOCUS PRO - BINARY LOGIC MATRIX (TAKUZU DEDUCTION)
 * Self-contained module: takuzu.js
 * Rule Enforced: Strictly no font size below 19px, zero emojis, no alert().
 */
(function initTakuzu() {
  // 1. Scoped CSS Injection (Strictly >= 19px)
  const style = document.createElement('style');
  style.textContent = `
    .tk-modal {
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
    .tk-modal.active { display: flex; }
    .tk-header {
      height: 64px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
      background: var(--surface, #ffffff);
      border-bottom: 2px solid var(--border, #cbd5e1);
      flex-shrink: 0;
    }
    .tk-header h2 { font-size: calc(var(--font-size, 19px) + 2px); font-weight: 800; }
    .tk-close-btn {
      background: var(--surface-alt, #f1f5f9);
      border: 2px solid var(--border, #cbd5e1);
      color: var(--text-main, #0f172a);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: var(--font-size, 19px);
      font-weight: 700;
      cursor: pointer;
    }
    .tk-body {
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
    .tk-instructions {
      background: var(--surface, #ffffff);
      border: 2px solid var(--border, #cbd5e1);
      border-radius: 12px;
      padding: 14px 16px;
      font-size: var(--font-size, 19px);
      color: var(--text-muted, #334155);
      line-height: 1.4;
      width: 100%;
      box-sizing: border-box;
    }
    .tk-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      width: 100%;
      max-width: 320px;
      aspect-ratio: 1;
      margin: 10px 0;
    }
    .tk-cell {
      background: var(--surface-alt, #f1f5f9);
      border: 2px solid var(--border, #cbd5e1);
      border-radius: 12px;
      font-size: calc(var(--font-size, 19px) + 8px);
      font-weight: 900;
      color: var(--text-main, #0f172a);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      user-select: none;
    }
    .tk-cell.fixed {
      background: var(--surface, #ffffff);
      color: var(--primary, #4338ca);
      border: 3px solid var(--primary, #4338ca);
      cursor: default;
    }
    .tk-cell.error {
      border-color: var(--danger, #dc2626) !important;
      background: rgba(220, 38, 38, 0.15) !important;
    }
    .tk-controls {
      display: flex;
      gap: 12px;
      width: 100%;
    }
    .tk-btn-primary {
      flex: 1;
      background: var(--primary, #4338ca);
      color: #ffffff;
      border: none;
      padding: 14px;
      border-radius: 12px;
      font-size: var(--font-size, 19px);
      font-weight: 800;
      cursor: pointer;
    }
    .tk-btn-secondary {
      background: var(--surface-alt, #f1f5f9);
      color: var(--text-main, #0f172a);
      border: 2px solid var(--border, #cbd5e1);
      padding: 14px 18px;
      border-radius: 12px;
      font-size: var(--font-size, 19px);
      font-weight: 800;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  // 2. DOM Construct: Modal
  const modal = document.createElement('div');
  modal.id = 'modalTakuzu';
  modal.className = 'tk-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  modal.innerHTML = `
    <header class="tk-header">
      <h2>Binary Logic Matrix</h2>
      <button class="tk-close-btn" id="closeTakuzuBtn">Close</button>
    </header>
    <div class="tk-body">
      <div class="tk-instructions">
        <strong>Parity Rules:</strong> Fill with 0 and 1. Equal 0s and 1s per row and column. Max two adjacent identical digits.
      </div>

      <div class="tk-grid" id="tkGrid"></div>

      <div id="tkFeedback" style="font-size:var(--font-size, 19px); font-weight:800; min-height:28px;"></div>

      <div class="tk-controls">
        <button id="tkVerifyBtn" class="tk-btn-primary">Verify Parity</button>
        <button id="tkResetBtn" class="tk-btn-secondary">New Board</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // 3. Engine & Permutation Logic (4x4 Valid Boards)
  const masterGrids = [
    [
      [0, 0, 1, 1],
      [1, 1, 0, 0],
      [0, 1, 0, 1],
      [1, 0, 1, 0]
    ],
    [
      [1, 0, 1, 0],
      [0, 1, 0, 1],
      [1, 1, 0, 0],
      [0, 0, 1, 1]
    ],
    [
      [0, 1, 1, 0],
      [1, 0, 0, 1],
      [1, 1, 0, 0],
      [0, 0, 1, 1]
    ]
  ];

  let currentBoard = [];
  let userGrid = [];
  let fixedMask = [];

  const gridElement = modal.querySelector('#tkGrid');
  const feedbackElement = modal.querySelector('#tkFeedback');

  function generatePuzzle() {
    feedbackElement.textContent = '';
    feedbackElement.style.color = 'inherit';

    const base = masterGrids[Math.floor(Math.random() * masterGrids.length)];
    // Deep clone
    currentBoard = JSON.parse(JSON.stringify(base));

    // Initialize user state and mask out 8 cells (leave 8 clues)
    userGrid = [
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', ''],
      ['', '', '', '']
    ];
    fixedMask = [
      [false, false, false, false],
      [false, false, false, false],
      [false, false, false, false],
      [false, false, false, false]
    ];

    let cluesGiven = 0;
    while (cluesGiven < 8) {
      const r = Math.floor(Math.random() * 4);
      const c = Math.floor(Math.random() * 4);
      if (!fixedMask[r][c]) {
        fixedMask[r][c] = true;
        userGrid[r][c] = currentBoard[r][c].toString();
        cluesGiven++;
      }
    }
    renderGrid();
  }

  function renderGrid() {
    gridElement.innerHTML = '';
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const cell = document.createElement('button');
        cell.className = 'tk-cell';
        cell.textContent = userGrid[r][c];

        if (fixedMask[r][c]) {
          cell.classList.add('fixed');
        } else {
          cell.addEventListener('click', () => {
            feedbackElement.textContent = '';
            // Cycle: '' -> '0' -> '1' -> ''
            if (userGrid[r][c] === '') userGrid[r][c] = '0';
            else if (userGrid[r][c] === '0') userGrid[r][c] = '1';
            else userGrid[r][c] = '';
            cell.textContent = userGrid[r][c];
          });
        }
        gridElement.appendChild(cell);
      }
    }
  }

  function verifySolution() {
    // 1. Check completion
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (userGrid[r][c] === '') {
          feedbackElement.textContent = 'Incomplete matrix. Complete all cells.';
          feedbackElement.style.color = 'var(--text-muted, #334155)';
          return;
        }
      }
    }

    // 2. Validate Row Parity
    for (let r = 0; r < 4; r++) {
      let count0 = 0, count1 = 0;
      for (let c = 0; c < 4; c++) {
        if (userGrid[r][c] === '0') count0++;
        if (userGrid[r][c] === '1') count1++;
        if (c < 2 && userGrid[r][c] === userGrid[r][c+1] && userGrid[r][c] === userGrid[r][c+2]) {
          feedbackElement.textContent = `Triplicate violation in Row ${r + 1}`;
          feedbackElement.style.color = 'var(--danger, #dc2626)';
          return;
        }
      }
      if (count0 !== 2 || count1 !== 2) {
        feedbackElement.textContent = `Unequal 0/1 distribution in Row ${r + 1}`;
        feedbackElement.style.color = 'var(--danger, #dc2626)';
        return;
      }
    }

    // 3. Validate Column Parity
    for (let c = 0; c < 4; c++) {
      let count0 = 0, count1 = 0;
      for (let r = 0; r < 4; r++) {
        if (userGrid[r][c] === '0') count0++;
        if (userGrid[r][c] === '1') count1++;
        if (r < 2 && userGrid[r][c] === userGrid[r+1][c] && userGrid[r][c] === userGrid[r+2][c]) {
          feedbackElement.textContent = `Triplicate violation in Column ${c + 1}`;
          feedbackElement.style.color = 'var(--danger, #dc2626)';
          return;
        }
      }
      if (count0 !== 2 || count1 !== 2) {
        feedbackElement.textContent = `Unequal 0/1 distribution in Column ${c + 1}`;
        feedbackElement.style.color = 'var(--danger, #dc2626)';
        return;
      }
    }

    feedbackElement.textContent = 'Parity Verified. Deduction Optimal!';
    feedbackElement.style.color = 'var(--success, #16a34a)';
  }

  modal.querySelector('#tkVerifyBtn').addEventListener('click', verifySolution);
  modal.querySelector('#tkResetBtn').addEventListener('click', generatePuzzle);
  modal.querySelector('#closeTakuzuBtn').addEventListener('click', () => modal.classList.remove('active'));

  // 4. Inject Launch Card into Android Viewport
  const viewport = document.querySelector('.android-viewport');
  if (viewport) {
    const launchCard = document.createElement('section');
    launchCard.className = 'mobile-card';
    launchCard.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h3 style="font-size:calc(var(--font-size, 19px) + 1px); font-weight:800; margin-bottom:4px;">Parity Logic Matrix</h3>
          <p style="color:var(--text-muted, #334155); font-size:var(--font-size, 19px);">Deductive rest during break intervals</p>
        </div>
        <button id="launchTakuzuBtn" class="primary-btn" style="width:auto; padding:12px 18px; font-size:var(--font-size, 19px);">Solve</button>
      </div>
    `;
    viewport.insertBefore(launchCard, viewport.querySelector('.notes-panel'));
    document.getElementById('launchTakuzuBtn').addEventListener('click', () => {
      generatePuzzle();
      modal.classList.add('active');
    });
  }
})();