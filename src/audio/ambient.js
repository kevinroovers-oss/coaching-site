// Sound, off by default. Generated with the Web Audio API so there are no audio
// files to load: a quiet tonal bed on a perfect fifth, and a short tick when a
// new formation is reached. Civilised, not eerie — nothing minor, nothing
// detuned far enough to beat.

export function createAudio() {
  let ctx = null;
  let master = null;
  let voices = [];
  let enabled = false;

  function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // C3 / G3 / C4 — a fifth and its octave. Heavily filtered so it sits under
    // everything rather than in front of it.
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 620;
    filter.Q.value = 0.4;
    filter.connect(master);

    voices = [130.81, 196.0, 261.63].map((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = [0.5, 0.3, 0.16][i];
      osc.connect(g).connect(filter);

      // A very slow amplitude drift per voice so the bed breathes instead of
      // sitting perfectly still, which is what makes a drone feel synthetic.
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.045 + i * 0.017;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = [0.18, 0.12, 0.07][i];
      lfo.connect(lfoGain).connect(g.gain);

      osc.start();
      lfo.start();
      return { osc, lfo };
    });
  }

  function enable() {
    if (!ctx) build();
    ctx.resume?.();
    enabled = true;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0.045, ctx.currentTime, 1.4);
  }

  function disable() {
    if (!ctx) return;
    enabled = false;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
  }

  // Marks the moment a formation completes. Short, soft, and easy to miss.
  function tick() {
    if (!enabled || !ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1318.5, t); // E6
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.055, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
    osc.connect(g).connect(master);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  return {
    toggle() {
      if (enabled) disable();
      else enable();
      return enabled;
    },
    tick,
    get enabled() {
      return enabled;
    },
  };
}

export function initSoundToggle(audio) {
  const btn = document.getElementById('sound');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const on = audio.toggle();
    btn.setAttribute('aria-pressed', String(on));
  });
}
