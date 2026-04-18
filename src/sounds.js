const AudioContext = window.AudioContext || window.webkitAudioContext;
let ctx = null;

function getCtx() {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function beep(freq, duration, type = 'sine', volume = 0.3) {
  try {
    const c = getCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.frequency.value = freq;
    o.type = type;
    g.gain.setValueAtTime(volume, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    o.start(c.currentTime);
    o.stop(c.currentTime + duration);
  } catch {}
}

export const sounds = {
  action: () => beep(440, 0.1, 'sine', 0.2),
  success: () => {
    beep(523, 0.1, 'sine', 0.2);
    setTimeout(() => beep(659, 0.1, 'sine', 0.2), 100);
    setTimeout(() => beep(784, 0.15, 'sine', 0.2), 200);
  },
  fail: () => {
    beep(300, 0.15, 'sawtooth', 0.2);
    setTimeout(() => beep(200, 0.2, 'sawtooth', 0.2), 150);
  },
  event: () => {
    beep(880, 0.05, 'square', 0.15);
    setTimeout(() => beep(660, 0.1, 'square', 0.15), 60);
  },
  crisis: () => {
    beep(200, 0.3, 'sawtooth', 0.3);
    setTimeout(() => beep(150, 0.4, 'sawtooth', 0.3), 300);
  },
  cash: () => {
    beep(987, 0.08, 'sine', 0.25);
    setTimeout(() => beep(1318, 0.12, 'sine', 0.25), 80);
  },
  pitch: () => {
    [523, 587, 659, 698, 784].forEach((f, i) => {
      setTimeout(() => beep(f, 0.12, 'sine', 0.2), i * 80);
    });
  },
  defect: () => {
    beep(440, 0.1, 'sawtooth', 0.3);
    setTimeout(() => beep(350, 0.1, 'sawtooth', 0.3), 100);
    setTimeout(() => beep(250, 0.3, 'sawtooth', 0.3), 200);
  },
  win: () => {
    [523, 659, 784, 1047].forEach((f, i) => {
      setTimeout(() => beep(f, 0.2, 'sine', 0.25), i * 120);
    });
  },
  lose: () => {
    [400, 350, 300, 250].forEach((f, i) => {
      setTimeout(() => beep(f, 0.2, 'sawtooth', 0.2), i * 100);
    });
  },
  quiz_correct: () => {
    beep(784, 0.1, 'sine', 0.2);
    setTimeout(() => beep(1047, 0.15, 'sine', 0.2), 100);
  },
  quiz_wrong: () => beep(200, 0.2, 'sawtooth', 0.2),
  cooldown_done: () => beep(660, 0.08, 'sine', 0.15),
  elon: () => {
    [800, 1000, 800, 1200, 800].forEach((f, i) => {
      setTimeout(() => beep(f, 0.08, 'square', 0.2), i * 60);
    });
  },
};
