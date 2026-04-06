import { isPointInPolygon, haversineDistance, calculateBearing, calculateSpeed } from '../src/utils/geo';
import { Coordinate } from '../src/utils/geo';

describe('Geo Utilities', () => {
  describe('haversineDistance', () => {
    it('should return 0 for same point', () => {
      const p = { lat: 19.076, lng: 72.877 };
      expect(haversineDistance(p, p)).toBe(0);
    });

    it('should calculate distance between two points', () => {
      const p1 = { lat: 19.076, lng: 72.877 };
      const p2 = { lat: 19.086, lng: 72.887 };
      const dist = haversineDistance(p1, p2);
      expect(dist).toBeGreaterThan(1000);
      expect(dist).toBeLessThan(2000);
    });
  });

  describe('isPointInPolygon', () => {
    const polygon: Coordinate[] = [
      { lat: 0, lng: 0 }, { lat: 0, lng: 10 },
      { lat: 10, lng: 10 }, { lat: 10, lng: 0 },
    ];

    it('should return true for a point inside', () => {
      expect(isPointInPolygon({ lat: 5, lng: 5 }, polygon)).toBe(true);
    });

    it('should return false for a point outside', () => {
      expect(isPointInPolygon({ lat: 15, lng: 15 }, polygon)).toBe(false);
    });
  });

  describe('calculateBearing', () => {
    it('should return roughly 0 for due north', () => {
      const bearing = calculateBearing({ lat: 0, lng: 0 }, { lat: 1, lng: 0 });
      expect(bearing).toBeCloseTo(0, 0);
    });
  });

  describe('calculateSpeed', () => {
    it('should return 0 for same timestamps', () => {
      const t = new Date();
      expect(calculateSpeed({ lat: 0, lng: 0 }, t, { lat: 1, lng: 1 }, t)).toBe(0);
    });

    it('should calculate positive speed', () => {
      const t1 = new Date('2024-01-01T00:00:00Z');
      const t2 = new Date('2024-01-01T01:00:00Z');
      const speed = calculateSpeed({ lat: 0, lng: 0 }, t1, { lat: 0.1, lng: 0.1 }, t2);
      expect(speed).toBeGreaterThan(0);
    });
  });
});
