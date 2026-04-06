import { ISequencePoint } from '../models/Anomaly';
import { ANOMALY_TYPE } from '../utils/constants';
import { logger } from '../utils/logger';

export interface LSTMPrediction {
  score: number;
  label: string;
  reason: string;
  confidence: number;
}

/**
 * LSTM Inference Service.
 *
 * Currently uses a stubbed heuristic-based implementation.
 * Interface is ready for TensorFlow.js or external ML model integration.
 *
 * To integrate a real LSTM model:
 * 1. Load a trained TensorFlow.js model in the constructor
 * 2. Normalize the sequence input
 * 3. Run inference using tf.model.predict()
 * 4. Map output tensor to LSTMPrediction
 */
class LSTMService {
  private modelLoaded = false;

  constructor() {
    this.initModel();
  }

  /**
   * Initialize the ML model (stubbed for now).
   */
  private async initModel(): Promise<void> {
    try {
      // Placeholder for TensorFlow.js model loading:
      // const tf = require('@tensorflow/tfjs-node');
      // this.model = await tf.loadLayersModel('file://./models/anomaly-lstm/model.json');

      this.modelLoaded = false; // Set to true when real model is loaded
      logger.info('LSTM service initialized (using heuristic fallback)');
    } catch (error) {
      logger.warn('LSTM model not available, using heuristic fallback');
      this.modelLoaded = false;
    }
  }

  /**
   * Run sequence prediction.
   */
  async predictSequence(sequence: ISequencePoint[]): Promise<LSTMPrediction> {
    if (this.modelLoaded) {
      return this.runModelInference(sequence);
    }
    return this.runHeuristicInference(sequence);
  }

  /**
   * Real model inference (placeholder for TensorFlow.js integration).
   */
  private async runModelInference(sequence: ISequencePoint[]): Promise<LSTMPrediction> {
    // Placeholder for real TensorFlow.js inference:
    //
    // const tf = require('@tensorflow/tfjs-node');
    // const normalized = this.normalizeSequence(sequence);
    // const inputTensor = tf.tensor3d([normalized], [1, sequence.length, 5]);
    // const prediction = this.model.predict(inputTensor);
    // const values = await prediction.data();
    //
    // return {
    //   score: values[0],
    //   label: this.getLabel(values),
    //   reason: this.getReason(values),
    //   confidence: values[1],
    // };

    return this.runHeuristicInference(sequence);
  }

  /**
   * Heuristic-based inference as a fallback for real LSTM model.
   */
  private async runHeuristicInference(sequence: ISequencePoint[]): Promise<LSTMPrediction> {
    if (sequence.length < 3) {
      return { score: 0, label: 'normal', reason: 'Insufficient data', confidence: 0 };
    }

    let anomalyScore = 0;
    let label = 'normal';
    let reason = 'Normal behavior pattern';

    // Feature extraction
    const speeds = sequence.map((s) => s.speed);
    const accels = sequence.map((s) => s.accelerationMagnitude);
    const timeDeltas = sequence.map((s) => s.timeDelta);

    // Speed variance
    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const speedVariance =
      speeds.reduce((sum, s) => sum + (s - avgSpeed) ** 2, 0) / speeds.length;
    const speedStdDev = Math.sqrt(speedVariance);

    // Acceleration variance
    const avgAccel = accels.reduce((a, b) => a + b, 0) / accels.length;
    const accelVariance =
      accels.reduce((sum, a) => sum + (a - avgAccel) ** 2, 0) / accels.length;

    // Time gap analysis  
    const maxTimeDelta = Math.max(...timeDeltas);
    const avgTimeDelta = timeDeltas.reduce((a, b) => a + b, 0) / timeDeltas.length;

    // Scoring heuristics
    // High speed variance suggests erratic movement
    if (speedStdDev > 30) {
      anomalyScore = Math.max(anomalyScore, Math.min(1, speedStdDev / 80));
      label = ANOMALY_TYPE.ERRATIC_MOVEMENT;
      reason = `High speed variability (σ=${speedStdDev.toFixed(1)} km/h)`;
    }

    // High acceleration variance suggests sudden movements
    if (accelVariance > 50) {
      const score = Math.min(1, accelVariance / 150);
      if (score > anomalyScore) {
        anomalyScore = score;
        label = ANOMALY_TYPE.SUDDEN_STOP;
        reason = `High acceleration variance (${accelVariance.toFixed(1)})`;
      }
    }

    // Zero speed for extended period
    const zeroSpeedCount = speeds.filter((s) => s < 1).length;
    if (zeroSpeedCount > sequence.length * 0.8 && avgTimeDelta > 60) {
      const score = Math.min(1, (zeroSpeedCount / sequence.length) * (avgTimeDelta / 300));
      if (score > anomalyScore) {
        anomalyScore = score;
        label = ANOMALY_TYPE.PROLONGED_STATIONARY;
        reason = `Stationary for ${Math.round(avgTimeDelta * sequence.length / 60)} minutes`;
      }
    }

    // Large time gaps could indicate signal loss
    if (maxTimeDelta > 600) {
      const score = Math.min(1, maxTimeDelta / 1800);
      if (score > anomalyScore) {
        anomalyScore = score;
        label = ANOMALY_TYPE.ROUTE_DRIFT;
        reason = `Signal gap of ${Math.round(maxTimeDelta / 60)} minutes`;
      }
    }

    return {
      score: anomalyScore,
      label,
      reason,
      confidence: this.modelLoaded ? 0.85 : 0.6,
    };
  }

  /**
   * Check if model is loaded.
   */
  isModelReady(): boolean {
    return this.modelLoaded;
  }
}

export const lstmService = new LSTMService();
