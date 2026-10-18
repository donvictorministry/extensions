/**
 * ZENFOCUS PRO - PROVERBS OF WISDOM (HEBREW PARALLELISM ENGINE)
 * File: wisdompuzzle.js
 * Authored for Theological Discernment, Hermeneutics & Biblical Reflection.
 * Rule Enforced: Strictly no font size below 19px, zero emojis, no alert().
 */
(function initWisdomPuzzle() {
  // 1. Scoped CSS Injection (Strictly >= 19px)
  const style = document.createElement('style');
  style.textContent = `
    .wp-modal {
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
    .wp-modal.active { display: flex; }
    .wp-header {
      height: 64px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
      background: var(--surface, #ffffff);
      border-bottom: 2px solid var(--border, #cbd5e1);
      flex-shrink: 0;
    }
    .wp-header-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: calc(var(--font-size, 19px) + 2px);
      font-weight: 800;
    }
    .wp-close-btn {
      background: var(--surface-alt, #f1f5f9);
      border: 2px solid var(--border, #cbd5e1);
      color: var(--text-main, #0f172a);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: var(--font-size, 19px);
      font-weight: 700;
      cursor: pointer;
    }
    .wp-body {
      flex: 1;
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      max-width: 500px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }
    .wp-parallelism-tag {
      background: rgba(67, 56, 202, 0.12);
      color: var(--primary, #4338ca);
      border: 2px solid var(--primary, #4338ca);
      padding: 8px 14px;
      border-radius: 20px;
      font-size: var(--font-size, 19px);
      font-weight: 800;
      display: inline-block;
      width: fit-content;
    }
    .wp-strophe-card {
      background: var(--surface, #ffffff);
      border: 2px solid var(--border, #cbd5e1);
      border-radius: 14px;
      padding: 20px;
      font-size: calc(var(--font-size, 19px) + 2px);
      font-weight: 800;
      line-height: 1.5;
      color: var(--text-main, #0f172a);
    }
    .wp-options-stack {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
    }
    .wp-option-btn {
      background: var(--surface, #ffffff);
      color: var(--text-main, #0f172a);
      border: 2px solid var(--border, #cbd5e1);
      padding: 16px;
      border-radius: 12px;
      font-size: var(--font-size, 19px);
      font-weight: 700;
      text-align: left;
      line-height: 1.4;
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s;
    }
    .wp-option-btn:active {
      background: var(--surface-alt, #f1f5f9);
    }
    .wp-option-btn.correct {
      border-color: var(--success, #16a34a) !important;
      background: rgba(22, 163, 74, 0.15) !important;
    }
    .wp-option-btn.incorrect {
      border-color: var(--danger, #dc2626) !important;
      background: rgba(220, 38, 38, 0.12) !important;
    }
    .wp-hermeneutic-box {
      display: none;
      background: var(--surface-alt, #f1f5f9);
      border: 2px solid var(--border, #cbd5e1);
      border-radius: 12px;
      padding: 16px;
      font-size: var(--font-size, 19px);
      line-height: 1.5;
    }
    .wp-next-btn {
      display: none;
      width: 100%;
      background: var(--primary, #4338ca);
      color: #ffffff;
      border: none;
      padding: 16px;
      border-radius: 12px;
      font-size: var(--font-size, 19px);
      font-weight: 800;
      cursor: pointer;
      margin-top: auto;
    }
  `;
  document.head.appendChild(style);

  // 2. DOM Construct: Modal
  const modal = document.createElement('div');
  modal.id = 'modalWisdom';
  modal.className = 'wp-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  modal.innerHTML = `
    <header class="wp-header">
      <div class="wp-header-title">
        <svg class="ui-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82Z"/></svg>
        <span>Proverbs of Solomon</span>
      </div>
      <button class="wp-close-btn" id="closeWisdomBtn">Close</button>
    </header>
    <div class="wp-body">
      <div id="wpTypeBadge" class="wp-parallelism-tag">Antithetical Parallelism</div>
      
      <div class="wp-strophe-card" id="wpFirstStrophe">
        "A soft answer turneth away wrath..."
      </div>

      <p style="font-size:var(--font-size, 19px); color:var(--text-muted, #334155); margin:0;">
        Discern the inspired completing parallel strophe:
      </p>

      <div class="wp-options-stack" id="wpOptions"></div>

      <div class="wp-hermeneutic-box" id="wpExegesis"></div>

      <button id="wpNextProblemBtn" class="wp-next-btn">Next Proverb</button>
    </div>
  `;
  document.body.appendChild(modal);

  // 3. Wisdom Corpus (Academic & Hermeneutic Focus)
  const corpus = [
    {
      type: "Antithetical Parallelism",
      strophe1: "“A soft answer turneth away wrath...”",
      correct: "...but grievous words stir up anger.",
      distractors: [
        "...and a righteous man shall never be moved.",
        "...but silent counsel deceiveth the simple."
      ],
      reference: "Proverbs 15:1",
      exegesis: "In Hebrew antithetical parallelism, the second clause contrasts sharply with the first to present moral opposites, revealing how verbal humility diffuses fury while abrasive rhetoric inflames it."
    },
    {
      type: "Synonymous Parallelism",
      strophe1: "“Pride goeth before destruction...”",
      correct: "...and an haughty spirit before a fall.",
      distractors: [
        "...and folly is the companion of fools.",
        "...yet humility inheriteth wisdom."
      ],
      reference: "Proverbs 16:18",
      exegesis: "Synonymous parallelism reinforces the primary theological truth by restating the original thought through equivalent imagery, elevating the canonical certainty of divine judgment upon hubris."
    },
    {
      type: "Synthetic Parallelism",
      strophe1: "“The name of the LORD is a strong tower...”",
      correct: "...the righteous runneth into it, and is safe.",
      distractors: [
        "...and the gates of hell shall not prevail.",
        "...established forever in the heavens."
      ],
      reference: "Proverbs 18:10",
      exegesis: "Synthetic parallelism develops and completes the thought of the opening strophe, identifying the covenantal action and divine security granted to the faithful."
    },
    {
      type: "Antithetical Parallelism",
      strophe1: "“A wise son maketh a glad father...”",
      correct: "...but a foolish son is the heaviness of his mother.",
      distractors: [
        "...and shall receive honor before kings.",
        "...while the rebellious gather sorrows."
      ],
      reference: "Proverbs 10:1",
      exegesis: "Demonstrates household consequence through moral antithesis, illustrating the spiritual interconnectedness between personal righteousness and familial peace."
    }
  ];

  let corpusIndex = 0;
  const badgeEl = modal.querySelector('#wpTypeBadge');
  const stropheEl = modal.querySelector('#wpFirstStrophe');
  const optionsEl = modal.querySelector('#wpOptions');
  const exegesisEl = modal.querySelector('#wpExegesis');
  const nextBtn = modal.querySelector('#wpNextProblemBtn');

  function loadProverb(index) {
    const item = corpus[index];
    badgeEl.textContent = item.type;
    stropheEl.textContent = item.strophe1;
    exegesisEl.style.display = 'none';
    exegesisEl.innerHTML = '';
    nextBtn.style.display = 'none';

    // Mix options
    const choices = [item.correct, ...item.distractors].sort(() => Math.random() - 0.5);
    optionsEl.innerHTML = '';

    choices.forEach(text => {
      const btn = document.createElement('button');
      btn.className = 'wp-option-btn';
      btn.textContent = text;

      btn.addEventListener('click', () => {
        const allBtns = optionsEl.querySelectorAll('.wp-option-btn');
        allBtns.forEach(b => b.disabled = true);

        if (text === item.correct) {
          btn.classList.add('correct');
          exegesisEl.innerHTML = `<strong>Amen (${item.reference}):</strong> ${item.exegesis}`;
          exegesisEl.style.borderColor = 'var(--success, #16a34a)';
        } else {
          btn.classList.add('incorrect');
          // Highlight correct one
          allBtns.forEach(b => {
            if (b.textContent === item.correct) b.classList.add('correct');
          });
          exegesisEl.innerHTML = `<strong>Canonical Resolution (${item.reference}):</strong> ${item.exegesis}`;
          exegesisEl.style.borderColor = 'var(--primary, #4338ca)';
        }

        exegesisEl.style.display = 'block';
        nextBtn.style.display = 'block';
      });

      optionsEl.appendChild(btn);
    });
  }

  nextBtn.addEventListener('click', () => {
    corpusIndex = (corpusIndex + 1) % corpus.length;
    loadProverb(corpusIndex);
  });

  modal.querySelector('#closeWisdomBtn').addEventListener('click', () => {
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
          <h3 style="font-size:calc(var(--font-size, 19px) + 1px); font-weight:800; margin-bottom:4px;">Proverbs of Solomon</h3>
          <p style="color:var(--text-muted, #334155); font-size:var(--font-size, 19px);">Hebrew wisdom parallelism discernment</p>
        </div>
        <button id="launchWisdomBtn" class="primary-btn" style="width:auto; padding:12px 18px; font-size:var(--font-size, 19px);">Discern</button>
      </div>
    `;
    viewport.insertBefore(launchCard, viewport.querySelector('.notes-panel'));
    document.getElementById('launchWisdomBtn').addEventListener('click', () => {
      loadProverb(corpusIndex);
      modal.classList.add('active');
    });
  }
})();