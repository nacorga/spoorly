import { EventData } from './event.types';
import { EventsQueue } from './queue.types';

/**
 * Generic callback function for event emitter subscriptions
 *
 * @template T - Type of data passed to the callback
 * @param data - Event data passed to the callback
 */
export type EmitterCallback<T = any> = (data: T) => void;

/**
 * Available event emitter channels for Spoorly
 *
 * **Purpose**: Type-safe event subscription system for local consumers
 *
 * **Event Channels**:
 * - `event`: Individual events as they are tracked (real-time)
 * - `queue`: Event batches once delivered: after a 2xx `fetch` response or an accepted `sendBeacon`
 *   call, and for batches recovered from storage. Standalone, on every flush (every 10s or 50 events)
 *
 * **Use Cases**:
 * - Real-time event processing
 * - Forwarding events to your own analytics pipeline
 * - Debugging and monitoring
 *
 * @example
 * ```typescript
 * // Subscribe to individual events
 * spoorly.on('event', (event) => {
 *   console.log('Event tracked:', event.type, event);
 * });
 *
 * // Subscribe to event batches
 * spoorly.on('queue', (batch) => {
 *   console.log('Batch sent:', batch.events.length, 'events');
 * });
 * ```
 */
export enum EmitterEvent {
  /** Individual events as they are tracked */
  EVENT = 'event',
  /** Event batches once delivered to the endpoint, or on every flush in standalone mode */
  QUEUE = 'queue',
}

/**
 * Type mapping for event emitter channels
 *
 * **Purpose**: Ensures type safety when subscribing to events
 *
 * Maps each EmitterEvent to its corresponding payload type:
 * - `event` → `EventData`: Single event data
 * - `queue` → `EventsQueue`: Batch of events with metadata
 */
export interface EmitterMap {
  [EmitterEvent.EVENT]: EventData;
  [EmitterEvent.QUEUE]: EventsQueue;
}
