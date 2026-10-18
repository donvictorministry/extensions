/**
 * ZENFOCUS PRO - SCRIPTURE SYNTHESIS & MEMORY MATRIX
 * File: biblepuzzle.js
 * Authored for Christian Devotion, Scripture Memorization & Academic Rigor.
 * Rule Enforced: Strictly no font size below 19px, zero emojis, no alert().
 */
(function initBiblePuzzle() {
  // 1. Scoped CSS Injection (Strictly >= 19px)
  const style = document.createElement('style');
  style.textContent = `
    .bp-modal {
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
    .bp-modal.active { display: flex; }
    .bp-header {
      height: 64px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
      background: var(--surface, #ffffff);
      border-bottom: 2px solid var(--border, #cbd5e1);
      flex-shrink: 0;
    }
    .bp-header-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: calc(var(--font-size, 19px) + 2px);
      font-weight: 800;
    }
    .bp-close-btn {
      background: var(--surface-alt, #f1f5f9);
      border: 2px solid var(--border, #cbd5e1);
      color: var(--text-main, #0f172a);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: var(--font-size, 19px);
      font-weight: 700;
      cursor: pointer;
    }
    .bp-body {
      flex: 1;
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 500px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }
    .bp-verse-citation {
      background: var(--surface, #ffffff);
      border: 2px solid var(--border, #cbd5e1);
      border-left: 6px solid var(--primary, #4338ca);
      padding: 14px 18px;
      border-radius: 12px;
      font-size: calc(var(--font-size, 19px) + 1px);
      font-weight: 800;
      color: var(--primary, #4338ca);
    }
    .bp-workspace-box {
      min-height: 140px;
      background: var(--surface-alt, #f1f5f9);
      border: 2px dashed var(--border, #cbd5e1);
      border-radius: 14px;
      padding: 14px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-content: flex-start;
      box-sizing: border-box;
    }
    .bp-pool-box {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding: 10px 0;
    }
    .bp-clause-token {
      background: var(--surface, #ffffff);
      color: var(--text-main, #0f172a);
      border: 2px solid var(--border, #cbd5e1);
      padding: 10px 16px;
      border-radius: 10px;
      font-size: var(--font-size, 19px);
      font-weight: 700;
      cursor: pointer;
      line-height: 1.3;
      user-select: none;
    }
    .bp-clause-token:active {
      transform: scale(0.97);
    }
    .bp-workspace-box .bp-clause-token {
      background: var(--primary, #4338ca);
      color: #ffffff;
      border-color: var(--primary, #4338ca);
    }
    .bp-feedback-banner {
      min-height: 30px;
      font-size: var(--font-size, 19px);
      font-weight: 800;
      text-align: center;
      line-height: 1.4;
    }
    .bp-controls {
      display: flex;
      gap: 12px;
      width: 100%;
      margin-top: auto;
    }
    .bp-btn-primary {
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
    .bp-btn-secondary {
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
  modal.id = 'modalBiblePuzzle';
  modal.className = 'bp-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  modal.innerHTML = `
    <header class="bp-header">
      <div class="bp-header-title">
        <svg class="ui-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M19 2H6c-1.2 0-2 .8-2 2v16c0 1.2.8 2 2 2h13c1.2 0 2-.8 2-2V4c0-1.2-.8-2-2-2m-1 18H6V4h2v7l2.5-1.5L13 11V4h5v16Z"/></svg>
        <span>Scripture Synthesis</span>
      </div>
      <button class="bp-close-btn" id="closeBibleBtn">Close</button>
    </header>
    <div class="bp-body">
      <div class="bp-verse-citation" id="bpCitation">Proverbs 3:5-6</div>
      <p style="font-size:var(--font-size, 19px); color:var(--text-muted, #334155); margin:0;">
        Tap clauses to reconstruct the Word in inspired canonical sequence:
      </p>

      <!-- Assembled Verse Tray -->
      <div class="bp-workspace-box" id="bpWorkspace"></div>

      <!-- Scrambled Clause Pool -->
      <div class="bp-pool-box" id="bpPool"></div>

      <div id="bpFeedback" class="bp-feedback-banner"></div>

      <div class="bp-controls">
        <button id="bpVerifyBtn" class="bp-btn-primary">Verify Canonical Order</button>
        <button id="bpNextBtn" class="bp-btn-secondary">New Passage</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // 3. Scripture Catalog (Theological and Meditative Classics)
  const scriptures = [
    {
      citation: "Proverbs 3:5-6 (KJV)",
      clauses: ["Trust in the LORD", "with all thine heart;", "and lean not", "unto thine own understanding.", "In all thy ways", "acknowledge him,", "and he shall direct thy paths."]
    },
    {
      citation: "Philippians 4:8",
      clauses: ["Finally, brethren,", "whatsoever things are true,", "whatsoever things are honest,", "whatsoever things are just,", "whatsoever things are pure,", "whatsoever things are lovely,", "think on these things."]
    },
    {
      citation: "John 1:1-3",
      clauses: ["In the beginning was the Word,", "and the Word was with God,", "and the Word was God.", "The same was in the beginning", "with God.", "All things were made by him."]
    },
    {
      citation: "Isaiah 40:31",
      clauses: ["But they that wait upon the LORD", "shall renew their strength;", "they shall mount up", "with wings as eagles;", "they shall run, and not be weary;", "and they shall walk, and not faint."]
    },
    {
      citation: "Romans 12:2",
      clauses: ["And be not conformed to this world:", "but be ye transformed", "by the renewing of your mind,", "that ye may prove", "what is that good,", "and acceptable,", "and perfect, will of God."]
    }
  ];

  let currentPassageIndex = 0;
  let assembledTokens = [];
  let poolTokens = [];

  const citationEl = modal.querySelector('#bpCitation');
  const workspaceEl = modal.querySelector('#bpWorkspace');
  const poolEl = modal.querySelector('#bpPool');
  const feedbackEl = modal.querySelector('#bpFeedback');

  function loadPassage(index) {
    feedbackEl.textContent = '';
    assembledTokens = [];
    const current = scriptures[index];
    citationEl.textContent = current.citation;

    // Scramble pool
    poolTokens = [...current.clauses].sort(() => Math.random() - 0.5);
    renderPuzzles();
  }

  function renderPuzzles() {
    // Render Workspace
    workspaceEl.innerHTML = '';
    if (assembledTokens.length === 0) {
      workspaceEl.innerHTML = '<span style="color:var(--text-muted, #334155); font-style:italic;">Constructed Scripture will assemble here...</span>';
    } else {
      assembledTokens.forEach((clause, i) => {
        const token = document.createElement('button');
        token.className = 'bp-clause-token';
        token.textContent = clause;
        token.addEventListener('click', () => {
          assembledTokens.splice(i, 1);
          poolTokens.push(clause);
          feedbackEl.textContent = '';
          renderPuzzles();
        });
        workspaceEl.appendChild(token);
      });
    }

    // Render Pool
    poolEl.innerHTML = '';
    poolTokens.forEach((clause, i) => {
      const token = document.createElement('button');
      token.className = 'bp-clause-token';
      token.textContent = clause;
      token.addEventListener('click', () => {
        poolTokens.splice(i, 1);
        assembledTokens.push(clause);
        feedbackEl.textContent = '';
        renderPuzzles();
      });
      poolEl.appendChild(token);
    });
  }

  // Reverent Web Audio Triad Harmonic (No MP3 files)
  function playReverentChord() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const chord = [261.63, 329.63, 392.00, 523.25]; // C Major Triad
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8 + idx * 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 2.0);
    });
  }

  modal.querySelector('#bpVerifyBtn').addEventListener('click', () => {
    const original = scriptures[currentPassageIndex].clauses;
    if (assembledTokens.length !== original.length) {
      feedbackEl.textContent = 'Passage incomplete. Assemble all clauses.';
      feedbackEl.style.color = 'var(--text-muted, #334155)';
      return;
    }

    const isMatch = assembledTokens.every((val, idx) => val === original[idx]);
    if (isMatch) {
      feedbackEl.textContent = 'Amen. Scripture canonical sequence perfectly restored.';
      feedbackEl.style.color = 'var(--success, #16a34a)';
      playReverentChord();
    } else {
      feedbackEl.textContent = 'Sequence misalignment. Review the biblical order and adjust.';
      feedbackEl.style.color = 'var(--danger, #dc2626)';
    }
  });

  modal.querySelector('#bpNextBtn').addEventListener('click', () => {
    currentPassageIndex = (currentPassageIndex + 1) % scriptures.length;
    loadPassage(currentPassageIndex);
  });

  modal.querySelector('#closeBibleBtn').addEventListener('click', () => {
    modal.classList.remove('active');
  });

  // 4. Inject Launch Card into Android Viewport
  const viewport = document.querySelector('.android-viewport');
  if (viewport) {
    const launchCard = document.createElement('section');
    launchCard.className = 'mobile-card';
    launchCard.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h3 style="font-size:calc(var(--font-size, 19px) + 1px); font-weight:800; margin-bottom:4px;">Scripture Synthesis</h3>
          <p style="color:var(--text-muted, #334155); font-size:var(--font-size, 19px);">Meditative canonical Scripture memory</p>
        </div>
        <button id="launchBibleBtn" class="primary-btn" style="width:auto; padding:12px 18px; font-size:var(--font-size, 19px);">Meditate</button>
      </div>
    `;
    viewport.insertBefore(launchCard, viewport.querySelector('.audio-shield-card'));
    document.getElementById('launchBibleBtn').addEventListener('click', () => {
      loadPassage(currentPassageIndex);
      modal.classList.add('active');
    });
  }
})();