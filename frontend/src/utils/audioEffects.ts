// All sounds generated procedurally via Web Audio API — no external files

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

export function playGreenLightSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Pleasant ascending chime — three notes
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);

      gain.gain.setValueAtTime(0, now + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.35, now + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.5);

      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.55);
    });

    // Soft shimmer layer
    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmer.connect(shimmerGain);
    shimmerGain.connect(ctx.destination);
    shimmer.type = 'triangle';
    shimmer.frequency.setValueAtTime(1046.5, now);
    shimmerGain.gain.setValueAtTime(0.1, now);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    shimmer.start(now);
    shimmer.stop(now + 0.85);
  } catch (e) {
    // Audio context may be blocked
  }
}

export function playRedLightSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Tense descending alarm — harsh buzzer
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();
    const masterGain = ctx.createGain();

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(masterGain);
    gain2.connect(masterGain);
    masterGain.connect(ctx.destination);

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(220, now);
    osc1.frequency.linearRampToValueAtTime(110, now + 0.3);
    osc1.frequency.setValueAtTime(220, now + 0.3);
    osc1.frequency.linearRampToValueAtTime(110, now + 0.6);

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(165, now);
    osc2.frequency.linearRampToValueAtTime(82.5, now + 0.3);
    osc2.frequency.setValueAtTime(165, now + 0.3);
    osc2.frequency.linearRampToValueAtTime(82.5, now + 0.6);

    gain1.gain.setValueAtTime(0.3, now);
    gain2.gain.setValueAtTime(0.15, now);
    masterGain.gain.setValueAtTime(1, now);
    masterGain.gain.setValueAtTime(1, now + 0.55);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.8);
    osc2.stop(now + 0.8);

    // Low rumble
    const rumble = ctx.createOscillator();
    const rumbleGain = ctx.createGain();
    rumble.connect(rumbleGain);
    rumbleGain.connect(ctx.destination);
    rumble.type = 'sine';
    rumble.frequency.setValueAtTime(55, now);
    rumbleGain.gain.setValueAtTime(0.4, now);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    rumble.start(now);
    rumble.stop(now + 0.55);
  } catch (e) {
    // Audio context may be blocked
  }
}

export function playEliminationSound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Harsh descending screech + impact
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.4);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.start(now);
    osc.stop(now + 0.5);

    // Impact thud
    const noise = ctx.createOscillator();
    const noiseGain = ctx.createGain();
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.type = 'square';
    noise.frequency.setValueAtTime(80, now + 0.05);
    noise.frequency.exponentialRampToValueAtTime(20, now + 0.35);
    noiseGain.gain.setValueAtTime(0.6, now + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    noise.start(now + 0.05);
    noise.stop(now + 0.45);

    // High pitched sting
    const sting = ctx.createOscillator();
    const stingGain = ctx.createGain();
    sting.connect(stingGain);
    stingGain.connect(ctx.destination);
    sting.type = 'sine';
    sting.frequency.setValueAtTime(1200, now);
    sting.frequency.exponentialRampToValueAtTime(200, now + 0.2);
    stingGain.gain.setValueAtTime(0.3, now);
    stingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    sting.start(now);
    sting.stop(now + 0.3);
  } catch (e) {
    // Audio context may be blocked
  }
}

export function playVictorySound(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Victory fanfare — ascending triumphant notes
    const fanfare = [
      { freq: 523.25, time: 0, dur: 0.15 },    // C5
      { freq: 523.25, time: 0.15, dur: 0.15 },  // C5
      { freq: 523.25, time: 0.3, dur: 0.15 },   // C5
      { freq: 415.3, time: 0.45, dur: 0.1 },    // Ab4
      { freq: 523.25, time: 0.55, dur: 0.4 },   // C5
      { freq: 415.3, time: 0.95, dur: 0.1 },    // Ab4
      { freq: 523.25, time: 1.05, dur: 0.8 },   // C5 long
    ];

    fanfare.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(0.4, now + time + 0.02);
      gain.gain.setValueAtTime(0.4, now + time + dur - 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur + 0.1);

      osc.start(now + time);
      osc.stop(now + time + dur + 0.15);
    });

    // Harmony layer
    const harmony = [
      { freq: 659.25, time: 0.55, dur: 0.4 },
      { freq: 783.99, time: 1.05, dur: 0.8 },
    ];

    harmony.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);
      gain.gain.setValueAtTime(0.2, now + time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur + 0.1);
      osc.start(now + time);
      osc.stop(now + time + dur + 0.15);
    });

    // Sparkle effect
    for (let i = 0; i < 6; i++) {
      const sparkle = ctx.createOscillator();
      const sparkleGain = ctx.createGain();
      sparkle.connect(sparkleGain);
      sparkleGain.connect(ctx.destination);
      sparkle.type = 'sine';
      const sparkleFreq = 1200 + i * 300;
      sparkle.frequency.setValueAtTime(sparkleFreq, now + 1.0 + i * 0.08);
      sparkleGain.gain.setValueAtTime(0.12, now + 1.0 + i * 0.08);
      sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0 + i * 0.08 + 0.3);
      sparkle.start(now + 1.0 + i * 0.08);
      sparkle.stop(now + 1.0 + i * 0.08 + 0.35);
    }
  } catch (e) {
    // Audio context may be blocked
  }
}

export function playCountdownBeep(isLast: boolean): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(isLast ? 880 : 660, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isLast ? 0.4 : 0.2));

    osc.start(now);
    osc.stop(now + (isLast ? 0.45 : 0.25));
  } catch (e) {
    // Audio context may be blocked
  }
}
