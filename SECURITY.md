# Security policy

## Reporting a vulnerability

Report vulnerabilities privately through [GitHub Security Advisories](https://github.com/nacorga/spoorly/security/advisories/new). Please don't open a public issue. Include the affected version, a reproduction and the impact you expect.

## Supported versions

Only the latest `0.x` release gets security fixes.

## PII policy

spoorly runs in your visitors' browsers, so it collects as little as it can:

- **Form values are never read.** A click on an `<input>`, `<textarea>` or `<select>` reports the element (tag, id, class), never its value. Form submissions are not captured.
- **Free text is scrubbed.** Click text, element `id` and `class`, error messages and stack traces are scrubbed for emails, phone numbers, card numbers, IBANs, `sk_`/`pk_` API keys, bearer tokens, connection-string passwords and sensitive query parameters, each replaced with `[REDACTED]`. The patterns are exported as `PII_PATTERNS`.
- **URLs are cleaned.** Sensitive query parameters (`token`, `password`, `secret`, `api_key`, `code`, `otp` and the rest of the built-in list, plus `sensitiveQueryParams`) are removed from page URLs, link `href`s and referrers.
- **You can opt elements out.** Clicks on or inside an element with `data-spoorly-ignore` are not captured.
- **No fingerprinting.** The visitor id is a random UUID in `localStorage`. Ad click ids (`gclid`, `fbclid`…) are captured for attribution but never logged.
- **Nothing before consent.** Nothing is captured until you call `init()`. `destroy()` stops capture.

What spoorly can't protect is data you pass yourself: metadata in `event()`, traits in `identify()` and `globalMetadata` are sent as they are. Keep personal data out of them, or hash it first.
