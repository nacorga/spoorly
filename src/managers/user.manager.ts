import { USER_ID_KEY } from '../constants';
import { generateUUID } from '../utils';
import { StorageManager } from './storage.manager';

/**
 * Simple utility for managing unique user identification for analytics tracking.
 *
 * **Purpose**: Creates and persists RFC4122-compliant UUID v4 identifiers
 * for tracking users across browser sessions.
 *
 * **Core Functionality**:
 * - **User ID Generation**: Creates UUID v4 identifiers
 * - **Persistence**: Stores user IDs in localStorage with automatic fallback
 * - **Session Continuity**: Reuses existing user IDs across browser sessions
 * - **Global User Identity**: Single user ID per origin, shared by every spoorly instance
 *
 * **Key Features**:
 * - Static utility method pattern (no object instantiation required)
 * - UUID v4 generation for globally unique identifiers
 * - Fixed storage key (`spoorly:uid`) for consistent identification
 * - Automatic fallback to memory storage when localStorage unavailable
 * - Minimal dependencies and zero allocation approach
 *
 * **Storage**: `spoorly:uid`
 *
 * @example
 * ```typescript
 * const userId = UserManager.getId(storageManager);
 * // Returns: '550e8400-e29b-41d4-a716-446655440000' (UUID v4)
 *
 * // Subsequent calls return the same ID
 * const sameUserId = UserManager.getId(storageManager);
 * // Returns: '550e8400-e29b-41d4-a716-446655440000' (persisted)
 * ```
 */
export class UserManager {
  /**
   * Gets or creates a unique user ID.
   *
   * **Behavior**:
   * 1. Checks localStorage for existing user ID
   * 2. Returns existing ID if found
   * 3. Generates new RFC4122-compliant UUID v4 if not found
   * 4. Persists new ID to localStorage
   *
   * **Storage Key**: `spoorly:uid` (fixed, shared by every spoorly instance on the origin)
   *
   * **ID Format**: UUID v4 (e.g., `550e8400-e29b-41d4-a716-446655440000`)
   *
   * @param storageManager - Storage manager instance for persistence
   * @returns Persistent unique user ID (UUID v4 format)
   */
  static getId(storageManager: StorageManager): string {
    const storedUserId = storageManager.getItem(USER_ID_KEY);

    if (storedUserId) {
      return storedUserId;
    }

    const newUserId = generateUUID();
    storageManager.setItem(USER_ID_KEY, newUserId);

    return newUserId;
  }
}
