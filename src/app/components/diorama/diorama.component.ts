import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimerMode, TimerStatus } from '../../models/focus-forge.model';

@Component({
  selector: 'app-diorama',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="diorama-container" [ngClass]="[mode, getFireStage()]">
      <!-- Ambient Time-of-Session Badge -->
      <div class="diorama-header">
        <span class="diorama-title">
          @if (isBreakMode()) {
            🌙 MOONLIT OASIS (RESTORE)
          } @else {
            🏕️ FORGE CAMPSITE ({{ (progress * 100) | number:'1.0-0' }}% IGNITED)
          }
        </span>
      </div>

      <!-- SVG Living Diorama Canvas -->
      <svg
        class="diorama-svg"
        viewBox="0 0 600 340"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <!-- Twilight to Midnight Sky Gradients -->
          <linearGradient id="skyWorkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="60%" stop-color="#1e1b4b" />
            <stop offset="100%" stop-color="#311042" />
          </linearGradient>

          <linearGradient id="skyBreakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#020617" />
            <stop offset="60%" stop-color="#082f49" />
            <stop offset="100%" stop-color="#0f172a" />
          </linearGradient>

          <!-- Campfire Warmth Radial Glow -->
          <radialGradient id="fireGlowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.8" />
            <stop offset="50%" stop-color="#ea580c" stop-opacity="0.4" />
            <stop offset="100%" stop-color="#7c2d12" stop-opacity="0" />
          </radialGradient>

          <radialGradient id="breakFireGlowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.7" />
            <stop offset="60%" stop-color="#0284c7" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#0369a1" stop-opacity="0" />
          </radialGradient>

          <!-- Mountain Gradient -->
          <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1e293b" />
            <stop offset="100%" stop-color="#0f172a" />
          </linearGradient>
        </defs>

        <!-- Sky Background -->
        <rect
          x="0"
          y="0"
          width="600"
          height="340"
          [attr.fill]="isBreakMode() ? 'url(#skyBreakGrad)' : 'url(#skyWorkGrad)'"
        />

        <!-- Starfield (Fades in with progress) -->
        <g class="starfield" [style.opacity]="0.3 + progress * 0.7">
          <circle cx="65" cy="45" r="1.5" class="star s1" />
          <circle cx="120" cy="70" r="1" class="star s2" />
          <circle cx="190" cy="35" r="2" class="star s3" />
          <circle cx="280" cy="60" r="1.5" class="star s1" />
          <circle cx="340" cy="30" r="1" class="star s2" />
          <circle cx="430" cy="50" r="2.5" class="star s3" />
          <circle cx="510" cy="40" r="1.5" class="star s1" />
          <circle cx="560" cy="75" r="1" class="star s2" />
          <circle cx="95" cy="110" r="1" class="star s3" />
          <circle cx="490" cy="100" r="1.5" class="star s1" />

          <!-- Moon -->
          <path
            d="M 520,40 A 22,22 0 0 1 542,62 A 22,22 0 1 1 520,40 Z"
            fill="#fef08a"
            opacity="0.85"
            class="moon"
          />
        </g>

        <!-- Shooting Star on Completion or High Progress -->
        @if (progress >= 0.95 || status === 'completed') {
          <line
            x1="120"
            y1="30"
            x2="280"
            y2="110"
            class="shooting-star"
          />
        }

        <!-- Distant Mountain Silhouettes -->
        <polygon points="0,240 110,130 220,240" fill="url(#mountainGrad)" opacity="0.6" />
        <polygon points="160,240 280,105 400,240" fill="url(#mountainGrad)" opacity="0.8" />
        <polygon points="340,240 460,120 580,240" fill="url(#mountainGrad)" opacity="0.7" />

        <!-- Pine Tree Ridge -->
        <g class="trees" fill="#090d16">
          <polygon points="30,240 45,185 60,240" />
          <polygon points="50,240 68,175 86,240" />
          <polygon points="75,240 92,190 110,240" />
          <polygon points="480,240 500,170 520,240" />
          <polygon points="510,240 528,180 546,240" />
          <polygon points="535,240 550,195 565,240" />
        </g>

        <!-- Campsite Ground Plateau -->
        <ellipse cx="300" cy="275" rx="280" ry="60" fill="#1c1917" />
        <ellipse cx="300" cy="285" rx="240" ry="45" fill="#141210" />

        <!-- Expedition Tent (Left) -->
        <g class="tent-group" transform="translate(100, 180)">
          <!-- Main tent body -->
          <polygon points="40,20 120,95 0,95" fill="#334155" />
          <polygon points="40,20 0,95 25,95" fill="#1e293b" />
          <!-- Tent flap / entrance -->
          <polygon points="40,20 65,95 25,95" fill="#0f172a" />

          <!-- Hanging Lantern -->
          <g class="tent-lantern" transform="translate(68, 80)">
            <rect x="-3" y="-8" width="6" height="2" fill="#94a3b8" />
            <rect x="-4" y="-6" width="8" height="10" rx="2" fill="#475569" />
            @if (isLanternLit()) {
              <circle cx="0" cy="-1" r="14" fill="rgba(254, 240, 138, 0.45)" class="lantern-glow" />
              <circle cx="0" cy="-1" r="3" fill="#fef08a" />
            }
          </g>
        </g>

        <!-- Tree Stump & Steaming Coffee Mug (Right) -->
        <g class="mug-group" transform="translate(420, 235)">
          <!-- Wooden Stump -->
          <ellipse cx="20" cy="40" rx="22" ry="10" fill="#44403c" />
          <rect x="-2" y="15" width="44" height="25" fill="#292524" />
          <ellipse cx="20" cy="15" rx="22" ry="7" fill="#57534e" />

          <!-- Ceramic Mug -->
          <rect x="14" y="2" width="12" height="13" rx="2" fill="#e2e8f0" />
          <path d="M 26,5 C 30,5 30,11 26,11" fill="none" stroke="#e2e8f0" stroke-width="2" />

          <!-- Steam Curves (If active) -->
          @if (status === 'running') {
            <path d="M 18,-2 Q 15,-8 19,-14" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" class="steam-line s1" />
            <path d="M 23,-1 Q 26,-7 22,-13" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" class="steam-line s2" />
          }
        </g>

        <!-- Central Campfire Hearth -->
        <g class="campfire-group" transform="translate(300, 260)">
          <!-- Ambient Ground Light Reflection -->
          <ellipse
            cx="0"
            cy="10"
            [attr.rx]="35 + fireScale * 45"
            [attr.ry]="15 + fireScale * 20"
            [attr.fill]="isBreakMode() ? 'url(#breakFireGlowGrad)' : 'url(#fireGlowGrad)'"
            class="ground-glow"
          />

          <!-- Fire Ring Stones -->
          <ellipse cx="-28" cy="8" rx="8" ry="5" fill="#44403c" />
          <ellipse cx="-15" cy="14" rx="9" ry="5" fill="#57534e" />
          <ellipse cx="0" cy="16" rx="10" ry="6" fill="#44403c" />
          <ellipse cx="16" cy="14" rx="9" ry="5" fill="#57534e" />
          <ellipse cx="28" cy="8" rx="8" ry="5" fill="#44403c" />
          <ellipse cx="-20" cy="2" rx="7" ry="4" fill="#292524" />
          <ellipse cx="20" cy="2" rx="7" ry="4" fill="#292524" />

          <!-- Crossed Campfire Logs -->
          <line x1="-24" y1="10" x2="24" y2="-4" stroke="#78350f" stroke-width="7" stroke-linecap="round" />
          <line x1="24" y1="10" x2="-24" y2="-4" stroke="#92400e" stroke-width="7" stroke-linecap="round" />

          <!-- Dynamic Animated Flame -->
          <g class="flame-body" [style.transform]="'scale(' + fireScale + ')'">
            @if (isBreakMode()) {
              <!-- Calming Blue Fire -->
              <path
                d="M 0,0 C -15,-15 -18,-35 0,-50 C 18,-35 15,-15 0,0 Z"
                fill="#38bdf8"
                class="blue-flame outer"
              />
              <path
                d="M 0,0 C -8,-10 -10,-24 0,-34 C 10,-24 8,-10 0,0 Z"
                fill="#e0f2fe"
                class="blue-flame inner"
              />
            } @else {
              <!-- Roaring Warm Fire -->
              <path
                d="M 0,0 C -20,-15 -25,-40 0,-60 C 25,-40 20,-15 0,0 Z"
                fill="#dc2626"
                class="orange-flame outer"
              />
              <path
                d="M 0,0 C -14,-12 -16,-32 0,-48 C 16,-32 14,-12 0,0 Z"
                fill="#ea580c"
                class="orange-flame mid"
              />
              <path
                d="M 0,0 C -8,-8 -10,-20 0,-30 C 10,-20 8,-8 0,0 Z"
                fill="#fef08a"
                class="orange-flame core"
              />
            }

            <!-- Floating Fire Embers -->
            @if (progress > 0.25) {
              <circle cx="-6" cy="-45" r="2" class="ember e1" />
              <circle cx="8" cy="-55" r="1.5" class="ember e2" />
              <circle cx="-2" cy="-65" r="2.5" class="ember e3" />
            }
          </g>
        </g>
      </svg>
    </div>
  `,
  styles: [`
    .diorama-container {
      background: #0f172a;
      border: 1px solid rgba(217, 119, 6, 0.25);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.7);
      margin-bottom: 2rem;
      position: relative;
    }

    .diorama-container.shortBreak, .diorama-container.longBreak {
      border-color: rgba(56, 189, 248, 0.3);
    }

    .diorama-header {
      position: absolute;
      top: 1rem;
      left: 1.25rem;
      z-index: 10;
    }

    .diorama-title {
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #fef3c7;
      background: rgba(15, 23, 42, 0.75);
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .diorama-svg {
      display: block;
      width: 100%;
      height: auto;
      max-height: 340px;
    }

    /* Animations */
    .star {
      fill: #ffffff;
      animation: twinkle 3s infinite ease-in-out;
    }

    .star.s2 { animation-delay: 1s; }
    .star.s3 { animation-delay: 2s; }

    @keyframes twinkle {
      0%, 100% { opacity: 0.3; transform: scale(0.8); }
      50% { opacity: 1; transform: scale(1.2); }
    }

    .shooting-star {
      stroke: #fef08a;
      stroke-width: 2.5;
      stroke-linecap: round;
      animation: shoot 1.2s infinite ease-out;
    }

    @keyframes shoot {
      0% { opacity: 0; transform: translate(-80px, -40px); }
      30% { opacity: 1; }
      100% { opacity: 0; transform: translate(120px, 60px); }
    }

    .flame-body {
      transform-origin: 0 0;
      transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .orange-flame {
      animation: flameFlicker 1.4s infinite ease-in-out alternate;
      transform-origin: 0 0;
    }

    .orange-flame.mid { animation-delay: 0.2s; }
    .orange-flame.core { animation-delay: 0.4s; }

    .blue-flame {
      animation: flameFlicker 2s infinite ease-in-out alternate;
    }

    @keyframes flameFlicker {
      0% { transform: scale(1) skewX(-2deg); }
      50% { transform: scale(1.08, 0.95) skewX(3deg); }
      100% { transform: scale(0.96, 1.05) skewX(-1deg); }
    }

    .ember {
      fill: #fbbf24;
      animation: riseEmber 2s infinite ease-out;
    }

    .ember.e2 { animation-delay: 0.6s; fill: #f59e0b; }
    .ember.e3 { animation-delay: 1.2s; fill: #ef4444; }

    @keyframes riseEmber {
      0% { opacity: 1; transform: translate(0, 0) scale(1); }
      100% { opacity: 0; transform: translate(8px, -35px) scale(0.2); }
    }

    .steam-line {
      animation: steamCurl 2s infinite linear;
    }

    .steam-line.s2 {
      animation-delay: 1s;
    }

    @keyframes steamCurl {
      0% { opacity: 0; transform: translateY(0); }
      50% { opacity: 0.6; }
      100% { opacity: 0; transform: translateY(-12px); }
    }
  `]
})
export class DioramaComponent {
  @Input() progress = 0; // 0.0 to 1.0
  @Input() mode: TimerMode = 'work';
  @Input() status: TimerStatus = 'idle';

  get fireScale(): number {
    if (this.isBreakMode()) return 0.65;
    // Scale flame smoothly from 0.3 up to 1.25 as progress advances
    return 0.3 + this.progress * 0.95;
  }

  getFireStage(): 'spark' | 'kindle' | 'blaze' | 'inferno' {
    if (this.progress < 0.25) return 'spark';
    if (this.progress < 0.55) return 'kindle';
    if (this.progress < 0.85) return 'blaze';
    return 'inferno';
  }

  isLanternLit(): boolean {
    return this.progress >= 0.5 || this.isBreakMode();
  }

  isBreakMode(): boolean {
    return this.mode === 'shortBreak' || this.mode === 'longBreak';
  }
}
