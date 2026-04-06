import { Request, Response, NextFunction } from 'express';
import { ROLES } from '../utils/constants';

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
    return;
  }

  if (req.user.role !== ROLES.ADMIN) {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.',
    });
    return;
  }

  next();
};

export const responderMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
    return;
  }

  if (req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.RESPONDER) {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Responder role required.',
    });
    return;
  }

  next();
};
