import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ApiResponse } from '../utils/ApiResponse';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    const messages = errors.array().map((e) => e.msg).join(', ');
    return ApiResponse.error(res, 400, messages);
  };
};
