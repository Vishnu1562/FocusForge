import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DEFAULT_PRESETS } from '../../services/timer-engine.service';
import { TimerMode, TimerPreset, TimerStatus } from '../../models/focus-forge.model';

@Component({
  selector: 'app-timer-display',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="timer-card" [ngClass]="mode">
      <!-- Mode Badge Header -->
      <div class="mode-header">
        <span class="mode-badge" [ngClass]="mode">
          <span class="mode-indicator-dot"></span>
          {{ getModeLabel() }}
        </span>

        @if (status === 'running') {
          <span class="status-pulse-badge">
            <span class="flame-spark">🔥</span> Deep Focus Active
          </span>
        }
      </div>

      <!-- Circular Progress Ring Stage -->
      <div class="dial-container">
        <svg class="progress-ring-svg" viewBox="0 0 280 280">
          <defs>
            <linearGradient id="workGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#f59e0b" />
              <stop offset="50%" stop-color="#ea580c" />
              <stop offset="100%" stop-color="#dc2626" />
            </linearGradient>

            <linearGradient id="breakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#38bdf8" />
              <stop offset="100%" stop-color="#3b82f6" />
            </linearGradient>

            <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <!-- Background Track Ring -->
          <circle
            cx="140"
            cy="140"
            r="120"
            class="ring-bg"
          />

          <!-- Active Animated Progress Stroke -->
          <circle
            cx="140"
            cy="140"
            r="120"
            class="ring-progress"
            [class.break-mode]="mode !== 'work'"
            [attr.stroke-dasharray]="circumference"
            [attr.stroke-dashoffset]="strokeOffset"
            filter="url(#ringGlow)"
          />
        </svg>

        <!-- Centered Digital Counter -->
        <div class="time-readout">
          <span class="digits">{{ formatTime(remainingSeconds) }}</span>
          <span class="preset-name">{{ currentPresetName }}</span>
        </div>
      </div>

      <!-- Tactile Control Bar -->
      <div class="controls-row">
        <!-- Reset Button -->
        <button
          type="button"
          class="control-btn icon-btn"
          (click)="onReset()"
          title="Reset Session (R)"
        >
          <span class="btn-icon">↺</span>
          <span class="btn-label">Reset</span>
        </button>

        <!-- Giant Play / Pause Button -->
        <button
          type="button"
          class="primary-action-btn"
          [ngClass]="mode"
          (click)="onTogglePlay()"
          [title]="status === 'running' ? 'Pause (Space)' : 'Focus Now (Space)'"
        >
          @if (status === 'running') {
            <span class="action-icon">⏸</span>
            <span class="action-label">Pause</span>
          } @else if (status === 'paused') {
            <span class="action-icon">▶</span>
            <span class="action-label">Resume</span>
          } @else {
            <span class="action-icon">⚡</span>
            <span class="action-label">Ignite Focus</span>
          }
        </button>

        <!-- Skip Button -->
        <button
          type="button"
          class="control-btn icon-btn"
          (click)="onSkip()"
          title="Skip to Next Phase (S)"
        >
          <span class="btn-icon">⏭</span>
          <span class="btn-label">Skip</span>
        </button>
      </div>

      <!-- Presets Row -->
      <div class="presets-row">
        <span class="presets-title">INTERVALS:</span>
        <div class="presets-chips">
          @for (preset of presets; track preset.name) {
            <button
              type="button"
              class="preset-chip"
              [class.active]="currentPresetName === preset.name"
              (click)="onSelectPreset(preset)"
            >
              {{ preset.name }}
            </button>
          }

          <button
            type="button"
            class="preset-chip custom-chip"
            (click)="showCustomModal = !showCustomModal"
          >
            Custom ⚙
          </button>
        </div>
      </div>

      <!-- Custom Duration Drawer / Popover -->
      @if (showCustomModal) {
        <div class="custom-modal animate-fade-in">
          <span class="modal-title">CUSTOM SESSION LENGTH:</span>
          <div class="custom-inputs">
            <div class="input-col">
              <label>Work (min)</label>
              <input type="number" [(ngModel)]="customWorkMinutes" min="1" max="180" />
            </div>
            <div class="input-col">
              <label>Break (min)</label>
              <input type="number" [(ngModel)]="customBreakMinutes" min="1" max="60" />
            </div>
            <button type="button" class="apply-btn" (click)="applyCustom()">
              Set
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .timer-card {
      background: rgba(24, 20, 16, 0.85);
      border: 1px solid rgba(217, 119, 6, 0.25);
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 25px rgba(217, 119, 6, 0.08);
      backdrop-filter: blur(14px);
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }

    .timer-card.shortBreak, .timer-card.longBreak {
      border-color: rgba(56, 189, 248, 0.25);
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 25px rgba(56, 189, 248, 0.08);
    }

    .mode-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .mode-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.9rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.35);
      color: #f59e0b;
    }

    .mode-badge.shortBreak, .mode-badge.longBreak {
      background: rgba(56, 189, 248, 0.15);
      border-color: rgba(56, 189, 248, 0.35);
      color: #38bdf8;
    }

    .mode-indicator-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: currentColor;
    }

    .status-pulse-badge {
      font-size: 0.75rem;
      color: #fdba74;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .flame-spark {
      animation: flameWiggle 1.5s infinite ease-in-out;
    }

    .dial-container {
      position: relative;
      width: 280px;
      height: 280px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2rem;
    }

    .progress-ring-svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .ring-bg {
      fill: none;
      stroke: #292524;
      stroke-width: 12;
    }

    .ring-progress {
      fill: none;
      stroke: url(#workGradient);
      stroke-width: 12;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.4s ease;
    }

    .ring-progress.break-mode {
      stroke: url(#breakGradient);
    }

    .time-readout {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      pointer-events: none;
    }

    .digits {
      font-size: 3.4rem;
      font-weight: 800;
      color: #fafaf9;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      letter-spacing: -0.04em;
      line-height: 1;
    }

    .preset-name {
      font-size: 0.78rem;
      color: #a8a29e;
      font-weight: 600;
      margin-top: 0.5rem;
      letter-spacing: 0.05em;
    }

    .controls-row {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .primary-action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      background: linear-gradient(135deg, #ea580c, #c2410c);
      color: #fff;
      border: 1px solid #f97316;
      border-radius: 14px;
      padding: 0.85rem 2.2rem;
      font-size: 1.15rem;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(234, 88, 12, 0.4);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .primary-action-btn:hover {
      background: linear-gradient(135deg, #f97316, #ea580c);
      transform: translateY(-2px);
      box-shadow: 0 12px 28px rgba(249, 115, 22, 0.5);
    }

    .primary-action-btn.shortBreak, .primary-action-btn.longBreak {
      background: linear-gradient(135deg, #0284c7, #0369a1);
      border-color: #38bdf8;
      box-shadow: 0 8px 24px rgba(2, 132, 199, 0.4);
    }

    .control-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      background: #292524;
      border: 1px solid #44403c;
      color: #a8a29e;
      padding: 0.6rem 0.9rem;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .control-btn:hover {
      border-color: #f59e0b;
      color: #fafaf9;
      background: #44403c;
    }

    .btn-icon {
      font-size: 1.1rem;
    }

    .btn-label {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .presets-row {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.65rem;
      width: 100%;
    }

    .presets-title {
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #78716c;
    }

    .presets-chips {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem;
    }

    .preset-chip {
      background: #1c1917;
      border: 1px solid #44403c;
      color: #d6d3d1;
      padding: 0.4rem 0.85rem;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .preset-chip:hover {
      border-color: #f59e0b;
      color: #fbbf24;
    }

    .preset-chip.active {
      background: rgba(245, 158, 11, 0.15);
      border-color: #f59e0b;
      color: #fbbf24;
      font-weight: 700;
    }

    .custom-modal {
      margin-top: 1.25rem;
      padding: 1rem 1.25rem;
      background: #1c1917;
      border: 1px solid #44403c;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .modal-title {
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #a8a29e;
    }

    .custom-inputs {
      display: flex;
      align-items: flex-end;
      gap: 0.75rem;
    }

    .input-col {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .input-col label {
      font-size: 0.68rem;
      color: #78716c;
    }

    .input-col input {
      width: 70px;
      background: #292524;
      border: 1px solid #57534e;
      color: #fff;
      padding: 0.35rem 0.5rem;
      border-radius: 6px;
      font-size: 0.9rem;
      font-family: ui-monospace, monospace;
    }

    .apply-btn {
      background: #d97706;
      border: none;
      color: #fff;
      padding: 0.45rem 0.85rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
    }

    @keyframes flameWiggle {
      0%, 100% { transform: scale(1) rotate(0deg); }
      50% { transform: scale(1.15) rotate(4deg); }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-fade-in {
      animation: fadeIn 0.2s ease-out;
    }
  `]
})
export class TimerDisplayComponent {
  @Input() remainingSeconds: number = 25 * 60;
  @Input() totalSeconds: number = 25 * 60;
  @Input() progressFraction: number = 0;
  @Input() mode: TimerMode = 'work';
  @Input() status: TimerStatus = 'idle';
  @Input() cycleNumber: number = 1;
  @Input() currentPresetName: string = 'Classic Pomodoro';

  @Output() togglePlay = new EventEmitter<void>();
  @Output() resetTimer = new EventEmitter<void>();
  @Output() skipPhase = new EventEmitter<void>();
  @Output() selectPreset = new EventEmitter<TimerPreset>();
  @Output() setCustom = new EventEmitter<{ workMin: number; breakMin: number }>();

  presets: TimerPreset[] = DEFAULT_PRESETS;
  showCustomModal = false;
  customWorkMinutes = 25;
  customBreakMinutes = 5;

  readonly circumference = 2 * Math.PI * 120; // 753.98

  get strokeOffset(): number {
    return this.circumference * (1 - this.progressFraction);
  }

  formatTime(totalSecs: number): string {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  getModeLabel(): string {
    if (this.mode === 'work') {
      return `FOCUS SESSION #${this.cycleNumber}`;
    }
    if (this.mode === 'shortBreak') {
      return 'SHORT BREAK';
    }
    return 'LONG BREAK';
  }

  onTogglePlay(): void {
    this.togglePlay.emit();
  }

  onReset(): void {
    this.resetTimer.emit();
  }

  onSkip(): void {
    this.skipPhase.emit();
  }

  onSelectPreset(preset: TimerPreset): void {
    this.showCustomModal = false;
    this.selectPreset.emit(preset);
  }

  applyCustom(): void {
    this.setCustom.emit({
      workMin: this.customWorkMinutes,
      breakMin: this.customBreakMinutes
    });
    this.showCustomModal = false;
  }
}
