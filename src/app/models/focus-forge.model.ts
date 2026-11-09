export type TimerMode = 'work' | 'shortBreak' | 'longBreak';
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface TimerPreset {
  name: string;
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  cyclesBeforeLongBreak: number;
}

export interface SessionCompletionEvent {
  mode: TimerMode;
  durationMinutes: number;
  timestamp: string; // ISO
  cycleNumber: number;
}

export type SoundChannelId = 'rain' | 'fire' | 'wind' | 'binaural';

export interface SoundChannel {
  id: SoundChannelId;
  name: string;
  icon: string;
  volume: number; // 0.0 - 1.0
  enabled: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface StreakData {
  totalMinutes: number;
  completedSessions: number;
  currentStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  history: Record<string, number>; // YYYY-MM-DD -> minutes
  badges: Badge[];
}
