import { DEFAULT_SENSITIVE_QUERY_PARAMS } from '../../constants';
import { log } from '../logging.utils';

const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1', '[::1]'];

/**
 * Whether a collect endpoint is acceptable: `https:` anywhere, `http:` only on the local
 * machine so a receiver can run without TLS during development.
 */
export const isValidEndpoint = (endpoint: unknown): boolean => {
  if (typeof endpoint !== 'string') {
    return false;
  }

  try {
    const { protocol, hostname } = new URL(endpoint);
    return protocol === 'https:' || (protocol === 'http:' && LOCAL_HOSTNAMES.includes(hostname));
  } catch {
    return false;
  }
};

/**
 * Normalizes a URL by removing sensitive query parameters
 * Combines default sensitive parameters with custom ones provided by user
 * @param url - The URL to normalize
 * @param sensitiveQueryParams - Array of parameter names to remove (merged with defaults)
 * @returns The normalized URL
 */
export const normalizeUrl = (url: string, sensitiveQueryParams: string[] = []): string => {
  if (!url || typeof url !== 'string') {
    log('warn', 'Invalid URL provided to normalizeUrl', { data: { type: typeof url } });
    return url || '';
  }

  try {
    let urlObject: URL;
    let isRelative = false;

    try {
      urlObject = new URL(url);
    } catch {
      // Path-relative href (e.g. "/checkout?token=x") — resolve against the current
      // page so sensitive params can still be stripped. Only collapse back to the
      // relative form when it stays same-origin: a protocol-relative href
      // ("//cdn.other.com/x") resolves to a different origin and must keep its
      // absolute form, or we'd silently drop the host from the captured data.
      const base = window.location.href;
      urlObject = new URL(url, base);
      isRelative = urlObject.origin === new URL(base).origin;
    }

    const searchParams = urlObject.searchParams;

    const allSensitiveParams = [...new Set([...DEFAULT_SENSITIVE_QUERY_PARAMS, ...sensitiveQueryParams])];

    let hasChanged = false;

    for (const param of allSensitiveParams) {
      if (searchParams.has(param)) {
        searchParams.delete(param);
        hasChanged = true;
      }
    }

    if (!hasChanged && (isRelative || url.includes('?'))) {
      return url;
    }

    urlObject.search = searchParams.toString();

    // Preserve the relative form — returning the resolved absolute URL would
    // change the captured data shape (e.g. click hrefs) for no privacy gain.
    return isRelative ? `${urlObject.pathname}${urlObject.search}${urlObject.hash}` : urlObject.toString();
  } catch (error) {
    log('warn', 'URL normalization failed, returning original', { error, data: { urlLength: url?.length } });
    return url;
  }
};
