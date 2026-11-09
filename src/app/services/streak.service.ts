import { Injectable, signal } from '@angular/core';
import { Badge, StreakData } from '../models/focus-forge.model';

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'first-spark',
    title: 'Campfire Spark',
    description: 'Completed your very first focus session.',
    icon: '🔥',
    unlocked: false
  },
  {
    id: 'night-owl',
    title: 'Night Owl',
    description: 'Completed a session between 11:00 PM and 5:00 AM.',
    icon: '🦉',
    unlocked: false
  },
  {
    id: 'century',
    title: 'Century Club',
    description: 'Accumulated 100+ minutes of deep focus.',
    icon: '💯',
    unlocked: false
  },
  {
    id: 'marathon',
    title: 'Marathon Runner',
    description: 'Conquered 4 consecutive focus cycles.',
    icon: '🏃',
    unlocked: false
  },
  {
    id: 'zen-master',
    title: 'Zen Master',
    description: 'Completed 10 total focus sessions.',
    icon: '🧘',
    unlocked: false
  }
];

@Injectable({
  providedIn: 'root'
})
export class StreakService {
  private readonly STORAGE_KEY = 'focusforge_streak_data';
  private telemetry = signal<StreakData>(this.loadInitialData());

  streakData = this.telemetry.asReadonly();

  getStreakData(): StreakData {
    return this.telemetry();
  }

  recordSession(durationMinutes: number, cycleNumber: number, timestamp: Date = new Date()): Badge[] {
    const current = this.telemetry();
    const dateStr = this.formatDate(timestamp);
    const hour = timestamp.getHours();
    const isNight = hour >= 23 || hour < 5;

    // Calculate streak
    let streak = current.currentStreak;
    if (!current.lastActiveDate) {
      streak = 1;
    } else if (current.lastActiveDate === dateStr) {
      // Same day, keep current streak
      streak = Math.max(1, streak);
    } else {
      const lastDate = new Date(current.lastActiveDate);
      const currDate = new Date(dateStr);
      const diffTime = currDate.getTime() - lastDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

      if (diffDays === 1) {
        streak += 1;
      } else {
        streak = 1;
      }
    }

    const updatedTotalMinutes = current.totalMinutes + durationMinutes;
    const updatedSessions = current.completedSessions + 1;
    const updatedHistory = { ...current.history };
    updatedHistory[dateStr] = (updatedHistory[dateStr] || 0) + durationMinutes;

    // Check newly unlocked badges
    const newlyUnlocked: Badge[] = [];
    const updatedBadges = current.badges.map(b => {
      if (b.unlocked) return b;

      let shouldUnlock = false;
      if (b.id === 'first-spark' && updatedSessions >= 1) shouldUnlock = true;
      if (b.id === 'night-owl' && isNight) shouldUnlock = true;
      if (b.id === 'century' && updatedTotalMinutes >= 100) shouldUnlock = true;
      if (b.id === 'marathon' && cycleNumber >= 4) shouldUnlock = true;
      if (b.id === 'zen-master' && updatedSessions >= 10) shouldUnlock = true;

      if (shouldUnlock) {
        const unlockedBadge: Badge = {
          ...b,
          unlocked: true,
          unlockedAt: timestamp.toISOString()
        };
        newlyUnlocked.push(unlockedBadge);
        return unlockedBadge;
      }
      return b;
    });

    const nextData: StreakData = {
      totalMinutes: updatedTotalMinutes,
      completedSessions: updatedSessions,
      currentStreak: streak,
      lastActiveDate: dateStr,
      history: updatedHistory,
      badges: updatedBadges
    };

    this.saveData(nextData);
    this.telemetry.set(nextData);
    return newlyUnlocked;
  }

  resetData(): void {
    const defaultData = this.getDefaultData();
    this.saveData(defaultData);
    this.telemetry.set(defaultData);
  }

  private loadInitialData(): StreakData {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed.totalMinutes === 'number') {
            // Merge with initial badges in case new badges were added
            const existingBadgesMap = new Map((parsed.badges || []).map((b: Badge) => [b.id, b]));
            const mergedBadges = INITIAL_BADGES.map(b => (existingBadgesMap.get(b.id) as Badge) || b);
            return {
              ...parsed,
              badges: mergedBadges
            };
          }
        }
      }
    } catch {
      // Corrupt data or private mode
    }
    return this.getDefaultData();
  }

  private getDefaultData(): StreakData {
    return {
      totalMinutes: 0,
      completedSessions: 0,
      currentStreak: 0,
      lastActiveDate: '',
      history: {},
      badges: INITIAL_BADGES.map(b => ({ ...b }))
    };
  }

  private saveData(data: StreakData): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      }
    } catch {
      // Ignored if storage is full or restricted
    }
  }

  private formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
