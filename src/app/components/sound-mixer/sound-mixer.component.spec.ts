import { describe, it, expect, beforeEach } from 'vitest';
import { SoundMixerComponent } from './sound-mixer.component';
import { SoundChannel } from '../../models/focus-forge.model';
import { SOUNDSCAPE_PRESETS } from '../../services/ambient-sound.service';

describe('SoundMixerComponent (TDD Specification)', () => {
  let component: SoundMixerComponent;

  const mockChannels: SoundChannel[] = [
    { id: 'rain', name: 'Rainfall', icon: '🌧️', volume: 0.5, enabled: true },
    { id: 'fire', name: 'Campfire', icon: '🔥', volume: 0.6, enabled: true },
    { id: 'wind', name: 'Night Wind', icon: '🌊', volume: 0.3, enabled: true },
    { id: 'binaural', name: 'Alpha Beats (10Hz)', icon: '🎵', volume: 0.4, enabled: false }
  ];

  beforeEach(() => {
    component = new SoundMixerComponent();
    component.channels = mockChannels;
  });

  describe('HF-005: Mixer Controls', () => {
    it('should emit channelVolumeChange when a channel slider moves', () => {
      let emitted: any = null;
      component.channelVolumeChange.subscribe((val) => {
        emitted = val;
      });

      component.onSliderChange('rain', 0.85);
      expect(emitted).toEqual({ id: 'rain', volume: 0.85 });
    });

    it('should emit channelToggle when an individual channel icon button is clicked', () => {
      let toggledId = '';
      component.channelToggle.subscribe((id) => {
        toggledId = id;
      });

      component.onToggleChannel('fire');
      expect(toggledId).toBe('fire');
    });

    it('should emit masterVolumeChange when master slider is adjusted', () => {
      let masterVol = 0;
      component.masterVolumeChange.subscribe((vol) => {
        masterVol = vol;
      });

      component.onMasterChange(0.9);
      expect(masterVol).toBe(0.9);
    });

    it('should emit toggleMute when global mute button is pressed', () => {
      let muteEmitted = false;
      component.toggleMute.subscribe(() => {
        muteEmitted = true;
      });

      component.onToggleMute();
      expect(muteEmitted).toBe(true);
    });

    it('should emit applyPreset when preset button is pressed', () => {
      let appliedPreset: any = null;
      component.applyPreset.subscribe((preset) => {
        appliedPreset = preset;
      });

      component.onSelectPreset(SOUNDSCAPE_PRESETS[0]);
      expect(appliedPreset?.name).toBe('Rainy Campsite');
    });
  });
});
