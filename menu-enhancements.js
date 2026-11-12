/* DISCHARGE MATRIX // main-menu expansion
 * Add <script src="menu-enhancements.js"></script> just before </body> in index.html.
 * Menu music is synthesized locally with Web Audio (no external audio files).
 */
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const menu = $('ascend-menu');
  const mainPanel = $('am-main');
  if (!menu || !mainPanel) return;

  const defaults = {
    difficulty: 'normal',
    music: true,
    musicVolume: 22,
    sfxVolume: 70,
    reducedMotion: false
  };
  let settings = { ...defaults };
  try {
    settings = { ...defaults, ...JSON.parse(localStorage.getItem('dm-menu-settings') || '{}') };
  } catch (_) { /* Ignore malformed or unavailable local storage. */ }

  const save = () => {
    try { localStorage.setItem('dm-menu-settings', JSON.stringify(settings)); } catch (_) {}
  };

  const style = document.createElement('style');
  style.textContent = `
    #ascend-menu { z-index: 1000; overflow-y:auto; padding:24px 14px; }
    #ascend-menu .am-box { width:min(440px,94vw); padding:clamp(20px,4vw,36px); border:1px solid rgba(0,243,255,.34);
      background:linear-gradient(145deg,rgba(8,16,38,.96),rgba(3,5,16,.97));
      box-shadow:0 0 70px rgba(0,243,255,.12), inset 0 0 35px rgba(184,41,234,.06); }
    #ascend-menu .am-box h2 { margin-bottom:5px; }
    #ascend-menu .am-box small { margin-bottom:18px; }
    #ascend-menu .am-panel { display:none; }
    #am-settings { text-align:left; }
    #am-settings h2,#am-settings small { text-align:center; }
    .dm-setting { margin:13px 0; padding:11px 12px; background:rgba(0,243,255,.045); border:1px solid rgba(0,243,255,.16); }
    .dm-setting label,.dm-setting .dm-label { display:flex; justify-content:space-between; align-items:center; gap:12px;
      color:#dffcff; font:800 9px 'Orbitron',sans-serif; letter-spacing:1px; }
    .dm-setting p { color:#94a3b8; font:600 12px 'Rajdhani',sans-serif; margin-top:5px; }
    .dm-setting select { width:100%; margin-top:9px; background:#050914; color:#fff; border:1px solid rgba(0,243,255,.4); padding:8px; }
    .dm-setting input[type=range] { width:100%; margin-top:12px; accent-color:#00f3ff; }
    .dm-setting input[type=checkbox] { width:17px; height:17px; accent-color:#00f3ff; }
    .dm-value { color:#ffbe0b; min-width:38px; text-align:right; }
    .dm-menu-meta { color:#7dd3fc; font:700 8px 'Orbitron',sans-serif; letter-spacing:2px; margin:18px 0 10px; }
    .dm-menu-actions { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
    #dm-settings-back { grid-column:1 / -1; }
    body.dm-reduced-motion *, body.dm-reduced-motion *::before, body.dm-reduced-motion *::after {
      animation-duration:.01ms !important; animation-iteration-count:1 !important; scroll-behavior:auto !important; transition-duration:.01ms !important;
    }
    @media(max-width:520px) { #ascend-menu .am-box { padding:20px 16px; } .dm-setting { margin:9px 0; } }
  `;
  document.head.appendChild(style);

  const settingsPanel = document.createElement('div');
  settingsPanel.className = 'am-box am-panel';
  settingsPanel.id = 'am-settings';
  settingsPanel.innerHTML = `
    <h2>SETTINGS</h2><small>SIMULATION CONFIGURATION</small>
    <div class="dm-setting">
      <label for="dm-difficulty"><span>COMBAT DIFFICULTY</span></label>
      <select id="dm-difficulty">
        <option value="easy">EASY // RELAXED</option>
        <option value="normal">NORMAL // STANDARD</option>
        <option value="hard">HARD // OVERLOAD</option>
      </select>
      <p>Changes hostile durability and incoming damage. Applies to newly spawned enemies.</p>
    </div>
    <div class="dm-setting">
      <label for="dm-music"><span>MENU MUSIC</span><input id="dm-music" type="checkbox"></label>
      <p>Original, locally synthesized ambient soundtrack. Sound begins after a click or key press.</p>
    </div>
    <div class="dm-setting">
      <label for="dm-music-volume"><span>MUSIC VOLUME</span><span class="dm-value" id="dm-music-value"></span></label>
      <input id="dm-music-volume" type="range" min="0" max="100" value="22">
    </div>
    <div class="dm-setting">
      <label for="dm-sfx-volume"><span>GAME SOUND VOLUME</span><span class="dm-value" id="dm-sfx-value"></span></label>
      <input id="dm-sfx-volume" type="range" min="0" max="100" value="70">
    </div>
    <div class="dm-setting">
      <label for="dm-reduced-motion"><span>REDUCED MOTION</span><input id="dm-reduced-motion" type="checkbox"></label>
      <p>Reduces interface animation and disables screen shake.</p>
    </div>
    <div class="dm-menu-meta">SETTINGS ARE SAVED ON THIS DEVICE</div>
    <div class="dm-menu-actions">
      <button class="am-btn" id="dm-reset-settings">↺ RESET SETTINGS</button>
      <button class="am-btn go" id="dm-settings-back">← BACK</button>
    </div>`;
  menu.appendChild(settingsPanel);

  const settingsButton = document.createElement('button');
  settingsButton.className = 'am-btn';
  settingsButton.id = 'am-open-settings';
  settingsButton.textContent = '⚙ SETTINGS';
  const controlsButton = $('am-controls');
  if (controlsButton) controlsButton.insertAdjacentElement('afterend', settingsButton);

  const controlsPanel = $('am-ctl');
  const showMenuPage = page => {
    mainPanel.style.display = page === 'main' ? '' : 'none';
    if (controlsPanel) controlsPanel.style.display = page === 'controls' ? 'block' : 'none';
    settingsPanel.style.display = page === 'settings' ? 'block' : 'none';
  };
  settingsButton.addEventListener('click', () => showMenuPage('settings'));
  $('dm-settings-back').addEventListener('click', () => showMenuPage('main'));
  if (controlsPanel) {
    const back = $('am-back');
    if (back) back.addEventListener('click', () => showMenuPage('main'));
  }
  $('am-controls')?.addEventListener('click', () => showMenuPage('controls'));

  const musicToggle = $('dm-music');
  const musicSlider = $('dm-music-volume');
  const sfxSlider = $('dm-sfx-volume');
  const reducedToggle = $('dm-reduced-motion');
  const difficultySelect = $('dm-difficulty');
  const syncSettingsUI = () => {
    difficultySelect.value = settings.difficulty;
    musicToggle.checked = settings.music;
    musicSlider.value = settings.musicVolume;
    sfxSlider.value = settings.sfxVolume;
    reducedToggle.checked = settings.reducedMotion;
    $('dm-music-value').textContent = settings.musicVolume + '%';
    $('dm-sfx-value').textContent = settings.sfxVolume + '%';
    document.body.classList.toggle('dm-reduced-motion', settings.reducedMotion);
  };
  syncSettingsUI();

  // Procedural ambient menu score. Browsers require a user gesture before audio can play.
  let musicContext = null, musicBus = null, musicVoices = [], musicTimer = 0, musicStep = 0;
  const chords = [
    [110, 164.81, 220], [82.41, 123.47, 164.81],
    [98, 146.83, 196], [73.42, 110, 146.83]
  ];
  const stopMusic = () => {
    if (!musicContext || !musicBus) return;
    const now = musicContext.currentTime;
    musicBus.gain.cancelScheduledValues(now);
    musicBus.gain.setTargetAtTime(0, now, .35);
    clearInterval(musicTimer);
    musicTimer = 0;
    setTimeout(() => {
      musicVoices.forEach(voice => { try { voice.stop(); } catch (_) {} });
      musicVoices = [];
    }, 1400);
  };
  const startMusic = async () => {
    if (!settings.music || !menu || menu.classList.contains('hide')) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    try {
      if (!musicContext) {
        musicContext = new Audio();
        musicBus = musicContext.createGain();
        musicBus.gain.value = 0;
        musicBus.connect(musicContext.destination);
        // A quiet low-pass wash adds movement without loading an external track.
        const filter = musicContext.createBiquadFilter();
        filter.type = 'lowpass'; filter.frequency.value = 850; filter.Q.value = .7;
        musicBus.disconnect(); musicBus.connect(filter); filter.connect(musicContext.destination);
        for (let i = 0; i < 3; i++) {
          const osc = musicContext.createOscillator(), gain = musicContext.createGain();
          osc.type = i === 1 ? 'triangle' : 'sine';
          gain.gain.value = i === 0 ? .22 : .10;
          osc.connect(gain); gain.connect(musicBus); osc.start();
          musicVoices.push({ osc, gain });
        }
      }
      await musicContext.resume();
      const now = musicContext.currentTime;
      musicBus.gain.cancelScheduledValues(now);
      musicBus.gain.setTargetAtTime(settings.musicVolume / 100 * .22, now, .5);
      const setChord = () => {
        if (!musicContext || !musicBus || !settings.music || menu.classList.contains('hide')) { stopMusic(); return; }
        const chord = chords[musicStep++ % chords.length];
        const t = musicContext.currentTime;
        musicVoices.forEach((voice, i) => {
          voice.osc.frequency.cancelScheduledValues(t);
          voice.osc.frequency.setTargetAtTime(chord[i] * (i === 2 ? 2 : 1), t, .9);
        });
      };
      if (!musicTimer) { setChord(); musicTimer = setInterval(setChord, 4200); }
    } catch (_) { /* Audio may be unavailable or blocked by the browser. */ }
  };

  musicToggle.addEventListener('change', () => {
    settings.music = musicToggle.checked; save();
    if (settings.music) startMusic(); else stopMusic();
  });
  musicSlider.addEventListener('input', () => {
    settings.musicVolume = Number(musicSlider.value);
    $('dm-music-value').textContent = settings.musicVolume + '%'; save();
    if (musicBus && musicContext) musicBus.gain.setTargetAtTime(settings.musicVolume / 100 * .22, musicContext.currentTime, .08);
  });
  sfxSlider.addEventListener('input', () => {
    settings.sfxVolume = Number(sfxSlider.value);
    $('dm-sfx-value').textContent = settings.sfxVolume + '%'; save();
  });
  reducedToggle.addEventListener('change', () => {
    settings.reducedMotion = reducedToggle.checked;
    document.body.classList.toggle('dm-reduced-motion', settings.reducedMotion); save();
  });
  difficultySelect.addEventListener('change', () => {
    settings.difficulty = difficultySelect.value; save();
    if (typeof notify === 'function') notify('DIFFICULTY // ' + settings.difficulty.toUpperCase());
  });
  $('dm-reset-settings').addEventListener('click', () => {
    settings = { ...defaults }; syncSettingsUI(); save();
    if (settings.music) startMusic();
  });

  // Apply difficulty to enemies as they spawn and scale damage received.
  if (typeof window.spawnEntity === 'function') {
    const originalSpawn = window.spawnEntity;
    window.spawnEntity = function (...args) {
      const before = Array.isArray(window.targets) ? window.targets.length : 0;
      const result = originalSpawn.apply(this, args);
      const spawned = Array.isArray(window.targets) ? window.targets.slice(before) : [];
      const multiplier = settings.difficulty === 'easy' ? .72 : settings.difficulty === 'hard' ? 1.35 : 1;
      spawned.forEach(enemy => {
        enemy.hp *= multiplier; enemy.maxHp *= multiplier;
        enemy.sh *= multiplier; enemy.maxSh *= multiplier;
      });
      return result;
    };
  }
  if (typeof window.hurtPlayer === 'function') {
    const originalHurt = window.hurtPlayer;
    window.hurtPlayer = function (damage, ...args) {
      const multiplier = settings.difficulty === 'easy' ? .65 : settings.difficulty === 'hard' ? 1.35 : 1;
      return originalHurt.call(this, damage * multiplier, ...args);
    };
  }
  if (typeof window.beep === 'function') {
    const originalBeep = window.beep;
    window.beep = function (frequency, duration, type, volume) {
      const scaled = (volume === undefined ? .06 : volume) * settings.sfxVolume / 100;
      return originalBeep.call(this, frequency, duration, type, scaled);
    };
  }

  // Reduced motion also suppresses game-world shake; this monitor runs independently of pause.
  const reduceShake = () => {
    if (settings.reducedMotion && typeof window.shake === 'number') window.shake = 0;
    requestAnimationFrame(reduceShake);
  };
  requestAnimationFrame(reduceShake);

  // The menu's existing open/close logic changes the .hide class; follow it for soundtrack state.
  const menuObserver = new MutationObserver(() => {
    if (menu.classList.contains('hide')) stopMusic();
    else startMusic();
  });
  menuObserver.observe(menu, { attributes: true, attributeFilter: ['class'] });
  const gestureStart = () => {
    if (!menu.classList.contains('hide')) startMusic();
  };
  window.addEventListener('pointerdown', gestureStart, { once: true, capture: true });
  window.addEventListener('keydown', gestureStart, { once: true, capture: true });

  $('am-audio')?.addEventListener('click', () => {
    // Existing game audio toggle is separate; keep the menu music preference in sync visually.
    if (settings.music) startMusic();
  });
  $('am-restart')?.addEventListener('click', () => {
    if (typeof notify === 'function') notify('NEW RUN // SETTINGS PRESERVED');
  });
})();
