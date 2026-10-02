/**
 * Storage key management constants
 * All keys are prefixed with 'spoorly' to avoid conflicts
 */

/**
 * Base key prefix for all spoorly localStorage items
 * Used as namespace to prevent conflicts with other libraries
 */
export const STORAGE_BASE_KEY = 'spoorly';

/** Namespace segment shared by every per-instance storage key and the cross-tab channel. */
export const STORAGE_NAMESPACE = 'custom';

/**
 * Storage key for QA mode flag in sessionStorage
 * Format: 'spoorly:qa_mode'
 */
export const QA_MODE_KEY = `${STORAGE_BASE_KEY}:qa_mode`;

/**
 * Storage key for user ID in localStorage
 * Format: 'spoorly:uid'
 */
export const USER_ID_KEY = `${STORAGE_BASE_KEY}:uid`;

/**
 * URL parameter name for activating/deactivating QA mode
 * Example: ?spoorly_mode=qa or ?spoorly_mode=qa_off
 */
export const QA_MODE_URL_PARAM = 'spoorly_mode';

/**
 * URL parameter value to enable QA mode
 */
export const QA_MODE_ENABLE_VALUE = 'qa';

/**
 * URL parameter value to disable QA mode
 */
export const QA_MODE_DISABLE_VALUE = 'qa_off';

/**
 * Generates storage key for event queue
 *
 * @param id - User ID
 * @returns localStorage key for event queue (e.g., 'spoorly:user123:queue')
 */
export const QUEUE_KEY = (id: string): string => (id ? `${STORAGE_BASE_KEY}:${id}:queue` : `${STORAGE_BASE_KEY}:queue`);

/**
 * Generates storage key for per-sender rate-limit cooldown timestamp.
 *
 * Persisted in `localStorage` so the cooldown survives both page navigations
 * and is visible to other tabs/windows on the same origin. Without this, each
 * fresh `SenderManager` starts with a zeroed backoff and would continue
 * hammering the endpoint through its 429 window.
 *
 * @param id - User ID
 * @returns localStorage key (e.g., 'spoorly:user123:rate_limit')
 */
export const RATE_LIMIT_KEY = (id: string): string =>
  id ? `${STORAGE_BASE_KEY}:${id}:rate_limit` : `${STORAGE_BASE_KEY}:rate_limit`;

/**
 * Generates storage key for session data
 *
 * @param id - Storage namespace
 * @returns localStorage key for session (e.g., 'spoorly:custom:session')
 */
export const SESSION_STORAGE_KEY = (id: string): string =>
  id ? `${STORAGE_BASE_KEY}:${id}:session` : `${STORAGE_BASE_KEY}:session`;

/**
 * Generates BroadcastChannel name for cross-tab communication
 *
 * @param id - Storage namespace
 * @returns BroadcastChannel name (e.g., 'spoorly:custom:broadcast')
 */
export const BROADCAST_CHANNEL_NAME = (id: string): string =>
  id ? `${STORAGE_BASE_KEY}:${id}:broadcast` : `${STORAGE_BASE_KEY}:broadcast`;

/**
 * Generates storage key for per-session event counts
 *
 * Used to persist rate limiting counters across page reloads within the same session.
 * This prevents users from bypassing per-session event limits by refreshing the page.
 *
 * @param userId - User identifier
 * @param sessionId - Session identifier
 * @returns localStorage key for session counts (e.g., 'spoorly:user123:session_counts:session456')
 */
export const SESSION_COUNTS_KEY = (userId: string, sessionId: string): string =>
  `${STORAGE_BASE_KEY}:${userId}:session_counts:${sessionId}`;

/**
 * Session counts expiry duration (7 days in milliseconds).
 *
 * Session counts are automatically cleaned up after this duration to prevent
 * localStorage pollution. Counts older than 7 days are considered stale and
 * are removed on next page load.
 *
 * **Rationale**: 7 days provides sufficient buffer for:
 * - Long-running sessions (rare but possible)
 * - Users returning after extended inactivity
 * - While preventing indefinite accumulation (~100 bytes per session)
 */
export const SESSION_COUNTS_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Storage key for tracking last session counts cleanup timestamp.
 *
 * Used to throttle cleanup operations and prevent performance impact
 * from scanning localStorage on every EventManager initialization.
 *
 * Format: 'spoorly:session_counts_last_cleanup'
 */
export const SESSION_COUNTS_LAST_CLEANUP_KEY = `${STORAGE_BASE_KEY}:session_counts_last_cleanup`;

/**
 * Minimum interval between session counts cleanup runs (1 hour in milliseconds).
 *
 * Cleanup will only run if at least this much time has elapsed since the
 * last cleanup. This prevents performance degradation from frequent localStorage
 * scans while still ensuring regular cleanup of stale data.
 *
 * **Rationale**: 1 hour provides a good balance between:
 * - Preventing frequent scans on rapid page reloads
 * - Ensuring cleanup runs at least once per typical browsing session
 * - Minimal localStorage overhead (~100 entries typical, <1ms scan time)
 */
export const SESSION_COUNTS_CLEANUP_THROTTLE_MS = 60 * 60 * 1000; // 1 hour

// ============================================================
// Identity Storage Keys
// ============================================================

/**
 * Generates storage key for visitor identity data.
 *
 * @param namespace - Storage namespace
 * @returns localStorage key for identity (e.g., 'spoorly:custom:identity')
 */
export const IDENTITY_KEY = (namespace: string): string =>
  namespace ? `${STORAGE_BASE_KEY}:${namespace}:identity` : `${STORAGE_BASE_KEY}:identity`;

/**
 * Temporary storage key for identity set before init().
 *
 * When identify() is called before init(), identity is stored under this key
 * and moved to the namespaced key once init() runs.
 */
export const PENDING_IDENTITY_KEY = `${STORAGE_BASE_KEY}:pending_identity`;
