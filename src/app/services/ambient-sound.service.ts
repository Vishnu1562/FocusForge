import { Injectable, signal } from '@angular/core';
import { SoundChannel, SoundChannelId } from '../models/focus-forge.model';

export interface SoundscapePreset {
  name: string;
  volumes: Record<SoundChannelId, number>;
}

export const SOUNDSCAPE_PRESETS: SoundscapePreset[] = [
  {
    name: 'Rainy Campsite',
    volumes: { rain: 0.7, fire: 0.5, wind: 0.2, binaural: 0.0 }
  },
  {
    name: 'Fireplace Study',
    volumes: { rain: 0.0, fire: 0.8, wind: 0.0, binaural: 0.3 }
  },
  {
    name: 'Deep Focus Binaural',
    volumes: { rain: 0.2, fire: 0.0, wind: 0.3, binaural: 0.7 }
  },
  {
    name: 'Gentle Forest',
    volumes: { rain: 0.35, fire: 0.35, wind: 0.45, binaural: 0.15 }
  }
];

const INITIAL_CHANNELS: SoundChannel[] = [
  { id: 'rain', name: 'Rainfall', icon: '🌧️', volume: 0.5, enabled: true },
  { id: 'fire', name: 'Campfire', icon: '🔥', volume: 0.6, enabled: true },
  { id: 'wind', name: 'Night Wind', icon: '🌊', volume: 0.3, enabled: true },
  { id: 'binaural', name: 'Alpha Beats (10Hz)', icon: '🎵', volume: 0.4, enabled: false }
];

@Injectable({
  providedIn: 'root'
})
export class AmbientSoundService {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private channelGainNodes = new Map<SoundChannelId, GainNode>();
  private activeGenerators: (() => void)[] = [];
  private isSynthesizing = false;

  channels = signal<SoundChannel[]>([...INITIAL_CHANNELS]);
  masterVolume = signal<number>(0.8);
  isMuted = signal<boolean>(false);

  private readonly STORAGE_MUTED_KEY = 'focusforge_muted';
  private readonly STORAGE_VOLUMES_KEY = 'focusforge_channel_volumes';

  constructor() {
    this.restorePreferences();
  }

  toggleMute(): boolean {
    const next = !this.isMuted();
    this.isMuted.set(next);
    this.applyMasterGain();

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_MUTED_KEY, String(next));
      }
    } catch {
      // Storage unavailable
    }
    return next;
  }

  setMasterVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, vol));
    this.masterVolume.set(clamped);
    this.applyMasterGain();
  }

  setChannelVolume(id: SoundChannelId, vol: number): void {
    const clamped = Math.max(0, Math.min(1, vol));
    const updated = this.channels().map(c => {
      if (c.id === id) {
        return { ...c, volume: clamped };
      }
      return c;
    });
    this.channels.set(updated);
    this.updateGainNode(id, clamped);
    this.persistVolumes();
  }

  toggleChannelEnabled(id: SoundChannelId): void {
    const updated = this.channels().map(c => {
      if (c.id === id) {
        return { ...c, enabled: !c.enabled };
      }
      return c;
    });
    this.channels.set(updated);
    const target = updated.find(c => c.id === id);
    if (target) {
      this.updateGainNode(id, target.enabled ? target.volume : 0);
    }
    this.persistVolumes();
  }

  applyPreset(preset: SoundscapePreset): void {
    const updated = this.channels().map(c => {
      const vol = preset.volumes[c.id] ?? c.volume;
      this.updateGainNode(c.id, vol);
      return { ...c, volume: vol, enabled: vol > 0 };
    });
    this.channels.set(updated);
    this.persistVolumes();
  }

  startAmbientSounds(): void {
    if (this.isSynthesizing) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      this.isSynthesizing = true;
      this.setupSoundEngines(ctx);
    } catch {
      // Audio engine start failure gracefully ignored
    }
  }

  stopAmbientSounds(): void {
    this.activeGenerators.forEach(cleanup => cleanup());
    this.activeGenerators = [];
    this.isSynthesizing = false;
  }

  playCompletionBell(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Authentic Tibetan Singing Bowl (432Hz fundamental + 864Hz octave + 1296Hz harmonic)
      const harmonics = [
        { freq: 432, gain: 0.18, dur: 4.8 },
        { freq: 864, gain: 0.09, dur: 3.5 },
        { freq: 1296, gain: 0.04, dur: 2.2 }
      ];

      harmonics.forEach(h => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(h.freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(h.gain, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + h.dur);

        osc.connect(gain);
        gain.connect(this.masterGain || ctx.destination);

        osc.start(now);
        osc.stop(now + h.dur);
      });
    } catch {
      // Ignored
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.connect(this.audioCtx.destination);
        this.applyMasterGain();
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    return this.audioCtx;
  }

  private setupSoundEngines(ctx: AudioContext): void {
    this.channels().forEach(channel => {
      let node = this.channelGainNodes.get(channel.id);
      if (!node) {
        node = ctx.createGain();
        node.connect(this.masterGain || ctx.destination);
        this.channelGainNodes.set(channel.id, node);
      }
      node.gain.setValueAtTime(channel.enabled ? channel.volume : 0, ctx.currentTime);

      if (channel.id === 'rain') {
        this.createRainGenerator(ctx, node);
      } else if (channel.id === 'fire') {
        this.createFireplaceGenerator(ctx, node);
      } else if (channel.id === 'wind') {
        this.createWindGenerator(ctx, node);
      } else if (channel.id === 'binaural') {
        this.createBinauralGenerator(ctx, node);
      }
    });
  }

  private createRainGenerator(ctx: AudioContext, dest: GainNode): void {
    // 2-second looped pinkish noise buffer
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2) * 0.08;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(750, ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(dest);
    noiseSource.start();

    this.activeGenerators.push(() => {
      try { noiseSource.stop(); } catch {}
    });
  }

  private createFireplaceGenerator(ctx: AudioContext, dest: GainNode): void {
    // Randomized crackle and pop burst intervals
    let active = true;

    const scheduleCrackle = () => {
      if (!active || !this.isSynthesizing) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const freq = 120 + Math.random() * 260;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const vol = 0.02 + Math.random() * 0.08;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.035);

      osc.connect(gain);
      gain.connect(dest);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);

      const nextDelay = 80 + Math.random() * 280;
      setTimeout(scheduleCrackle, nextDelay);
    };

    scheduleCrackle();

    this.activeGenerators.push(() => {
      active = false;
    });
  }

  private createWindGenerator(ctx: AudioContext, dest: GainNode): void {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.06;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);
    filter.Q.setValueAtTime(2.5, ctx.currentTime);

    noise.connect(filter);
    filter.connect(dest);
    noise.start();

    this.activeGenerators.push(() => {
      try { noise.stop(); } catch {}
    });
  }

  private createBinauralGenerator(ctx: AudioContext, dest: GainNode): void {
    // 216Hz and 226Hz sine waves = 10Hz alpha entrainment
    const oscLeft = ctx.createOscillator();
    const oscRight = ctx.createOscillator();

    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(216, ctx.currentTime);

    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(226, ctx.currentTime);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.08, ctx.currentTime);

    oscLeft.connect(subGain);
    oscRight.connect(subGain);
    subGain.connect(dest);

    oscLeft.start();
    oscRight.start();

    this.activeGenerators.push(() => {
      try {
        oscLeft.stop();
        oscRight.stop();
      } catch {}
    });
  }

  private updateGainNode(id: SoundChannelId, vol: number): void {
    const node = this.channelGainNodes.get(id);
    if (node && this.audioCtx) {
      try {
        node.gain.setTargetAtTime(vol, this.audioCtx.currentTime, 0.05);
      } catch {}
    }
  }

  private applyMasterGain(): void {
    if (this.masterGain && this.audioCtx) {
      const vol = this.isMuted() ? 0 : this.masterVolume();
      try {
        this.masterGain.gain.setTargetAtTime(vol, this.audioCtx.currentTime, 0.05);
      } catch {}
    }
  }

  private restorePreferences(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const storedMuted = localStorage.getItem(this.STORAGE_MUTED_KEY);
        if (storedMuted !== null) {
          this.isMuted.set(storedMuted === 'true');
        }

        const storedVolumes = localStorage.getItem(this.STORAGE_VOLUMES_KEY);
        if (storedVolumes) {
          const parsed = JSON.parse(storedVolumes);
          if (parsed && typeof parsed === 'object') {
            const updated = this.channels().map(c => {
              if (typeof parsed[c.id] === 'number') {
                return { ...c, volume: Math.max(0, Math.min(1, parsed[c.id])) };
              }
              return c;
            });
            this.channels.set(updated);
          }
        }
      }
    } catch {}
  }

  private persistVolumes(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const volMap: Record<string, number> = {};
        this.channels().forEach(c => {
          volMap[c.id] = c.volume;
        });
        localStorage.setItem(this.STORAGE_VOLUMES_KEY, JSON.stringify(volMap));
      }
    } catch {}
  }
}
