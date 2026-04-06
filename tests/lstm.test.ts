import { lstmService } from '../src/services/lstm.service';
import { ISequencePoint } from '../src/models/Anomaly';

describe('LSTM Service', () => {
  it('should return low score for insufficient data', async () => {
    const result = await lstmService.predictSequence([]);
    expect(result.score).toBe(0);
  });

  it('should return a prediction for normal sequence', async () => {
    const sequence: ISequencePoint[] = Array.from({ length: 10 }, (_, i) => ({
      lat: 19.076 + i * 0.0001,
      lng: 72.877 + i * 0.0001,
      speed: 5,
      timeDelta: 60,
      accelerationMagnitude: 9.8,
    }));

    const result = await lstmService.predictSequence(sequence);
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('label');
    expect(result).toHaveProperty('reason');
    expect(result).toHaveProperty('confidence');
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
  });

  it('should detect high speed variance as erratic', async () => {
    const sequence: ISequencePoint[] = Array.from({ length: 10 }, (_, i) => ({
      lat: 19.076, lng: 72.877,
      speed: i % 2 === 0 ? 100 : 0,
      timeDelta: 30,
      accelerationMagnitude: i % 2 === 0 ? 20 : 1,
    }));

    const result = await lstmService.predictSequence(sequence);
    expect(result.score).toBeGreaterThan(0);
  });

  it('should report model not ready', () => {
    expect(lstmService.isModelReady()).toBe(false);
  });
});
