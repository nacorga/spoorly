import { init, event, on, off, isInitialized, getSessionId, getUserId, destroy, identify, resetIdentity } from './api';

export { PII_PATTERNS } from './utils/security/pii.utils';
export { EventType, EmitterEvent } from './types';
export type {
  Config,
  WebVitalsMode,
  InitResult,
  EventOptions,
  MetadataType,
  EventData,
  ClickData,
  ScrollData,
  CustomEventData,
  PageViewData,
  ErrorData,
  WebVitalsConsolidatedData,
  WebVitalMetric,
  UTM,
  ClickIds,
  EventsQueue,
  IdentifyData,
  DeviceInfo,
  EmitterMap,
  EmitterCallback,
} from './types';

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
