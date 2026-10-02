/**
 * Custom error types for Spoorly
 */

/**
 * Represents a permanent HTTP error (4xx) that should not be retried
 * Examples: 400 Bad Request, 403 Forbidden, 404 Not Found
 */
export class PermanentError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'PermanentError';

    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PermanentError);
    }
  }
}

/**
 * Represents a rate limit error (429) that should not be retried in the
 * inner send loop. Events are persisted for periodic retry via EventManager
 * backoff. Receivers should deduplicate retried events by `event.id` or
 * `_metadata.idempotency_token`.
 */
export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RateLimitError);
    }
  }
}

/**
 * Represents a request that timed out before the endpoint answered. Retried
 * like any transient failure; once retries are exhausted the batch is
 * persisted for recovery, and the receiver deduplicates by event id.
 */
export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TimeoutError);
    }
  }
}
