// utils/catchAsync.ts

import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an asynchronous route handler and passes errors to the next middleware.
 *
 * @param {RequestHandler} fn - The asynchronous route handler.
 * @returns {RequestHandler} A new route handler that automatically catches errors.
 */
export const catchAsync = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};

