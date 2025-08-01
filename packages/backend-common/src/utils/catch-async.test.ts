import { Request, Response, NextFunction } from 'express';
import { catchAsync } from './catch-async';

describe('catchAsync', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('should call the wrapped function with req, res, and next', async () => {
    const fn = jest.fn().mockResolvedValue(undefined);
    const wrapped = catchAsync(fn);
    await wrapped(mockRequest as Request, mockResponse as Response, mockNext);
    expect(fn).toHaveBeenCalledWith(mockRequest, mockResponse, mockNext);
  });

  it('should call next with the error if the wrapped function rejects', async () => {
    const error = new Error('Something went wrong');
    const fn = jest.fn().mockRejectedValue(error);
    const wrapped = catchAsync(fn);
    await wrapped(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it('should not call next with an error if the wrapped function resolves', async () => {
    const fn = jest.fn().mockResolvedValue(undefined);
    const wrapped = catchAsync(fn);
    await wrapped(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
  });
});
