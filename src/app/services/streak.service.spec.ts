import { describe, it, expect, beforeEach } from 'vitest';
import { StreakService } from './streak.service';

describe('StreakService (TDD Specification)', () => {
  let service: StreakService;

  beforeEach(() => {
    localStorage.clear();
    service = new StreakService();
  });

  describe('HF-006: Telemetry Accumulation and Badge Unlocking', () => {
    it('should initialize with default zeroed telemetry and locked badges', () => {
      const data = service.getStreakData();
      expect(data.totalMinutes).toBe(0);
      expect(data.completedSessions).toBe(0);
      expect(data.currentStreak).toBe(0);
      expect(data.badges.every(b => !b.unlocked)).toBe(true);
    });

    it('should accumulate focus minutes and unlock first spark badge on first session', () => {
      const daytimeDate = new Date('2026-06-15T14:00:00Z');
      const newlyUnlocked = service.recordSession(25, 1, daytimeDate);

      const data = service.getStreakData();
      expect(data.totalMinutes).toBe(25);
      expect(data.completedSessions).toBe(1);
      expect(data.currentStreak).toBe(1);

      expect(newlyUnlocked.some(b => b.id === 'first-spark')).toBe(true);
      const sparkBadge = data.badges.find(b => b.id === 'first-spark');
      expect(sparkBadge?.unlocked).toBe(true);
    });

    it('should unlock night-owl badge when session finishes between 11 PM and 5 AM', () => {
      const lateNightDate = new Date('2026-06-15T02:30:00'); // 2:30 AM local
      const newlyUnlocked = service.recordSession(25, 1, lateNightDate);

      expect(newlyUnlocked.some(b => b.id === 'night-owl')).toBe(true);
    });

    it('should unlock century club badge upon reaching 100 focus minutes', () => {
      const now = new Date('2026-06-15T10:00:00Z');
      service.recordSession(50, 1, now);
      service.recordSession(40, 2, now);
      const newlyUnlocked = service.recordSession(15, 3, now); // Total = 105 min

      expect(newlyUnlocked.some(b => b.id === 'century')).toBe(true);
    });

    it('should unlock marathon badge when cycle 4 is recorded', () => {
      const now = new Date('2026-06-15T10:00:00Z');
      const newlyUnlocked = service.recordSession(25, 4, now); // cycle 4
      expect(newlyUnlocked.some(b => b.id === 'marathon')).toBe(true);
    });
  });

  describe('Streak Calculation Across Days (EC-004)', () => {
    it('should maintain streak if multiple sessions occur on the same day', () => {
      const day1 = new Date('2026-06-15T10:00:00');
      service.recordSession(25, 1, day1);
      expect(service.getStreakData().currentStreak).toBe(1);

      service.recordSession(25, 2, day1);
      expect(service.getStreakData().currentStreak).toBe(1);
    });

    it('should increment streak if session occurs on consecutive day', () => {
      const day1 = new Date('2026-06-15T10:00:00');
      const day2 = new Date('2026-06-16T11:00:00');

      service.recordSession(25, 1, day1);
      expect(service.getStreakData().currentStreak).toBe(1);

      service.recordSession(25, 2, day2);
      expect(service.getStreakData().currentStreak).toBe(2);
    });

    it('should reset streak to 1 if more than 1 day has elapsed', () => {
      const day1 = new Date('2026-06-10T10:00:00');
      const day4 = new Date('2026-06-14T10:00:00');

      service.recordSession(25, 1, day1);
      expect(service.getStreakData().currentStreak).toBe(1);

      service.recordSession(25, 2, day4);
      expect(service.getStreakData().currentStreak).toBe(1);
    });
  });

  describe('NF-004: Corrupted LocalStorage Handling', () => {
    it('should safely fall back to default telemetry if localStorage contains corrupted JSON', () => {
      localStorage.setItem('focusforge_streak_data', 'INVALID_JSON_CORRUPTED{{{');
      const safeService = new StreakService();

      const data = safeService.getStreakData();
      expect(data.totalMinutes).toBe(0);
      expect(data.completedSessions).toBe(0);
    });
  });
});
