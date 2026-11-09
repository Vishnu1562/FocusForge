import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SoundChannel, SoundChannelId } from '../../models/focus-forge.model';
import { SOUNDSCAPE_PRESETS, SoundscapePreset } from '../../services/ambient-sound.service';

@Component({
  selector: 'app-sound-mixer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mixer-card">
      <div class="mixer-header">
        <div class="header-left">
          <span class="mixer-badge">🎛️ AMBIENT SOUNDBOARD</span>
          <h3 class="mixer-title">Binaural & Nature Synthesizer</h3>
        </div>

        <button
          type="button"
          class="global-mute-btn"
          [class.muted]="isMuted"
          (click)="onToggleMute()"
          title="Toggle Master Sound (M)"
        >
          @if (isMuted) {
            <span>🔇 Sound Muted</span>
          } @else {
            <span>🔊 Sound Active</span>
          }
        </button>
      </div>

      <!-- Presets Row -->
      <div class="presets-row">
        <span class="presets-label">SOUNDSCAPES:</span>
        <div class="presets-chips">
          @for (preset of presets; track preset.name) {
            <button
              type="button"
              class="preset-chip"
              (click)="onSelectPreset(preset)"
            >
              {{ preset.name }}
            </button>
          }
        </div>
      </div>

      <!-- Channels Grid -->
      <div class="channels-grid">
        @for (channel of channels; track channel.id) {
          <div class="channel-strip" [class.disabled]="!channel.enabled">
            <div class="strip-header">
              <button
                type="button"
                class="channel-toggle-btn"
                [class.active]="channel.enabled"
                (click)="onToggleChannel(channel.id)"
                [title]="channel.enabled ? 'Mute Channel' : 'Enable Channel'"
              >
                <span class="channel-icon">{{ channel.icon }}</span>
              </button>

              <div class="channel-info">
                <span class="channel-name">{{ channel.name }}</span>
                <span class="channel-vol">{{ (channel.volume * 100) | number:'1.0-0' }}%</span>
              </div>
            </div>

            <!-- Volume Slider -->
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              [ngModel]="channel.volume"
              (ngModelChange)="onSliderChange(channel.id, $event)"
              [disabled]="!channel.enabled"
              class="volume-slider"
            />
          </div>
        }
      </div>

      <!-- Master Volume Control -->
      <div class="master-control-row">
        <div class="master-label-col">
          <span class="master-label">MASTER OUTPUT</span>
          <span class="master-val">{{ (masterVolume * 100) | number:'1.0-0' }}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          [ngModel]="masterVolume"
          (ngModelChange)="onMasterChange($event)"
          class="volume-slider master-slider"
        />
      </div>
    </div>
  `,
  styles: [`
    .mixer-card {
      background: rgba(24, 20, 16, 0.85);
      border: 1px solid rgba(217, 119, 6, 0.25);
      border-radius: 20px;
      padding: 1.5rem 1.75rem;
      backdrop-filter: blur(14px);
      box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.7);
      margin-bottom: 2rem;
    }

    .mixer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }

    .mixer-badge {
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #f59e0b;
      margin-bottom: 0.25rem;
      display: block;
    }

    .mixer-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: #fafaf9;
      margin: 0;
      font-family: ui-serif, Georgia, serif;
    }

    .global-mute-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: #292524;
      border: 1px solid #57534e;
      color: #d6d3d1;
      padding: 0.45rem 0.95rem;
      border-radius: 8px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .global-mute-btn:hover {
      border-color: #f59e0b;
      color: #fbbf24;
    }

    .global-mute-btn.muted {
      background: rgba(239, 68, 68, 0.15);
      border-color: #ef4444;
      color: #fca5a5;
    }

    .presets-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
      padding-bottom: 1rem;
      border-bottom: 1px dashed rgba(87, 83, 78, 0.4);
    }

    .presets-label {
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #78716c;
    }

    .presets-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .preset-chip {
      background: #1c1917;
      border: 1px solid #44403c;
      color: #a8a29e;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }

    .preset-chip:hover {
      border-color: #f59e0b;
      color: #fbbf24;
      background: #292524;
    }

    .channels-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .channel-strip {
      background: #1c1917;
      border: 1px solid #44403c;
      border-radius: 12px;
      padding: 0.85rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      transition: opacity 0.2s;
    }

    .channel-strip.disabled {
      opacity: 0.4;
    }

    .strip-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .channel-toggle-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: #292524;
      border: 1px solid #57534e;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s;
    }

    .channel-toggle-btn.active {
      border-color: #f59e0b;
      background: rgba(245, 158, 11, 0.15);
    }

    .channel-icon {
      font-size: 1.2rem;
    }

    .channel-info {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .channel-name {
      font-size: 0.82rem;
      font-weight: 700;
      color: #fafaf9;
    }

    .channel-vol {
      font-size: 0.72rem;
      color: #f59e0b;
      font-family: ui-monospace, monospace;
      font-weight: 600;
    }

    .volume-slider {
      width: 100%;
      height: 6px;
      accent-color: #f59e0b;
      cursor: pointer;
    }

    .master-control-row {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      background: #141210;
      border: 1px solid #44403c;
      border-radius: 12px;
      padding: 0.85rem 1.25rem;
    }

    .master-label-col {
      display: flex;
      flex-direction: column;
      min-width: 120px;
    }

    .master-label {
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #a8a29e;
    }

    .master-val {
      font-size: 0.85rem;
      font-weight: 800;
      color: #fafaf9;
      font-family: ui-monospace, monospace;
    }

    .master-slider {
      flex: 1;
      height: 8px;
      accent-color: #ea580c;
    }
  `]
})
export class SoundMixerComponent {
  @Input() channels: SoundChannel[] = [];
  @Input() masterVolume = 0.8;
  @Input() isMuted = false;

  @Output() channelVolumeChange = new EventEmitter<{ id: SoundChannelId; volume: number }>();
  @Output() channelToggle = new EventEmitter<SoundChannelId>();
  @Output() masterVolumeChange = new EventEmitter<number>();
  @Output() toggleMute = new EventEmitter<void>();
  @Output() applyPreset = new EventEmitter<SoundscapePreset>();

  presets = SOUNDSCAPE_PRESETS;

  onSliderChange(id: SoundChannelId, vol: number): void {
    this.channelVolumeChange.emit({ id, volume: Number(vol) });
  }

  onToggleChannel(id: SoundChannelId): void {
    this.channelToggle.emit(id);
  }

  onMasterChange(vol: number): void {
    this.masterVolumeChange.emit(Number(vol));
  }

  onToggleMute(): void {
    this.toggleMute.emit();
  }

  onSelectPreset(preset: SoundscapePreset): void {
    this.applyPreset.emit(preset);
  }
}
