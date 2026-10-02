import { SpoorlyTestBridge } from './test-bridge.types';

declare global {
  interface Window {
    /**
     * Flag to disable Spoorly initialization
     * Set to true to prevent the library from running
     */
    __spoorlyDisabled?: boolean;
    /**
     * Testing bridge for E2E tests
     * Only available when NODE_ENV=development
     */
    __spoorlyBridge?: SpoorlyTestBridge;
  }
}
