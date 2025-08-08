let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    audioCtx = new Ctx();
    const resume = () => {
      if (audioCtx && audioCtx.state !== 'running') audioCtx.resume().catch(() => {});
    };
    window.addEventListener('pointerdown', resume, { once: true, passive: true });
    window.addEventListener('touchstart', resume, { once: true, passive: true });
  }
  return audioCtx!;
}

function beep(frequency: number, durationMs: number, gain = 0.15, type: OscillatorType = 'sine', when = 0) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + when);
  const startTime = ctx.currentTime + when;
  const endTime = startTime + durationMs / 1000;
  g.gain.setValueAtTime(0, startTime);
  g.gain.linearRampToValueAtTime(gain, startTime + 0.01);
  g.gain.linearRampToValueAtTime(0.0001, endTime);
  osc.connect(g).connect(ctx.destination);
  osc.start(startTime);
  osc.stop(endTime + 0.05);
}

export type CueType =
  | 'start'
  | 'end'
  | 'complete'
  | 'workStart'
  | 'breakStart'
  | 'halfway'
  | 'ten'
  | 'threeTwoOne';

export function playCue(type: CueType) {
  // Keep patterns short, punchy, and distinct
  switch (type) {
    case 'start':
    case 'workStart':
      // Clear, bright double-up to mark work start
      beep(990, 130, 0.22, 'sine');
      beep(1480, 110, 0.18, 'sine', 0.13);
      break;
    case 'breakStart':
      // Softer but still noticeable down-chirp
      beep(520, 140, 0.18, 'sine');
      beep(390, 120, 0.14, 'sine', 0.16);
      break;
    case 'end':
      // End marker: short double tick
      beep(700, 110, 0.2, 'sine');
      beep(560, 90, 0.16, 'sine', 0.12);
      break;
    case 'halfway':
      beep(740, 120, 0.14);
      beep(740, 120, 0.14, 'sine', 0.15);
      break;
    case 'ten':
      // single tick that's audible but not overwhelming
      beep(520, 80, 0.12, 'square');
      break;
    case 'threeTwoOne':
      beep(520, 90, 0.15); // 3
      beep(660, 90, 0.15, 'sine', 0.25); // 2
      beep(820, 120, 0.18, 'sine', 0.5); // 1
      break;
    case 'complete':
      beep(523.25, 120, 0.18);
      beep(659.25, 120, 0.18, 'sine', 0.14);
      beep(783.99, 160, 0.18, 'sine', 0.3);
      break;
  }
}

export function ensureAudioReady() {
  try {
    const ctx = getCtx();
    if (ctx.state !== 'running') void ctx.resume();
  } catch {
    // ignore
  }
}

export function playCountdownTick(n: number) {
  // Single, distinct tone per second
  if (n === 3) beep(520, 90, 0.16);
  if (n === 2) beep(660, 90, 0.16);
  if (n === 1) beep(820, 120, 0.18);
}


