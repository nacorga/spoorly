import { init, event, on, off, isInitialized, getSessionId, getUserId, destroy, identify, resetIdentity } from './api';

// Constants
export * from './app.constants';

// Types
export * from './types';

// Spoorly namespace containing all API methods
export const spoorly = {
  init,
  event,
  on,
  off,
  isInitialized,
  getSessionId,
  getUserId,
  destroy,
  identify,
  resetIdentity,
};
