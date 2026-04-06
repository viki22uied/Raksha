import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

type RequestProperty = 'body' | 'query' | 'params';

/**
 * Creates a validation middleware for the specified request property.
 */
export const validate = (schema: Joi.ObjectSchema, property: RequestProperty = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
      }));

      res.status(400).json({
        success: false,
        message: 'Validation failed',
        data: null,
        meta: { errors },
      });
      return;
    }

    // Replace with validated & sanitized values
    req[property] = value;
    next();
  };
};

// ─── Common Validation Schemas ──────────────────────────────────────────────

export const schemas = {
  // Auth
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required(),
    name: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    role: Joi.string().valid('tourist', 'admin', 'responder').default('tourist'),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  // Tourist Profile
  updateProfile: Joi.object({
    nationality: Joi.string().min(2).max(50).optional(),
    passportNumber: Joi.string().max(20).optional(),
    dateOfBirth: Joi.date().optional(),
    gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').optional(),
    bloodGroup: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').optional(),
    medicalNotes: Joi.string().max(1000).optional(),
    allergies: Joi.array().items(Joi.string().max(100)).optional(),
    emergencyContacts: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          phone: Joi.string().required(),
          relationship: Joi.string().required(),
          email: Joi.string().email().optional(),
        })
      )
      .optional(),
    travelStartDate: Joi.date().optional(),
    travelEndDate: Joi.date().optional(),
    accommodation: Joi.string().max(200).optional(),
    deviceInfo: Joi.object({
      platform: Joi.string().optional(),
      model: Joi.string().optional(),
      osVersion: Joi.string().optional(),
      appVersion: Joi.string().optional(),
    }).optional(),
  }),

  // Location Ping
  locationPing: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
    altitude: Joi.number().optional(),
    speed: Joi.number().min(0).optional(),
    heading: Joi.number().min(0).max(360).optional(),
    accuracy: Joi.number().optional(),
    battery: Joi.number().min(0).max(100).optional(),
    accelerometer: Joi.object({
      x: Joi.number().required(),
      y: Joi.number().required(),
      z: Joi.number().required(),
    }).optional(),
    timestamp: Joi.date().default(() => new Date()),
  }),

  locationBatch: Joi.object({
    pings: Joi.array()
      .items(
        Joi.object({
          lat: Joi.number().min(-90).max(90).required(),
          lng: Joi.number().min(-180).max(180).required(),
          altitude: Joi.number().optional(),
          speed: Joi.number().min(0).optional(),
          heading: Joi.number().min(0).max(360).optional(),
          accuracy: Joi.number().optional(),
          battery: Joi.number().min(0).max(100).optional(),
          accelerometer: Joi.object({
            x: Joi.number().required(),
            y: Joi.number().required(),
            z: Joi.number().required(),
          }).optional(),
          timestamp: Joi.date().default(() => new Date()),
        })
      )
      .min(1)
      .max(100)
      .required(),
  }),

  // GeoFence
  createGeoFence: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).optional(),
    polygon: Joi.array()
      .items(
        Joi.object({
          lat: Joi.number().min(-90).max(90).required(),
          lng: Joi.number().min(-180).max(180).required(),
        })
      )
      .min(3)
      .required(),
    riskLevel: Joi.string().valid('safe', 'caution', 'danger', 'restricted').default('safe'),
    maxCapacity: Joi.number().min(1).optional(),
    watchPriority: Joi.number().min(0).max(10).default(0),
    metadata: Joi.object().optional(),
  }),

  updateGeoFence: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().max(500).optional(),
    polygon: Joi.array()
      .items(
        Joi.object({
          lat: Joi.number().min(-90).max(90).required(),
          lng: Joi.number().min(-180).max(180).required(),
        })
      )
      .min(3)
      .optional(),
    riskLevel: Joi.string().valid('safe', 'caution', 'danger', 'restricted').optional(),
    isActive: Joi.boolean().optional(),
    maxCapacity: Joi.number().min(1).optional(),
    watchPriority: Joi.number().min(0).max(10).optional(),
    metadata: Joi.object().optional(),
  }),

  checkGeoFence: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
    touristId: Joi.string().optional(),
  }),

  // SOS
  triggerSos: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
    altitude: Joi.number().optional(),
    accuracy: Joi.number().optional(),
    message: Joi.string().max(500).optional(),
    battery: Joi.number().min(0).max(100).optional(),
  }),

  // Alert
  assignAlert: Joi.object({
    responderId: Joi.string().required(),
    eta: Joi.number().min(0).optional(),
  }),

  resolveAlert: Joi.object({
    notes: Joi.string().max(1000).optional(),
  }),

  // Identity
  createIdentity: Joi.object({
    touristId: Joi.string().required(),
    documentType: Joi.string().valid('passport', 'national_id', 'driving_license', 'visa', 'other').required(),
  }),

  // Admin
  assignResponder: Joi.object({
    alertId: Joi.string().required(),
    responderId: Joi.string().required(),
    eta: Joi.number().min(0).optional(),
  }),

  // Pagination
  pagination: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  // Object ID param
  objectId: Joi.object({
    id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({ 'string.pattern.base': 'Invalid ID format' }),
  }),

  touristIdParam: Joi.object({
    touristId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({ 'string.pattern.base': 'Invalid tourist ID format' }),
  }),
};
