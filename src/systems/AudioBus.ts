/**
 * Tiny Web Audio synth bus for SFX and a procedural background loop.
 * Avoids external audio assets while still giving the game a live feel.
 * Mute state persisted in localStorage.
 */
const KEY = "agentic-legends:muted";

class AudioBusImpl {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bgGain: GainNode | null = null;
  private bgInterval: number | null = null;
  private muted = false;

  constructor() {
    try {
      this.muted = localStorage.getItem(KEY) === "1";
    } catch {
      this.muted = false;
    }
  }

  private ensure() {
    if (this.ctx) return;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.5;
    this.master.connect(this.ctx.destination);
    this.bgGain = this.ctx.createGain();
    this.bgGain.gain.value = 0.18;
    this.bgGain.connect(this.master);
  }

  isMuted() { return this.muted; }

  toggleMute() {
    this.muted = !this.muted;
    try { localStorage.setItem(KEY, this.muted ? "1" : "0"); } catch { /* ignore */ }
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.5;
    return this.muted;
  }

  private blip(freq: number, duration: number, type: OscillatorType = "square") {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, this.ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
    osc.connect(g).connect(this.master);
    osc.start();
    osc.stop(this.ctx.currentTime + duration + 0.02);
  }

  jump() { this.ensure(); this.blip(620, 0.12, "triangle"); }
  collect() { this.ensure(); this.blip(880, 0.1); setTimeout(() => this.blip(1320, 0.12), 80); }
  hit() { this.ensure(); this.blip(160, 0.18, "sawtooth"); }
  victory() { this.ensure(); [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.blip(f, 0.18, "triangle"), i * 140)); }

  startBackground(scaleNotes: number[] = [261, 329, 392, 523, 392, 329]) {
    this.ensure();
    if (this.bgInterval !== null) return;
    let i = 0;
    const step = () => {
      if (!this.ctx || !this.bgGain) return;
      const f = scaleNotes[i % scaleNotes.length];
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      g.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.5, this.ctx.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.45);
      osc.connect(g).connect(this.bgGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.5);
      i++;
    };
    this.bgInterval = window.setInterval(step, 380);
  }

  stopBackground() {
    if (this.bgInterval !== null) {
      clearInterval(this.bgInterval);
      this.bgInterval = null;
    }
  }
}

export const AudioBus = new AudioBusImpl();
