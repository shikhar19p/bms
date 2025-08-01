
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { HttpError } from '../error/base';


export const validate =
    (schema: AnyZodObject) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                }));
                return next(new HttpError(400, 'Validation failed', { details: errorMessages }));
            }
            return next(new HttpError(500, 'Internal server error during validation'));
        }
    };
