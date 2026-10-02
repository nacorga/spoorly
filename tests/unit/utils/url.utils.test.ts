import { describe, it, expect } from 'vitest';
import { normalizeUrl, isValidEndpoint } from '../../../src/utils/network/url.utils';

describe('url.utils - normalizeUrl()', () => {
  describe('absolute URLs', () => {
    it('should strip default sensitive query params', () => {
      const result = normalizeUrl('https://example.com/reset?token=abc123&foo=1');
      expect(result).toBe('https://example.com/reset?foo=1');
    });

    it('should strip multiple default sensitive params', () => {
      const result = normalizeUrl('https://example.com/cb?code=xyz&otp=123&access_token=t1');
      expect(result).toBe('https://example.com/cb');
    });

    it('should merge custom sensitive params with defaults', () => {
      const result = normalizeUrl('https://example.com/?promo_code=SAVE20&token=abc&q=1', ['promo_code']);
      expect(result).toBe('https://example.com/?q=1');
    });

    it('should preserve non-sensitive params', () => {
      const result = normalizeUrl('https://example.com/search?q=test&page=2');
      expect(result).toBe('https://example.com/search?q=test&page=2');
    });

    it('should return URL without query untouched in value', () => {
      const result = normalizeUrl('https://example.com/page');
      expect(result).toBe('https://example.com/page');
    });

    it.each(['sessionid', 'session_id', 'jwt', 'bearer', 'oauth'])(
      'should strip credential param "%s" by default',
      (param) => {
        const result = normalizeUrl(`https://example.com/cb?${param}=leak&keep=1`);
        expect(result).toBe('https://example.com/cb?keep=1');
        expect(result).not.toContain('leak');
      },
    );
  });

  describe('relative URLs (click hrefs)', () => {
    it('should strip sensitive params from a root-relative href', () => {
      const result = normalizeUrl('/reset-password?token=secret123');
      expect(result).toBe('/reset-password');
    });

    it('should preserve non-sensitive params in a relative href', () => {
      const result = normalizeUrl('/products?category=shoes&token=abc');
      expect(result).toBe('/products?category=shoes');
    });

    it('should return unchanged relative hrefs verbatim', () => {
      expect(normalizeUrl('/checkout')).toBe('/checkout');
      expect(normalizeUrl('#section-2')).toBe('#section-2');
      expect(normalizeUrl('/list?page=3')).toBe('/list?page=3');
    });

    it('should preserve the hash when stripping params from a relative href', () => {
      const result = normalizeUrl('/account?auth=xyz#settings');
      expect(result).toBe('/account#settings');
    });

    it('should keep the host for a cross-origin protocol-relative href', () => {
      // jsdom base is http://localhost:3000 — a protocol-relative href to a different
      // host must NOT be collapsed to a path-only form (that would drop the host).
      const result = normalizeUrl('//cdn.other.com/x?token=secret123&v=1');
      expect(result).toBe('http://cdn.other.com/x?v=1');
      expect(result).not.toContain('secret123');
    });

    it('should preserve a cross-origin protocol-relative href with no sensitive params', () => {
      const result = normalizeUrl('//cdn.other.com/asset.js?v=1');
      expect(result).toBe('//cdn.other.com/asset.js?v=1');
    });
  });

  it('should return empty string for empty input', () => {
    expect(normalizeUrl('')).toBe('');
  });
});

describe('url.utils - isValidEndpoint()', () => {
  it.each([
    'https://api.example.com/collect',
    'https://api.example.com/collect?key=abc',
    'http://localhost/collect',
    'http://localhost:8787/collect',
    'http://127.0.0.1:8787/collect',
    'http://[::1]:8787/collect',
  ])('accepts %s', (url) => {
    expect(isValidEndpoint(url)).toBe(true);
  });

  it.each([
    'http://api.example.com/collect',
    'ftp://api.example.com/collect',
    'not a url',
    '',
    '/relative/collect',
    123,
    null,
  ])('rejects %s', (url) => {
    expect(isValidEndpoint(url)).toBe(false);
  });
});
