import { Response } from 'express';

export class ApiResponse {
  static success<T>(res: Response, data: T, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({ success: true, message, data });
  }

  static created<T>(res: Response, data: T, message = 'Created successfully') {
    return res.status(201).json({ success: true, message, data });
  }

  static paginated<T>(res: Response, data: T[], total: number, page: number, limit: number, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }

  static error(res: Response, statusCode: number, message: string) {
    return res.status(statusCode).json({ success: false, message });
  }
}
