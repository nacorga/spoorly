import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  validateAppConfig,
  validateAndNormalizeConfig,
} from '../../../../src/utils/validations/config-validations.utils';
import { setupTestEnvironment, cleanupTestEnvironment } from '../../../helpers/setup.helper';
import {
  AppConfigValidationError,
  SessionTimeoutValidationError,
  SamplingRateValidationError,
} from '../../../../src/types';

describe('config-validations.utils', () => {
  beforeEach(() => {
    setupTestEnvironment();
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe('validateAppConfig', () => {
    describe('endpoint validation', () => {
      it('should accept an https endpoint', () => {
        expect(() => {
          validateAppConfig({ endpoint: 'https://api.example.com/collect' });
        }).not.toThrow();
      });

      it('should accept an http endpoint on localhost', () => {
        expect(() => {
          validateAppConfig({ endpoint: 'http://localhost:8787/collect' });
        }).not.toThrow();
      });

      it('should reject an http endpoint on a remote host', () => {
        expect(() => {
          validateAppConfig({ endpoint: 'http://api.example.com/collect' });
        }).toThrow(AppConfigValidationError);
      });

      it('should reject a non-string endpoint', () => {
        expect(() => {
          validateAppConfig({ endpoint: 42 as unknown as string });
        }).toThrow(AppConfigValidationError);
      });
    });

    describe('basic validation', () => {
      it('should accept undefined config', () => {
        expect(() => {
          validateAppConfig(undefined);
        }).not.toThrow();
      });

      it('should accept empty config object', () => {
        expect(() => {
          validateAppConfig({});
        }).not.toThrow();
      });

      it('should throw error for null config', () => {
        expect(() => {
          validateAppConfig(null as unknown as undefined);
        }).toThrow(AppConfigValidationError);
      });

      it('should throw error for non-object config', () => {
        expect(() => {
          validateAppConfig('invalid' as unknown as undefined);
        }).toThrow(AppConfigValidationError);
      });
    });

    describe('sessionTimeout validation', () => {
      it('should accept valid sessionTimeout', () => {
        expect(() => {
          validateAppConfig({ sessionTimeout: 600000 });
        }).not.toThrow();
      });

      it('should throw error for sessionTimeout below minimum', () => {
        expect(() => {
          validateAppConfig({ sessionTimeout: 1000 });
        }).toThrow(SessionTimeoutValidationError);
      });

      it('should throw error for sessionTimeout above maximum', () => {
        expect(() => {
          validateAppConfig({ sessionTimeout: 86400001 });
        }).toThrow(SessionTimeoutValidationError);
      });

      it('should throw error for non-number sessionTimeout', () => {
        expect(() => {
          validateAppConfig({ sessionTimeout: '600000' as unknown as number });
        }).toThrow(SessionTimeoutValidationError);
      });
    });

    describe('globalMetadata validation', () => {
      it('should accept valid globalMetadata object', () => {
        expect(() => {
          validateAppConfig({ globalMetadata: { key: 'value' } });
        }).not.toThrow();
      });

      it('should throw error for null globalMetadata', () => {
        expect(() => {
          validateAppConfig({ globalMetadata: null as any });
        }).toThrow(AppConfigValidationError);
      });

      it('should throw error for non-object globalMetadata', () => {
        expect(() => {
          validateAppConfig({ globalMetadata: 'invalid' as any });
        }).toThrow(AppConfigValidationError);
      });
    });

    describe('sensitiveQueryParams validation', () => {
      it('should accept valid string array', () => {
        expect(() => {
          validateAppConfig({ sensitiveQueryParams: ['token', 'api_key'] });
        }).not.toThrow();
      });

      it('should throw error for non-array value', () => {
        expect(() => {
          validateAppConfig({ sensitiveQueryParams: 'token' as unknown as string[] });
        }).toThrow(AppConfigValidationError);
      });

      it('should throw error for array with non-string values', () => {
        expect(() => {
          validateAppConfig({ sensitiveQueryParams: ['token', 123] as unknown as string[] });
        }).toThrow(AppConfigValidationError);
      });
    });

    describe('samplingRate validation', () => {
      it('should accept valid samplingRate', () => {
        expect(() => {
          validateAppConfig({ samplingRate: 0.5 });
        }).not.toThrow();
      });

      it('should throw error for samplingRate below 0', () => {
        expect(() => {
          validateAppConfig({ samplingRate: -0.1 });
        }).toThrow(SamplingRateValidationError);
      });

      it('should throw error for samplingRate above 1', () => {
        expect(() => {
          validateAppConfig({ samplingRate: 1.5 });
        }).toThrow(SamplingRateValidationError);
      });

      it('should throw error for non-number samplingRate', () => {
        expect(() => {
          validateAppConfig({ samplingRate: '0.5' as unknown as number });
        }).toThrow(SamplingRateValidationError);
      });
    });

    describe('errorSampling validation', () => {
      it('should accept valid errorSampling', () => {
        expect(() => {
          validateAppConfig({ errorSampling: 0.5 });
        }).not.toThrow();
      });

      it('should throw error for errorSampling below 0', () => {
        expect(() => {
          validateAppConfig({ errorSampling: -0.1 });
        }).toThrow(SamplingRateValidationError);
      });

      it('should throw error for errorSampling above 1', () => {
        expect(() => {
          validateAppConfig({ errorSampling: 1.5 });
        }).toThrow(SamplingRateValidationError);
      });

      it('should throw error for non-number errorSampling', () => {
        expect(() => {
          validateAppConfig({ errorSampling: '0.5' as unknown as number });
        }).toThrow(SamplingRateValidationError);
      });
    });

    describe('sendIntervalMs validation', () => {
      it('should accept undefined (default)', () => {
        expect(() => {
          validateAppConfig({ sendIntervalMs: undefined });
        }).not.toThrow();
      });

      it('should accept valid value (5000)', () => {
        expect(() => {
          validateAppConfig({ sendIntervalMs: 5000 });
        }).not.toThrow();
      });

      it('should accept lower bound (1000)', () => {
        expect(() => {
          validateAppConfig({ sendIntervalMs: 1000 });
        }).not.toThrow();
      });

      it('should accept upper bound (60000)', () => {
        expect(() => {
          validateAppConfig({ sendIntervalMs: 60000 });
        }).not.toThrow();
      });

      it('should reject value below 1000', () => {
        expect(() => {
          validateAppConfig({ sendIntervalMs: 999 });
        }).toThrow(AppConfigValidationError);
      });

      it('should reject value above 60000', () => {
        expect(() => {
          validateAppConfig({ sendIntervalMs: 60001 });
        }).toThrow(AppConfigValidationError);
      });

      it('should reject non-number type', () => {
        expect(() => {
          validateAppConfig({ sendIntervalMs: '5000' as unknown as number });
        }).toThrow(AppConfigValidationError);
      });

      it('should reject NaN', () => {
        expect(() => {
          validateAppConfig({ sendIntervalMs: NaN });
        }).toThrow(AppConfigValidationError);
      });

      it('should reject Infinity', () => {
        expect(() => {
          validateAppConfig({ sendIntervalMs: Infinity });
        }).toThrow(AppConfigValidationError);
      });
    });
  });

  describe('validateAndNormalizeConfig', () => {
    it('should return default config for undefined input', () => {
      const normalized = validateAndNormalizeConfig(undefined);
      expect(normalized).toBeDefined();
      expect(normalized.sessionTimeout).toBeDefined();
      expect(normalized.samplingRate).toBeDefined();
    });

    it('should normalize config with defaults', () => {
      const normalized = validateAndNormalizeConfig({});
      expect(normalized.sessionTimeout).toBeDefined();
      expect(normalized.samplingRate).toBeDefined();
      expect(normalized.errorSampling).toBeDefined();
    });

    it('should preserve custom values during normalization', () => {
      const customConfig = {
        sessionTimeout: 600000,
        samplingRate: 0.5,
        globalMetadata: { app: 'test' },
      };
      const normalized = validateAndNormalizeConfig(customConfig);
      expect(normalized.sessionTimeout).toBe(600000);
      expect(normalized.samplingRate).toBe(0.5);
      expect(normalized.globalMetadata).toEqual({ app: 'test' });
    });

    it('should validate before normalizing', () => {
      expect(() => validateAndNormalizeConfig({ sessionTimeout: 1000 })).toThrow(SessionTimeoutValidationError);
    });

    it('should normalize sendIntervalMs to default when not provided', () => {
      const normalized = validateAndNormalizeConfig({});
      expect(normalized.sendIntervalMs).toBe(10000);
    });

    it('should preserve custom sendIntervalMs value', () => {
      const normalized = validateAndNormalizeConfig({ sendIntervalMs: 5000 });
      expect(normalized.sendIntervalMs).toBe(5000);
    });
  });
});
