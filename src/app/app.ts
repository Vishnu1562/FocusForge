import { Component, HostListener, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TimerEngineService } from './services/timer-engine.service';
import { AmbientSoundService, SoundscapePreset } from './services/ambient-sound.service';
import { StreakService } from './services/streak.service';
import { Badge, SoundChannelId, TimerPreset } from './models/focus-forge.model';
import { TimerDisplayComponent } from './components/timer-display/timer-display.component';
import { DioramaComponent } from './components/diorama/diorama.component';
import { SoundMixerComponent } from './components/sound-mixer/sound-mixer.component';
import { StreakVaultComponent } from './components/streak-vault/streak-vault.component';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    TimerDisplayComponent,
    DioramaComponent,
    SoundMixerComponent,
    StreakVaultComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  unlockedBadgeToast = signal<Badge | null>(null);

  private sessionSub: Subscription | null = null;
  private toastTimeout: any = null;

  constructor(
    public timer: TimerEngineService,
    public sound: AmbientSoundService,
    public streak: StreakService
  ) {}

  ngOnInit(): void {
    this.sessionSub = this.timer.sessionCompleted.subscribe(event => {
      this.sound.playCompletionBell();

      if (event.mode === 'work') {
        const newlyUnlocked = this.streak.recordSession(event.durationMinutes, event.cycleNumber);
        this.triggerConfetti();

        if (newlyUnlocked.length > 0) {
          this.showBadgeToast(newlyUnlocked[0]);
        }
      }
    });

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.onVisibilityChange);
    }
  }

  ngOnDestroy(): void {
    if (this.sessionSub) {
      this.sessionSub.unsubscribe();
    }
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      return;
    }

    if (event.code === 'Space') {
      event.preventDefault();
      this.onTogglePlay();
    } else if (event.code === 'KeyR') {
      this.timer.reset();
      this.sound.stopAmbientSounds();
    } else if (event.code === 'KeyS') {
      this.timer.skip();
    } else if (event.code === 'KeyM') {
      this.sound.toggleMute();
    }
  }

  onTogglePlay(): void {
    const status = this.timer.status();
    if (status === 'running') {
      this.timer.pause();
      this.sound.stopAmbientSounds();
    } else {
      this.timer.start();
      this.sound.startAmbientSounds();
    }
  }

  onReset(): void {
    this.timer.reset();
    this.sound.stopAmbientSounds();
  }

  onSkip(): void {
    this.timer.skip();
  }

  onSelectPreset(preset: TimerPreset): void {
    this.timer.setPreset(preset);
  }

  onSetCustom(data: { workMin: number; breakMin: number }): void {
    this.timer.setCustomMinutes(data.workMin, data.breakMin);
  }

  onChannelVolumeChange(data: { id: SoundChannelId; volume: number }): void {
    this.sound.setChannelVolume(data.id, data.volume);
  }

  onChannelToggle(id: SoundChannelId): void {
    this.sound.toggleChannelEnabled(id);
  }

  onMasterVolumeChange(vol: number): void {
    this.sound.setMasterVolume(vol);
  }

  onToggleMute(): void {
    this.sound.toggleMute();
  }

  onApplySoundPreset(preset: SoundscapePreset): void {
    this.sound.applyPreset(preset);
  }

  dismissToast(): void {
    this.unlockedBadgeToast.set(null);
  }

  private showBadgeToast(badge: Badge): void {
    this.unlockedBadgeToast.set(badge);
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = setTimeout(() => {
      this.unlockedBadgeToast.set(null);
    }, 5000);
  }

  private onVisibilityChange = (): void => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      this.timer.synchronizeClockDelta(0);
    }
  };

  private triggerConfetti(): void {
    try {
      if (typeof window !== 'undefined' && confetti) {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#ea580c', '#38bdf8', '#fbbf24', '#ffffff']
        });
      }
    } catch {}
  }
}
