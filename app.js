// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}

// ==============================================================
// 1. NON-BLOCKING ASYNC TOAST SYSTEM
// ==============================================================
const toastContainer = document.getElementById('toastContainer');

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button style="border:none;background:transparent;color:inherit;font-weight:bold;font-size:var(--font-size);">✕</button>
  `;
  
  toast.querySelector('button').addEventListener('click', () => toast.remove());
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

// ==============================================================
// 2. ANDROID FOCUS TELEMETRY
// ==============================================================
let totalMinutes = parseInt(localStorage.getItem('zf_total_minutes') || '0', 10);
let totalSessions = parseInt(localStorage.getItem('zf_total_sessions') || '0', 10);

const statFocusTime = document.getElementById('statFocusTime');
const statSessionsCount = document.getElementById('statSessionsCount');

function updateTelemetryDisplay() {
  statFocusTime.textContent = `${totalMinutes} min`;
  statSessionsCount.textContent = totalSessions.toString();
}
updateTelemetryDisplay();

// ==============================================================
// 3. THEME & FONT SCALE (Strictly 19px - 23px)
// ==============================================================
const darkModeCheckbox = document.getElementById('darkModeCheckbox');
const fontSlider = document.getElementById('fontSlider');
const fontSizeIndicator = document.getElementById('fontSizeIndicator');

const currentTheme = localStorage.getItem('zf_theme') || 'light';
document.body.setAttribute('data-theme', currentTheme);
darkModeCheckbox.checked = (currentTheme === 'dark');

darkModeCheckbox.addEventListener('change', (e) => {
  const theme = e.target.checked ? 'dark' : 'light';
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('zf_theme', theme);
  showToast(`Switched to ${theme} mode`, 'info');
});

fontSlider.addEventListener('input', (e) => {
  const size = e.target.value;
  fontSizeIndicator.textContent = `${size}px`;
  document.documentElement.style.setProperty('--font-size', `${size}px`);
  localStorage.setItem('zf_fontsize', size);
});

const savedFontSize = localStorage.getItem('zf_fontsize') || '19';
fontSlider.value = savedFontSize;
fontSizeIndicator.textContent = `${savedFontSize}px`;
document.documentElement.style.setProperty('--font-size', `${savedFontSize}px`);

// ==============================================================
// 4. SIDEBAR DRAWERS & FULLSCREEN MODALS
// ==============================================================
const leftMenuBtn = document.getElementById('leftMenuBtn');
const rightMenuBtn = document.getElementById('rightMenuBtn');
const leftSidebar = document.getElementById('leftSidebar');
const rightSidebar = document.getElementById('rightSidebar');
const drawerOverlay = document.getElementById('drawerOverlay');

function closeDrawers() {
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

drawerOverlay.addEventListener('click', closeDrawers);
document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', closeDrawers));

// Modals
document.querySelectorAll('.nav-link-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    closeDrawers();
    const modal = document.getElementById(btn.getAttribute('data-modal'));
    if (modal) modal.classList.add('active');
  });
});

document.querySelectorAll('.close-modal-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.fullscreen-modal').forEach(m => m.classList.remove('active'));
  });
});

// Developer Bio Clamp
const toggleBioBtn = document.getElementById('toggleBioBtn');
const devBioText = document.getElementById('devBioText');
toggleBioBtn.addEventListener('click', () => {
  const expanded = devBioText.classList.toggle('expanded');
  toggleBioBtn.textContent = expanded ? 'Show Less' : 'Show More';
});

// Partner Form
document.getElementById('partnerForm').addEventListener('submit', (e) => {
  e.preventDefault();
  showToast('Proposal submitted successfully.', 'success');
  e.target.reset();
  document.getElementById('modalPartner').classList.remove('active');
});

// ==============================================================
// 5. TIMER ENGINE
// ==============================================================
let countdown = 1500;
let remaining = 1500;
let timerId = null;
const timerDisplay = document.getElementById('timerDisplay');
const timerToggle = document.getElementById('timerToggle');
const timerReset = document.getElementById('timerReset');
const sessionTabs = document.querySelectorAll('.session-tab');

function formatTimer(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

timerToggle.addEventListener('click', () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
    timerToggle.textContent = 'Start Sprint';
  } else {
    timerId = setInterval(() => {
      if (remaining > 0) {
        remaining--;
        timerDisplay.textContent = formatTimer(remaining);
      } else {
        clearInterval(timerId);
        timerId = null;
        timerToggle.textContent = 'Start Sprint';
        
        totalSessions += 1;
        totalMinutes += Math.round(countdown / 60);
        localStorage.setItem('zf_total_sessions', totalSessions);
        localStorage.setItem('zf_total_minutes', totalMinutes);
        updateTelemetryDisplay();

        triggerChime();
        showToast('Work Sprint Completed! Logged.', 'success');
      }
    }, 1000);
    timerToggle.textContent = 'Pause Sprint';
  }
});

timerReset.addEventListener('click', () => {
  clearInterval(timerId);
  timerId = null;
  remaining = countdown;
  timerToggle.textContent = 'Start Sprint';
  timerDisplay.textContent = formatTimer(remaining);
});

sessionTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    sessionTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    countdown = parseInt(tab.dataset.time, 10);
    remaining = countdown;
    clearInterval(timerId);
    timerId = null;
    timerToggle.textContent = 'Start Sprint';
    timerDisplay.textContent = formatTimer(remaining);
  });
});

function triggerChime() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.setValueAtTime(587.33, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 1.2);
}

// ==============================================================
// 6. CALIBRATED ACOUSTIC FLOW SHIELD
// ==============================================================
let audioCtx = null;
let noiseNode = null;
let carrierNode = null;
const audioToggleBtn = document.getElementById('audioToggleBtn');
const audioBtnText = document.getElementById('audioBtnText');

audioToggleBtn.addEventListener('click', () => {
  if (noiseNode) {
    noiseNode.stop();
    carrierNode.stop();
    noiseNode.disconnect();
    carrierNode.disconnect();
    noiseNode = null;
    carrierNode = null;
    audioBtnText.textContent = 'Enable Audio Shield';
    showToast('Acoustic Flow Shield Disabled', 'info');
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
    data[i] *= 3.0;
  }

  noiseNode = audioCtx.createBufferSource();
  noiseNode.buffer = buffer;
  noiseNode.loop = true;

  const noiseGain = audioCtx.createGain();
  noiseGain.gain.value = 0.06;
  noiseNode.connect(noiseGain);
  noiseGain.connect(audioCtx.destination);

  carrierNode = audioCtx.createOscillator();
  carrierNode.type = 'sine';
  carrierNode.frequency.setValueAtTime(40, audioCtx.currentTime);

  const carrierGain = audioCtx.createGain();
  carrierGain.gain.value = 0.015;
  carrierNode.connect(carrierGain);
  carrierGain.connect(audioCtx.destination);

  noiseNode.start();
  carrierNode.start();

  audioBtnText.textContent = 'Silence Shield';
  showToast('Flow Shield Active: 40Hz Harmonic', 'success');
});

// ==============================================================
// 7. TO-DO & ANCHORING
// ==============================================================
const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');
const activeTargetText = document.getElementById('activeTargetText');
let tasks = JSON.parse(localStorage.getItem('zf_tasks_safe') || '[]');

function renderTasks() {
  todoList.innerHTML = '';
  tasks.forEach((t, i) => {
    const li = document.createElement('li');
    if (t.completed) li.classList.add('completed');

    li.innerHTML = `
      <input type="checkbox" ${t.completed ? 'checked' : ''} aria-label="Toggle">
      <span class="todo-text">${t.text}</span>
      <div class="todo-actions">
        <button class="action-chip-btn anchor" title="Anchor Target">🎯</button>
        <button class="action-chip-btn delete" title="Delete">✕</button>
      </div>
    `;

    li.querySelector('input').addEventListener('change', () => {
      tasks[i].completed = !tasks[i].completed;
      saveTasks();
    });

    li.querySelector('.anchor').addEventListener('click', () => {
      activeTargetText.textContent = t.text;
      showToast(`Anchored: "${t.text}"`, 'info');
      closeDrawers();
    });

    li.querySelector('.delete').addEventListener('click', () => {
      tasks.splice(i, 1);
      saveTasks();
    });

    todoList.appendChild(li);
  });
}

function saveTasks() {
  localStorage.setItem('zf_tasks_safe', JSON.stringify(tasks));
  renderTasks();
}

todoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;
  tasks.push({ text, completed: false });
  todoInput.value = '';
  saveTasks();
  showToast('Objective saved.', 'info');
});
renderTasks();

// Scratchpad
const scratchpadArea = document.getElementById('scratchpadArea');
scratchpadArea.value = localStorage.getItem('zf_notes_safe') || '';
scratchpadArea.addEventListener('input', () => {
  localStorage.setItem('zf_notes_safe', scratchpadArea.value);
});

// ==============================================================
// 8. ANDROID INSTALL, SHARE & BLUETOOTH
// ==============================================================
let deferredPrompt = null;
const installAppBtn = document.getElementById('installAppBtn');
const shareAppBtn = document.getElementById('shareAppBtn');
const bluetoothShareBtn = document.getElementById('bluetoothShareBtn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installAppBtn.style.display = 'flex';
});

installAppBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      deferredPrompt = null;
      showToast('ZenFocus Pro Added to Android Home Screen', 'success');
    }
  } else {
    showToast('App is ready offline or already installed.', 'info');
  }
});

shareAppBtn.addEventListener('click', async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'ZenFocus Pro',
        text: 'Android-first cognitive workflow workspace.',
        url: window.location.href,
      });
      showToast('Shared successfully.', 'success');
    } catch (_) {}
  } else {
    navigator.clipboard.writeText(window.location.href);
    showToast('Direct URL copied to clipboard!', 'success');
  }
});

bluetoothShareBtn.addEventListener('click', async () => {
  if (navigator.bluetooth) {
    try {
      showToast('Scanning nearby Bluetooth devices...', 'info');
      await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
      showToast('Bluetooth pairing handshake ready.', 'success');
    } catch (_) {
      showToast('Bluetooth pairing dismissed.', 'danger');
    }
  } else {
    showToast('Web Bluetooth available on Chrome Android.', 'danger');
  }
});

window.DV = window.DV || {
  addNavItem: function(item) {
    const viewport = document.querySelector('.android-viewport');
    if (viewport) {
      const card = document.createElement('section');
      card.className = 'mobile-card';
      card.id = item.id || 'dv-jesus-puzzle-card';
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 style="font-size:calc(var(--font-size, 19px) + 1px); font-weight:800; margin-bottom:4px;">JESUS Slide Puzzle</h3>
            <p style="color:var(--text-muted, #334155); font-size:var(--font-size, 19px);">Slide to spell JESUS &amp; earn Certificate</p>
          </div>
          <button id="launchJesusGameBtn" class="primary-btn" style="width:auto; padding:12px 20px; font-size:var(--font-size, 19px);">Play</button>
        </div>
      `;
      // Mounts right above the scratchpad
      viewport.insertBefore(card, viewport.querySelector('.notes-panel') || viewport.lastElementChild);
    }
  },
  route: function(key, handler) {
    const btn = document.getElementById('launchJesusGameBtn');
    if (btn) {
      btn.addEventListener('click', handler.open);
    }
  },
  logActivity: function(title, desc) {
    if (typeof showToast === 'function') {
      showToast(`${title}: ${desc}`, 'success');
    }
  },
  closeRoute: function() {
    // Graceful return to main dashboard
  }
};