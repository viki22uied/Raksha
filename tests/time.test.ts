import { getDayRange, getLastNDaysRange, timeDiffMinutes, isWithinLastMinutes, formatDuration } from '../src/utils/time';

describe('Time Utilities', () => {
  describe('getDayRange', () => {
    it('should return start and end of day', () => {
      const { start, end } = getDayRange(new Date('2024-06-15T12:30:00Z'));
      expect(start.getUTCHours()).toBe(0);
      expect(end.getUTCHours()).toBe(23);
    });
  });

  describe('getLastNDaysRange', () => {
    it('should return correct range', () => {
      const { start, end } = getLastNDaysRange(7);
      const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      expect(diff).toBeGreaterThanOrEqual(7);
    });
  });

  describe('timeDiffMinutes', () => {
    it('should calculate difference in minutes', () => {
      const d1 = new Date('2024-01-01T00:00:00Z');
      const d2 = new Date('2024-01-01T00:30:00Z');
      expect(timeDiffMinutes(d1, d2)).toBe(30);
    });
  });

  describe('isWithinLastMinutes', () => {
    it('should return true for recent date', () => {
      expect(isWithinLastMinutes(new Date(), 5)).toBe(true);
    });

    it('should return false for old date', () => {
      const old = new Date(Date.now() - 60 * 60 * 1000);
      expect(isWithinLastMinutes(old, 5)).toBe(false);
    });
  });

  describe('formatDuration', () => {
    it('should format seconds', () => {
      expect(formatDuration(45)).toBe('45s');
    });

    it('should format minutes and seconds', () => {
      expect(formatDuration(125)).toBe('2m 5s');
    });

    it('should format hours', () => {
      expect(formatDuration(3665)).toBe('1h 1m 5s');
    });
  });
});
