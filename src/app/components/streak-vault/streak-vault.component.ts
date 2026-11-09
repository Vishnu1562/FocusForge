import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Badge, StreakData } from '../../models/focus-forge.model';

export interface HeatmapDay {
  dateString: string;
  dayLabel: string;
  minutes: number;
  level: 'empty' | 'low' | 'medium' | 'high';
}

@Component({
  selector: 'app-streak-vault',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (streakData) {
      <div class="vault-card">
        <div class="vault-header">
          <span class="vault-badge">🔥 FORGE REPUTATION & MILESTONES</span>
          <h3 class="vault-title">Deep Work Telemetry</h3>
        </div>

        <!-- High-level Telemetry Stats -->
        <div class="stats-grid">
          <div class="stat-tile">
            <span class="stat-icon">⏱️</span>
            <div class="stat-data">
              <span class="stat-label">TOTAL TIME FOCUSED</span>
              <span class="stat-val">{{ formatHours(streakData.totalMinutes) }}</span>
            </div>
          </div>

          <div class="stat-tile">
            <span class="stat-icon">🎯</span>
            <div class="stat-data">
              <span class="stat-label">SESSIONS COMPLETED</span>
              <span class="stat-val">{{ streakData.completedSessions }}</span>
            </div>
          </div>

          <div class="stat-tile">
            <span class="stat-icon">⚡</span>
            <div class="stat-data">
              <span class="stat-label">DAILY STREAK</span>
              <span class="stat-val">{{ streakData.currentStreak }} <small>days</small></span>
            </div>
          </div>

          <div class="stat-tile">
            <span class="stat-icon">🎖️</span>
            <div class="stat-data">
              <span class="stat-label">BADGES UNLOCKED</span>
              <span class="stat-val">{{ getUnlockedBadgeCount() }} / {{ streakData.badges.length }}</span>
            </div>
          </div>
        </div>

        <!-- 14-Day Activity Heatmap -->
        <div class="heatmap-section">
          <div class="heatmap-header">
            <span class="heatmap-title">LAST 14 DAYS DEDICATION:</span>
            <span class="heatmap-legend">
              <span class="legend-box empty"></span> 0m
              <span class="legend-box low"></span> &lt;30m
              <span class="legend-box medium"></span> &lt;60m
              <span class="legend-box high"></span> 60m+
            </span>
          </div>

          <div class="heatmap-row">
            @for (day of getHeatmapDays(); track day.dateString) {
              <div
                class="heatmap-tile"
                [ngClass]="day.level"
                [title]="day.dateString + ': ' + day.minutes + ' minutes'"
              >
                <span class="tile-day">{{ day.dayLabel }}</span>
                <span class="tile-min">{{ day.minutes }}m</span>
              </div>
            }
          </div>
        </div>

        <!-- Badges Showcase -->
        <div class="badges-section">
          <span class="badges-title">ACHIEVEMENT BADGES:</span>
          <div class="badges-grid">
            @for (badge of streakData.badges; track badge.id) {
              <div class="badge-card" [class.unlocked]="badge.unlocked">
                <span class="badge-icon">{{ badge.icon }}</span>
                <div class="badge-details">
                  <div class="badge-title-row">
                    <span class="badge-name">{{ badge.title }}</span>
                    @if (badge.unlocked) {
                      <span class="badge-status-tag unlocked">UNLOCKED</span>
                    } @else {
                      <span class="badge-status-tag locked">LOCKED</span>
                    }
                  </div>
                  <span class="badge-desc">{{ badge.description }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .vault-card {
      background: rgba(24, 20, 16, 0.85);
      border: 1px solid rgba(217, 119, 6, 0.25);
      border-radius: 20px;
      padding: 1.75rem 2rem;
      backdrop-filter: blur(14px);
      box-shadow: 0 15px 35px -10px rgba(0, 0, 0, 0.7);
      margin-bottom: 2rem;
    }

    .vault-header {
      margin-bottom: 1.5rem;
    }

    .vault-badge {
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #f59e0b;
      display: block;
      margin-bottom: 0.25rem;
    }

    .vault-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: #fafaf9;
      margin: 0;
      font-family: ui-serif, Georgia, serif;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-tile {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      background: #1c1917;
      border: 1px solid #44403c;
      padding: 1rem;
      border-radius: 12px;
      transition: all 0.15s ease;
    }

    .stat-tile:hover {
      border-color: #f59e0b;
      transform: translateY(-1px);
    }

    .stat-icon {
      font-size: 1.6rem;
    }

    .stat-data {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #a8a29e;
    }

    .stat-val {
      font-size: 1.35rem;
      font-weight: 800;
      color: #fafaf9;
      font-family: ui-monospace, monospace;
      line-height: 1.2;
      margin-top: 0.15rem;
    }

    .stat-val small {
      font-size: 0.8rem;
      font-weight: 500;
      color: #a8a29e;
    }

    .heatmap-section {
      background: #141210;
      border: 1px solid #44403c;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      margin-bottom: 2rem;
    }

    .heatmap-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 0.85rem;
    }

    .heatmap-title {
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #d6d3d1;
    }

    .heatmap-legend {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.68rem;
      color: #a8a29e;
    }

    .legend-box {
      width: 10px;
      height: 10px;
      border-radius: 2px;
    }

    .legend-box.empty { background: #292524; }
    .legend-box.low { background: #d97706; }
    .legend-box.medium { background: #f59e0b; }
    .legend-box.high { background: #fbbf24; }

    .heatmap-row {
      display: grid;
      grid-template-columns: repeat(14, 1fr);
      gap: 0.35rem;
    }

    @media (max-width: 600px) {
      .heatmap-row {
        grid-template-columns: repeat(7, 1fr);
      }
    }

    .heatmap-tile {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0.4rem 0.2rem;
      border-radius: 6px;
      background: #292524;
      border: 1px solid rgba(255, 255, 255, 0.05);
      cursor: default;
      transition: all 0.15s;
    }

    .heatmap-tile.empty { background: #1c1917; color: #78716c; }
    .heatmap-tile.low { background: rgba(217, 119, 6, 0.35); border-color: #d97706; color: #fed7aa; }
    .heatmap-tile.medium { background: rgba(245, 158, 11, 0.5); border-color: #f59e0b; color: #fef3c7; }
    .heatmap-tile.high { background: #f59e0b; border-color: #fbbf24; color: #1c1917; font-weight: 800; }

    .tile-day {
      font-size: 0.62rem;
      font-weight: 700;
      opacity: 0.8;
    }

    .tile-min {
      font-size: 0.68rem;
      font-family: ui-monospace, monospace;
      margin-top: 0.15rem;
    }

    .badges-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .badges-title {
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #a8a29e;
    }

    .badges-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 0.75rem;
    }

    .badge-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #1c1917;
      border: 1px solid #44403c;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      opacity: 0.45;
      transition: all 0.2s ease;
    }

    .badge-card.unlocked {
      opacity: 1;
      border-color: rgba(245, 158, 11, 0.45);
      background: rgba(41, 37, 36, 0.8);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1);
    }

    .badge-icon {
      font-size: 1.5rem;
    }

    .badge-details {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }

    .badge-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.4rem;
    }

    .badge-name {
      font-size: 0.82rem;
      font-weight: 700;
      color: #fafaf9;
    }

    .badge-status-tag {
      font-size: 0.6rem;
      font-weight: 800;
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }

    .badge-status-tag.unlocked {
      background: rgba(34, 197, 94, 0.2);
      color: #86efac;
    }

    .badge-status-tag.locked {
      background: #292524;
      color: #78716c;
    }

    .badge-desc {
      font-size: 0.7rem;
      color: #a8a29e;
      margin-top: 0.15rem;
    }
  `]
})
export class StreakVaultComponent {
  @Input() streakData: StreakData | null = null;

  formatHours(mins: number): string {
    if (!mins || mins <= 0) return '0m';
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours === 0) return `${remainingMins}m`;
    if (remainingMins === 0) return `${hours}h`;
    return `${hours}h ${remainingMins}m`;
  }

  getUnlockedBadgeCount(): number {
    if (!this.streakData) return 0;
    return this.streakData.badges.filter(b => b.unlocked).length;
  }

  getHeatmapDays(): HeatmapDay[] {
    const days: HeatmapDay[] = [];
    const history = this.streakData?.history || {};
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
      const dayLabel = dayNames[d.getDay()];

      const minutes = history[dateStr] || 0;
      let level: 'empty' | 'low' | 'medium' | 'high' = 'empty';
      if (minutes >= 60) level = 'high';
      else if (minutes >= 30) level = 'medium';
      else if (minutes > 0) level = 'low';

      days.push({
        dateString: dateStr,
        dayLabel,
        minutes,
        level
      });
    }

    return days;
  }
}
