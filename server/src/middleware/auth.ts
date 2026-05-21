import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import User from '../models/User';
import Trainer from '../models/Trainer';
import { ApiError } from '../utils/ApiError';

export interface AuthRequest extends Request {
  user?: any;
  userRole?: string;
}

export const protect = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Not authorized, no token');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; role: string };

    if (decoded.role === 'trainer') {
      const trainer = await Trainer.findById(decoded.id);
      if (!trainer) throw ApiError.unauthorized('Trainer not found');
      req.user = trainer;
      req.userRole = 'trainer';
    } else {
      const user = await User.findById(decoded.id);
      if (!user) throw ApiError.unauthorized('User not found');
      req.user = user;
      req.userRole = decoded.role;
    }

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Token expired'));
    }
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return next(ApiError.forbidden('Not authorized for this action'));
    }
    next();
  };
};
