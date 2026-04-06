import { schemas } from '../src/middlewares/validate.middleware';

describe('Validation Schemas', () => {
  describe('register schema', () => {
    it('should accept valid registration', () => {
      const { error } = schemas.register.validate({
        email: 'test@example.com', password: 'securepassword123', name: 'Test User',
      });
      expect(error).toBeUndefined();
    });

    it('should reject missing email', () => {
      const { error } = schemas.register.validate({ password: 'pass1234', name: 'Test' });
      expect(error).toBeDefined();
    });

    it('should reject short password', () => {
      const { error } = schemas.register.validate({
        email: 'test@example.com', password: 'short', name: 'Test',
      });
      expect(error).toBeDefined();
    });
  });

  describe('locationPing schema', () => {
    it('should accept valid ping', () => {
      const { error } = schemas.locationPing.validate({ lat: 19.076, lng: 72.877 });
      expect(error).toBeUndefined();
    });

    it('should reject invalid latitude', () => {
      const { error } = schemas.locationPing.validate({ lat: 95, lng: 72 });
      expect(error).toBeDefined();
    });

    it('should accept ping with accelerometer', () => {
      const { error } = schemas.locationPing.validate({
        lat: 19.076, lng: 72.877, speed: 5, battery: 80,
        accelerometer: { x: 0.1, y: -0.2, z: 9.8 },
      });
      expect(error).toBeUndefined();
    });
  });

  describe('createGeoFence schema', () => {
    it('should accept valid geofence', () => {
      const { error } = schemas.createGeoFence.validate({
        name: 'Test Zone',
        polygon: [{ lat: 0, lng: 0 }, { lat: 1, lng: 0 }, { lat: 1, lng: 1 }],
      });
      expect(error).toBeUndefined();
    });

    it('should reject polygon with less than 3 points', () => {
      const { error } = schemas.createGeoFence.validate({
        name: 'Bad Zone',
        polygon: [{ lat: 0, lng: 0 }, { lat: 1, lng: 0 }],
      });
      expect(error).toBeDefined();
    });
  });

  describe('triggerSos schema', () => {
    it('should accept valid SOS', () => {
      const { error } = schemas.triggerSos.validate({ lat: 19.076, lng: 72.877 });
      expect(error).toBeUndefined();
    });

    it('should accept SOS with message', () => {
      const { error } = schemas.triggerSos.validate({
        lat: 19.076, lng: 72.877, message: 'Help me!', battery: 15,
      });
      expect(error).toBeUndefined();
    });
  });
});
