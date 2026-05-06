/**
 * Error Handler Tests
 */

import { AppError, ErrorTypes, handleNetworkError, retryOperation } from '../errorHandler';

describe('Error Handler', () => {
  describe('AppError', () => {
    it('should create error with correct properties', () => {
      const error = new AppError(
        ErrorTypes.VALIDATION,
        'Invalid input',
        { field: 'email' },
        true
      );

      expect(error.type).toBe(ErrorTypes.VALIDATION);
      expect(error.message).toBe('Invalid input');
      expect(error.details).toEqual({ field: 'email' });
      expect(error.recoverable).toBe(true);
      expect(error.timestamp).toBeTruthy();
    });
  });

  describe('handleNetworkError', () => {
    it('should handle ENOTFOUND error', () => {
      const networkError = new Error('Network error');
      networkError.code = 'ENOTFOUND';

      const appError = handleNetworkError(networkError);

      expect(appError.type).toBe(ErrorTypes.NETWORK);
      expect(appError.message).toContain('Network connection failed');
      expect(appError.recoverable).toBe(true);
    });

    it('should handle ETIMEDOUT error', () => {
      const networkError = new Error('Timeout');
      networkError.code = 'ETIMEDOUT';

      const appError = handleNetworkError(networkError);

      expect(appError.type).toBe(ErrorTypes.NETWORK);
      expect(appError.message).toContain('Request timed out');
      expect(appError.recoverable).toBe(true);
    });

    it('should handle unknown errors', () => {
      const unknownError = new Error('Something went wrong');

      const appError = handleNetworkError(unknownError);

      expect(appError.type).toBe(ErrorTypes.UNKNOWN);
      expect(appError.message).toBe('Something went wrong');
    });
  });

  describe('retryOperation', () => {
    it('should succeed on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await retryOperation(operation, { maxRetries: 3 });

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success');

      const result = await retryOperation(operation, { 
        maxRetries: 3,
        initialDelay: 10,
      });

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Always fails'));

      await expect(
        retryOperation(operation, { 
          maxRetries: 3,
          initialDelay: 10,
        })
      ).rejects.toThrow('Always fails');

      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should not retry non-recoverable errors', async () => {
      const nonRecoverableError = new AppError(
        ErrorTypes.AUTHENTICATION,
        'Unauthorized',
        null,
        false
      );
      const operation = jest.fn().mockRejectedValue(nonRecoverableError);

      await expect(
        retryOperation(operation, { maxRetries: 3 })
      ).rejects.toThrow('Unauthorized');

      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should call onRetry callback', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValue('success');
      
      const onRetry = jest.fn();

      await retryOperation(operation, { 
        maxRetries: 3,
        initialDelay: 10,
        onRetry,
      });

      expect(onRetry).toHaveBeenCalledWith(1, 3, 10);
    });
  });
});
