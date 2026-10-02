/**
 * Custom error classes for Spoorly validation errors
 * Provides better error handling and consistency across validation layers
 */

/**
 * Base class for all Spoorly validation errors
 */
export abstract class SpoorlyValidationError extends Error {
  constructor(
    message: string,
    public readonly errorCode: string,
    public readonly layer: 'config' | 'app' | 'runtime',
  ) {
    super(message);
    this.name = this.constructor.name;

    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Thrown when app configuration validation fails
 */
export class AppConfigValidationError extends SpoorlyValidationError {
  constructor(message: string, layer: 'config' | 'app' | 'runtime' = 'config') {
    super(message, 'APP_CONFIG_INVALID', layer);
  }
}

/**
 * Thrown when session timeout validation fails
 */
export class SessionTimeoutValidationError extends SpoorlyValidationError {
  constructor(message: string, layer: 'config' | 'app' | 'runtime' = 'config') {
    super(message, 'SESSION_TIMEOUT_INVALID', layer);
  }
}

/**
 * Thrown when sampling rate validation fails
 */
export class SamplingRateValidationError extends SpoorlyValidationError {
  constructor(message: string, layer: 'config' | 'app' | 'runtime' = 'config') {
    super(message, 'SAMPLING_RATE_INVALID', layer);
  }
}

/**
 * Thrown when initialization exceeds the maximum allowed timeout
 */
export class InitializationTimeoutError extends SpoorlyValidationError {
  constructor(
    message: string,
    public readonly timeoutMs: number,
    layer: 'config' | 'app' | 'runtime' = 'runtime',
  ) {
    super(message, 'INITIALIZATION_TIMEOUT', layer);
  }
}
