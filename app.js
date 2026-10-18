// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}

// State
let countdown = 1500;
let remaining = 1500;
let timerLoop = null;
let audioCtx = null;
let noiseSource = null;
let deferredPrompt = null;

// ==============================================================
// 1. DIMENSION 2D VIEWPORT SYSTEM (Desktop Mode & Mobile Toggle)
// ==============================================================
const dimensionWrapper = document.getElementById('dimensionWrapper');
const dimensionToggleBtn = document.getElementById('dimensionToggleBtn');

dimensionToggleBtn.addEventListener('click', () => {
  const isDesktop = dimensionWrapper.classList.contains('desktop-mode');
  if (isDesktop) {
    dimensionWrapper.classList.remove('desktop-mode');
    dimensionWrapper.classList.add('mobile-mode');
    dimensionToggleBtn.textContent = '📱 View';
  } else {
    dimensionWrapper.classList.remove('mobile-mode');
    dimensionWrapper.classList.add('desktop-mode');
    dimensionToggleBtn.textContent = '🖥️ View';
  }
});

// ==============================================================
// 2. THEME & FONT SCALE ENGINE (Strictly 19px - 23px)
// ==============================================================
const darkModeCheckbox = document.getElementById('darkModeCheckbox');
const fontSlider = document.getElementById('fontSlider');
const fontSizeIndicator = document.getElementById('fontSizeIndicator');

// Read Saved Preferences
const savedTheme = localStorage.getItem('zf_theme') || 'light';
document.body.setAttribute('data-theme', savedTheme);
darkModeCheckbox.checked = (savedTheme === 'dark');

darkModeCheckbox.addEventListener('change', (e) => {
  const theme = e.target.checked ? 'dark' : 'light';
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('zf_theme', theme);
});

fontSlider.addEventListener('input', (e) => {
  const size = e.target.value; // Guaranteed between 19 and 23
  fontSizeIndicator.textContent = `${size}px`;
  document.documentElement.style.setProperty('--font-size', `${size}px`);
  localStorage.setItem('zf_fontsize', size);
});

// Load Font Size
const savedFontSize = localStorage.getItem('zf_fontsize') || '19';
fontSlider.value = savedFontSize;
fontSizeIndicator.textContent = `${savedFontSize}px`;
document.documentElement.style.setProperty('--font-size', `${savedFontSize}px`);

// ==============================================================
// 3. SIDEBAR DRAWERS & OVERLAY LOGIC
// ==============================================================
const leftMenuBtn = document.getElementById('leftMenuBtn');
const rightMenuBtn = document.getElementById('rightMenuBtn');
const leftSidebar = document.getElementById('leftSidebar');
const rightSidebar = document.getElementById('rightSidebar');
const drawerOverlay = document.getElementById('drawerOverlay');

function closeAllDrawers() {
  leftSidebar.classList.remove('open');
  rightSidebar.classList.remove('open');
  drawerOverlay.classList.remove('active');
}

leftMenuBtn.addEventListener('click', () => {
  leftSidebar.classList.add('open');
  drawerOverlay.classList.add('active');
});

rightMenuBtn.addEventListener('click', () => {
  rightSidebar.classList.add('open');
  drawerOverlay.classList.add('active');
});

drawerOverlay.addEventListener('click', closeAllDrawers);

document.querySelectorAll('[data-close]').forEach((btn) => {
  btn.addEventListener('click', closeAllDrawers);
});

// ==============================================================
// 4. FULLSCREEN EDGE-TO-EDGE MODALS (100dvh x 100dvw)
// ==============================================================
const navLinks = document.querySelectorAll('.nav-link-btn');
const closeModals = document.querySelectorAll('.close-modal-btn');

navLinks.forEach((btn) => {
  btn.addEventListener('click', () => {
    closeAllDrawers();
    const modalId = btn.getAttribute('data-modal');
    const targetModal = document.getElementById(modalId);
    if (targetModal) targetModal.classList.add('active');
  });
});

closeModals.forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.fullscreen-modal').forEach((m) => m.classList.remove('active'));
  });
});

// Developer Bio 6-line Clamp Toggle
const toggleBioBtn = document.getElementById('toggleBioBtn');
const devBioText = document.getElementById('devBioText');

toggleBioBtn.addEventListener('click', () => {
  const isExpanded = devBioText.classList.contains('expanded');
  if (isExpanded) {
    devBioText.classList.remove('expanded');
    toggleBioBtn.textContent = 'Show More';
  } else {
    devBioText.classList.add('expanded');
    toggleBioBtn.textContent = 'Show Less';
  }
});

// ==============================================================
// 5. POMODORO TIMER & PROCEDURAL BROWN NOISE
// ==============================================================
const timerDisplay = document.getElementById('timerDisplay');
const timerToggle = document.getElementById('timerToggle');
const timerReset = document.getElementById('timerReset');
const sessionTabs = document.querySelectorAll('.session-tab');
const audioToggleBtn = document.getElementById('audioToggleBtn');

function formatTimer(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

function updateClock() {
  timerDisplay.textContent = formatTimer(remaining);
}

timerToggle.addEventListener('click', () => {
  if (timerLoop) {
    clearInterval(timerLoop);
    timerLoop = null;
    timerToggle.textContent = 'Start Session';
  } else {
    timerLoop = setInterval(() => {
      if (remaining > 0) {
        remaining--;
        updateClock();
      } else {
        clearInterval(timerLoop);
        timerLoop = null;
        timerToggle.textContent = 'Start Session';
        playAlertTone();
      }
    }, 1000);
    timerToggle.textContent = 'Pause Session';
  }
});

timerReset.addEventListener('click', () => {
  clearInterval(timerLoop);
  timerLoop = null;
  remaining = countdown;
  timerToggle.textContent = 'Start Session';
  updateClock();
});

sessionTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    sessionTabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    countdown = parseInt(tab.dataset.time, 10);
    remaining = countdown;
    clearInterval(timerLoop);
    timerLoop = null;
    timerToggle.textContent = 'Start Session';
    updateClock();
  });
});

function playAlertTone() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(587.33, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 1.2);
}

// Procedural Brown Noise generator
audioToggleBtn.addEventListener('click', () => {
  if (noiseSource) {
    noiseSource.stop();
    noiseSource.disconnect();
    noiseSource = null;
    audioToggleBtn.textContent = '▶ Play Noise';
    return;
  }

  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  const bufferLen = audioCtx.sampleRate * 2;
  const buffer = audioCtx.createBuffer(1, bufferLen, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastVal = 0.0;

  for (let i = 0; i < bufferLen; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastVal + 0.02 * white) / 1.02;
    lastVal = data[i];
    data[i] *= 3.5;
  }

  noiseSource = audioCtx.createBufferSource();
  noiseSource.buffer = buffer;
  noiseSource.loop = true;

  const gain = audioCtx.createGain();
  gain.gain.value = 0.08;
  noiseSource.connect(gain);
  gain.connect(audioCtx.destination);

  noiseSource.start();
  audioToggleBtn.textContent = '⏸ Stop Noise';
});

// ==============================================================
// 6. SCRATCHPAD & TO-DO CHECKLIST
// ==============================================================
const scratchpadArea = document.getElementById('scratchpadArea');
scratchpadArea.value = localStorage.getItem('zf_scratchpad') || '';
scratchpadArea.addEventListener('input', () => {
  localStorage.setItem('zf_scratchpad', scratchpadArea.value);
});

const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');
let tasks = JSON.parse(localStorage.getItem('zf_todos') || '[]');

function renderTodos() {
  todoList.innerHTML = '';
  tasks.forEach((t, i) => {
    const li = document.createElement('li');
    if (t.done) li.classList.add('completed');
    li.innerHTML = `
      <input type="checkbox" ${t.done ? 'checked' : ''}>
      <span>${t.title}</span>
      <button style="border:none;background:transparent;cursor:pointer;color:var(--danger);font-size:var(--font-size);">✕</button>
    `;
    li.querySelector('input').addEventListener('change', () => {
      tasks[i].done = !tasks[i].done;
      saveTodos();
    });
    li.querySelector('button').addEventListener('click', () => {
      tasks.splice(i, 1);
      saveTodos();
    });
    todoList.appendChild(li);
  });
}

function saveTodos() {
  localStorage.setItem('zf_todos', JSON.stringify(tasks));
  renderTodos();
}

todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const val = todoInput.value.trim();
  if (!val) return;
  tasks.push({ title: val, done: false });
  todoInput.value = '';
  saveTodos();
});
renderTodos();

// ==============================================================
// 7. PWA INSTALL, WEB SHARE & BLUETOOTH API
// ==============================================================
const installAppBtn = document.getElementById('installAppBtn');
const shareAppBtn = document.getElementById('shareAppBtn');
const bluetoothShareBtn = document.getElementById('bluetoothShareBtn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installAppBtn.style.display = 'block';
});

installAppBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') deferredPrompt = null;
  } else {
    alert('Application is ready for offline use or already installed via your browser bar.');
  }
});

shareAppBtn.addEventListener('click', async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'ZenFocus Pro Dashboard',
        text: 'Boost your focus with this edge-to-edge accessible productivity tool.',
        url: window.location.href,
      });
    } catch (_) {}
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  }
});

// Bluetooth Share Trigger (Web Bluetooth API)
bluetoothShareBtn.addEventListener('click', async () => {
  if (navigator.bluetooth) {
    try {
      alert('Scanning for nearby Bluetooth peers to broadcast app manifest payload...');
      await navigator.bluetooth.requestDevice({
        acceptAllDevices: true
      });
    } catch (err) {
      alert('Bluetooth pairing canceled or connection unavailable.');
    }
  } else {
    alert('Web Bluetooth API is supported on Chrome Desktop and Android. Please verify hardware permissions.');
  }
});
