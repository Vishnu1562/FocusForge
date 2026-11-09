import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AmbientSoundService, SOUNDSCAPE_PRESETS } from './ambient-sound.service';

describe('AmbientSoundService (TDD Specification)', () => {
  let service: AmbientSoundService;

  beforeEach(() => {
    localStorage.clear();
    service = new AmbientSoundService();
  });

  describe('HF-005 & VR-003: Volume and Mute Controls', () => {
    it('should initialize with default sound channels and volume settings', () => {
      const channels = service.channels();
      expect(channels.length).toBe(4);
      expect(channels.some(c => c.id === 'rain')).toBe(true);
      expect(channels.some(c => c.id === 'fire')).toBe(true);
      expect(channels.some(c => c.id === 'wind')).toBe(true);
      expect(channels.some(c => c.id === 'binaural')).toBe(true);
      expect(service.isMuted()).toBe(false);
    });

    it('should clamp and update channel volume properly', () => {
      service.setChannelVolume('rain', 0.75);
      const rain = service.channels().find(c => c.id === 'rain');
      expect(rain?.volume).toBe(0.75);

      // Clamping test
      service.setChannelVolume('rain', 1.5);
      expect(service.channels().find(c => c.id === 'rain')?.volume).toBe(1.0);

      service.setChannelVolume('rain', -0.2);
      expect(service.channels().find(c => c.id === 'rain')?.volume).toBe(0.0);
    });

    it('should toggle master mute and persist preference', () => {
      expect(service.isMuted()).toBe(false);
      service.toggleMute();
      expect(service.isMuted()).toBe(true);
      expect(localStorage.getItem('focusforge_muted')).toBe('true');

      service.toggleMute();
      expect(service.isMuted()).toBe(false);
      expect(localStorage.getItem('focusforge_muted')).toBe('false');
    });

    it('should apply soundscape presets', () => {
      const preset = SOUNDSCAPE_PRESETS.find(p => p.name === 'Rainy Campsite');
      expect(preset).toBeDefined();

      if (preset) {
        service.applyPreset(preset);
        const rain = service.channels().find(c => c.id === 'rain');
        expect(rain?.volume).toBe(preset.volumes.rain);
      }
    });
  });

  describe('Procedural Synthesis & Bell Chime (HF-002, NF-003)', () => {
    it('should trigger completion bell without throwing errors', () => {
      expect(() => service.playCompletionBell()).not.toThrow();
    });

    it('should start and stop ambient synthesis safely without errors', () => {
      expect(() => service.startAmbientSounds()).not.toThrow();
      expect(() => service.stopAmbientSounds()).not.toThrow();
    });
  });
});
