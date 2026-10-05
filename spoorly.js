const ke = "text/plain;charset=UTF-8";
const M = "data-spoorly", Et = [
  "button",
  "a",
  'input[type="button"]',
  'input[type="submit"]',
  'input[type="reset"]',
  'input[type="checkbox"]',
  'input[type="radio"]',
  "select",
  "textarea",
  '[role="button"]',
  '[role="link"]',
  '[role="tab"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="switch"]',
  "[routerLink]",
  "[ng-click]",
  "[data-action]",
  "[data-click]",
  "[data-navigate]",
  "[data-toggle]",
  "[onclick]",
  ".btn",
  ".button",
  ".clickable",
  ".nav-link",
  ".menu-item",
  "[data-testid]",
  '[tabindex="0"]'
], vt = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"], Tt = [
  "token",
  "auth",
  "key",
  "session",
  "sessionid",
  "session_id",
  "jwt",
  "bearer",
  "oauth",
  "reset",
  "password",
  "api_key",
  "apikey",
  "secret",
  "access_token",
  "refresh_token",
  "verification",
  "code",
  "otp"
];
const y = {
  INVALID_ENDPOINT: "endpoint must be an https URL (http is allowed only for localhost)",
  INVALID_SESSION_TIMEOUT: "Session timeout must be between 30000ms (30 seconds) and 86400000ms (24 hours)",
  INVALID_SAMPLING_RATE: "Sampling rate must be between 0 and 1",
  INVALID_ERROR_SAMPLING_RATE: "Error sampling must be between 0 and 1",
  INVALID_GLOBAL_METADATA: "Global metadata must be an object",
  INVALID_SENSITIVE_QUERY_PARAMS: "Sensitive query params must be an array of strings",
  INVALID_PAGE_VIEW_THROTTLE: "Page view throttle must be a non-negative number",
  INVALID_CLICK_THROTTLE: "Click throttle must be a non-negative number",
  INVALID_MAX_SAME_EVENT_PER_MINUTE: "Max same event per minute must be a positive number",
  INVALID_SEND_INTERVAL: "Send interval must be between 1000ms (1 second) and 60000ms (60 seconds)"
}, _t = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<embed\b[^>]*>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi
], m = "spoorly", K = `${m}:qa_mode`, ge = `${m}:uid`, st = "spoorly_mode", De = "qa", Ue = "qa_off", yt = (n) => n ? `${m}:${n}:queue` : `${m}:queue`, It = (n) => n ? `${m}:${n}:rate_limit` : `${m}:rate_limit`, wt = `${m}:session`, At = `${m}:broadcast`, Fe = (n, e) => `${m}:${n}:session_counts:${e}`, Ve = 10080 * 60 * 1e3, He = `${m}:session_counts_last_cleanup`, xe = 3600 * 1e3, ae = `${m}:identity`, k = `${m}:pending_identity`;
var w = /* @__PURE__ */ ((n) => (n.Mobile = "mobile", n.Tablet = "tablet", n.Desktop = "desktop", n.Unknown = "unknown", n))(w || {}), B = /* @__PURE__ */ ((n) => (n.EVENT = "event", n.QUEUE = "queue", n))(B || {});
class b extends Error {
  constructor(e, t) {
    super(e), this.statusCode = t, this.name = "PermanentError", Error.captureStackTrace && Error.captureStackTrace(this, b);
  }
  statusCode;
}
class q extends Error {
  constructor(e) {
    super(e), this.name = "RateLimitError", Error.captureStackTrace && Error.captureStackTrace(this, q);
  }
}
class J extends Error {
  constructor(e) {
    super(e), this.name = "TimeoutError", Error.captureStackTrace && Error.captureStackTrace(this, J);
  }
}
var u = /* @__PURE__ */ ((n) => (n.PAGE_VIEW = "page_view", n.CLICK = "click", n.SCROLL = "scroll", n.SESSION_START = "session_start", n.CUSTOM = "custom", n.WEB_VITALS = "web_vitals", n.ERROR = "error", n))(u || {}), me = /* @__PURE__ */ ((n) => (n.UP = "up", n.DOWN = "down", n))(me || {}), V = /* @__PURE__ */ ((n) => (n.JS_ERROR = "js_error", n.PROMISE_REJECTION = "promise_rejection", n))(V || {}), Z = /* @__PURE__ */ ((n) => (n.QA = "qa", n))(Z || {});
class Re extends Error {
  constructor(e, t, s) {
    super(e), this.errorCode = t, this.layer = s, this.name = this.constructor.name, Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
  }
  errorCode;
  layer;
}
class g extends Re {
  constructor(e, t = "config") {
    super(e, "APP_CONFIG_INVALID", t);
  }
}
class Mt extends Re {
  constructor(e, t = "config") {
    super(e, "SESSION_TIMEOUT_INVALID", t);
  }
}
class Be extends Re {
  constructor(e, t = "config") {
    super(e, "SAMPLING_RATE_INVALID", t);
  }
}
const Nt = ["gclid", "gbraid", "wbraid", "fbclid", "ttclid"], le = () => {
  const n = new URLSearchParams(window.location.search), e = {};
  return Nt.forEach((s) => {
    const i = n.get(s);
    i && (e[s] = i);
  }), Object.keys(e).length ? e : void 0;
}, bt = "background: #ff9800; color: white; font-weight: bold; padding: 2px 8px; border-radius: 3px;", Lt = "background: #9e9e9e; color: white; font-weight: bold; padding: 2px 8px; border-radius: 3px;", Rt = "background: #d32f2f; color: white; font-weight: bold; padding: 2px 8px; border-radius: 3px;", Ct = (n, e) => {
  if (e) {
    if (e instanceof Error) {
      const t = e.message.replace(/\s+at\s+.*$/gm, "").replace(/\s*\([^()]+:\d+:\d+\)/g, "");
      return `[spoorly] ${n}: ${t}`;
    }
    if (e instanceof Error)
      return `[spoorly] ${n}: ${e.message}`;
    if (typeof e == "string")
      return `[spoorly] ${n}: ${e}`;
    if (typeof e == "object")
      try {
        return `[spoorly] ${n}: ${JSON.stringify(e)}`;
      } catch {
        return `[spoorly] ${n}: [Unable to serialize error]`;
      }
    return `[spoorly] ${n}: ${String(e)}`;
  }
  return `[spoorly] ${n}`;
}, Ot = () => {
  if (typeof window > "u" || typeof sessionStorage > "u")
    return !1;
  try {
    return sessionStorage.getItem(K) === "true";
  } catch {
    return !1;
  }
}, a = (n, e, t) => {
  const { error: s, data: i, showToClient: r = !1, style: o, visibility: l } = t ?? {}, c = s ? Ct(e, s) : `[spoorly] ${e}`, d = n === "error" ? "error" : n === "warn" ? "warn" : "log";
  if (!Pt(l, r))
    return;
  const p = kt(l, o), S = i !== void 0 ? pe(i) : void 0;
  Dt(d, c, p, S);
}, Pt = (n, e) => n === "critical" ? !0 : n === "qa" || e ? Ot() : !1, kt = (n, e) => e !== void 0 && e !== "" ? e : n === "critical" ? Rt : "", Dt = (n, e, t, s) => {
  const i = t !== void 0 && t !== "", r = i ? `%c${e}` : e;
  s !== void 0 ? i ? console[n](r, t, s) : console[n](r, s) : i ? console[n](r, t) : console[n](r);
}, pe = (n) => {
  const e = {}, t = ["token", "password", "secret", "key", "apikey", "api_key", "sessionid", "session_id"];
  for (const [s, i] of Object.entries(n)) {
    const r = s.toLowerCase();
    if (t.some((o) => r.includes(o))) {
      e[s] = "[REDACTED]";
      continue;
    }
    i !== null && typeof i == "object" && !Array.isArray(i) ? e[s] = pe(i) : Array.isArray(i) ? e[s] = i.map(
      (o) => o !== null && typeof o == "object" && !Array.isArray(o) ? pe(o) : o
    ) : e[s] = i;
  }
  return e;
};
let Se, nt;
const Ut = () => {
  typeof window < "u" && !Se && (Se = window.matchMedia("(pointer: coarse)"), nt = window.matchMedia("(hover: none)"));
}, ee = "Unknown", Ft = (n) => {
  const e = n.userAgentData?.platform;
  if (e != null && e !== "") {
    if (/windows/i.test(e)) return "Windows";
    if (/macos/i.test(e)) return "macOS";
    if (/android/i.test(e)) return "Android";
    if (/linux/i.test(e)) return "Linux";
    if (/chromeos/i.test(e)) return "ChromeOS";
    if (/ios/i.test(e)) return "iOS";
  }
  const t = navigator.userAgent;
  return /Windows/i.test(t) ? "Windows" : /iPhone|iPad|iPod/i.test(t) ? "iOS" : /Mac OS X|Macintosh/i.test(t) ? "macOS" : /Android/i.test(t) ? "Android" : /CrOS/i.test(t) ? "ChromeOS" : /Linux/i.test(t) ? "Linux" : ee;
}, Vt = (n) => {
  const e = n.userAgentData?.brands;
  if (e != null && e.length > 0) {
    const i = e.filter((r) => !/not.?a.?brand|chromium/i.test(r.brand))[0];
    if (i != null) {
      const r = i.brand;
      return /google chrome/i.test(r) ? "Chrome" : /microsoft edge/i.test(r) ? "Edge" : /opera/i.test(r) ? "Opera" : r;
    }
  }
  const t = navigator.userAgent;
  return /Edg\//i.test(t) ? "Edge" : /OPR\//i.test(t) ? "Opera" : /Chrome/i.test(t) ? "Chrome" : /Firefox/i.test(t) ? "Firefox" : /Safari/i.test(t) && !/Chrome/i.test(t) ? "Safari" : ee;
}, Ht = () => {
  try {
    const n = navigator;
    if (n.userAgentData != null && typeof n.userAgentData.mobile == "boolean") {
      const c = n.userAgentData.platform;
      return c != null && c !== "" && /ipad|tablet/i.test(c) ? w.Tablet : n.userAgentData.mobile ? w.Mobile : w.Desktop;
    }
    Ut();
    const e = window.innerWidth, t = Se?.matches ?? !1, s = nt?.matches ?? !1, i = "ontouchstart" in window || navigator.maxTouchPoints > 0, r = navigator.userAgent.toLowerCase(), o = /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/.test(r), l = /tablet|ipad|android(?!.*mobile)/.test(r);
    return e <= 767 || o && i ? w.Mobile : e >= 768 && e <= 1024 || l || t && s && i ? w.Tablet : w.Desktop;
  } catch (n) {
    return a("debug", "Device detection failed, defaulting to desktop", { error: n }), w.Desktop;
  }
}, xt = () => {
  try {
    const n = navigator;
    return {
      type: Ht(),
      os: Ft(n),
      browser: Vt(n)
    };
  } catch (n) {
    return a("debug", "Device info detection failed, using defaults", { error: n }), {
      type: w.Desktop,
      os: ee,
      browser: ee
    };
  }
}, $e = 500, Xe = 2e3, We = 5e3, j = 50, Bt = j * 2, it = 1, $t = 1e3, Xt = 10, Ge = 5e3, Wt = 3, Gt = 200, zt = 6e4, Qt = {
  LCP: 2500,
  FCP: 1800,
  CLS: 0.1,
  INP: 200,
  TTFB: 800
}, Kt = {
  LCP: 4e3,
  FCP: 3e3,
  CLS: 0.25,
  INP: 500,
  TTFB: 1800
}, ze = {
  LCP: Number.NEGATIVE_INFINITY,
  FCP: Number.NEGATIVE_INFINITY,
  CLS: Number.NEGATIVE_INFINITY,
  INP: Number.NEGATIVE_INFINITY,
  TTFB: Number.NEGATIVE_INFINITY
}, Ee = "all", Qe = (n = Ee) => {
  switch (n) {
    case "all":
      return ze;
    case "needs-improvement":
      return Qt;
    case "poor":
      return Kt;
    default:
      return ze;
  }
}, jt = 50, Yt = "0.2.1", qt = Yt, Jt = () => typeof window < "u" && typeof sessionStorage < "u", Zt = () => {
  try {
    const n = new URLSearchParams(window.location.search);
    n.delete(st);
    const e = n.toString(), t = window.location.pathname + (e ? "?" + e : "") + window.location.hash;
    window.history.replaceState({}, "", t);
  } catch {
  }
}, es = () => {
  if (!Jt())
    return !1;
  try {
    const e = new URLSearchParams(window.location.search).get(st), t = sessionStorage.getItem(K);
    let s = null;
    return e === De ? (s = !0, sessionStorage.setItem(K, "true"), a("info", "QA Mode ACTIVE", {
      visibility: "qa",
      style: bt
    })) : e === Ue && (s = !1, sessionStorage.setItem(K, "false"), a("info", "QA Mode DISABLED", {
      visibility: "qa",
      style: Lt
    })), (e === De || e === Ue) && Zt(), s ?? t === "true";
  } catch {
    return !1;
  }
}, rt = () => typeof document < "u" && document.prerendering === !0, ts = ["localhost", "127.0.0.1", "[::1]"], ss = (n) => {
  if (typeof n != "string")
    return !1;
  try {
    const { protocol: e, hostname: t } = new URL(n);
    return e === "https:" || e === "http:" && ts.includes(t);
  } catch {
    return !1;
  }
}, C = (n, e = []) => {
  if (!n || typeof n != "string")
    return a("warn", "Invalid URL provided to normalizeUrl", { data: { type: typeof n } }), n || "";
  try {
    let t, s = !1;
    try {
      t = new URL(n);
    } catch {
      const l = window.location.href;
      t = new URL(n, l), s = t.origin === new URL(l).origin;
    }
    const i = t.searchParams, r = [.../* @__PURE__ */ new Set([...Tt, ...e])];
    let o = !1;
    for (const l of r)
      i.has(l) && (i.delete(l), o = !0);
    return !o && (s || n.includes("?")) ? n : (t.search = i.toString(), s ? `${t.pathname}${t.search}${t.hash}` : t.toString());
  } catch (t) {
    return a("warn", "URL normalization failed, returning original", { error: t, data: { urlLength: n?.length } }), n;
  }
}, ns = [
  "co.uk",
  "org.uk",
  "com.au",
  "net.au",
  "com.br",
  "co.nz",
  "co.jp",
  "com.mx",
  "co.in",
  "com.cn",
  "co.za"
], Ke = (n) => {
  const e = n.toLowerCase().split(".");
  if (e.length <= 2)
    return n.toLowerCase();
  const t = e.slice(-2).join(".");
  return ns.includes(t) ? e.slice(-3).join(".") : e.slice(-2).join(".");
}, is = (n, e) => n === e ? !0 : Ke(n) === Ke(e), ce = (n = []) => {
  const e = document.referrer;
  if (!e)
    return "Direct";
  try {
    const t = new URL(e).hostname.toLowerCase(), s = window.location.hostname.toLowerCase();
    return is(t, s) ? "Direct" : C(e, n);
  } catch (t) {
    return a("debug", "Failed to parse referrer URL, using raw value", { error: t, data: { referrer: e } }), e;
  }
}, ue = () => {
  const n = new URLSearchParams(window.location.search), e = {};
  return vt.forEach((s) => {
    const i = n.get(s);
    if (i) {
      const r = s.split("utm_")[1];
      e[r] = i;
    }
  }), Object.keys(e).length ? e : void 0;
}, ot = () => typeof crypto < "u" && crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (n) => {
  const e = Math.random() * 16 | 0;
  return (n === "x" ? e : e & 3 | 8).toString(16);
});
let G = 0, z = 0;
const rs = () => {
  let n = Date.now();
  n < z && (n = z), n === z ? G = (G + 1) % 1e3 : G = 0, z = n;
  const e = G.toString().padStart(3, "0");
  let t = "";
  try {
    if (typeof crypto < "u" && crypto.getRandomValues) {
      const s = crypto.getRandomValues(new Uint8Array(3));
      s && (t = Array.from(s, (i) => i.toString(16).padStart(2, "0")).join(""));
    }
  } catch {
  }
  return t || (t = Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")), `${n}-${e}-${t}`;
}, je = (n) => {
  if (!n || typeof n != "string" || n.trim().length === 0)
    return "";
  let e = n;
  n.length > 1e3 && (e = n.slice(0, Math.max(0, 1e3)));
  let t = 0;
  for (const i of _t) {
    const r = e;
    e = e.replace(i, ""), r !== e && t++;
  }
  return t > 0 && a("warn", "XSS patterns detected and removed", {
    data: {
      patternMatches: t,
      valueLength: n.length
    }
  }), e.trim();
}, ve = (n, e = 0) => {
  if (n == null)
    return null;
  if (typeof n == "string")
    return je(n);
  if (typeof n == "number")
    return !Number.isFinite(n) || n < -Number.MAX_SAFE_INTEGER || n > Number.MAX_SAFE_INTEGER ? 0 : n;
  if (typeof n == "boolean")
    return n;
  if (e > 10)
    return null;
  if (Array.isArray(n))
    return n.slice(0, 1e3).map((i) => ve(i, e + 1)).filter((i) => i !== null);
  if (typeof n == "object") {
    const t = {}, i = Object.entries(n).slice(0, 200);
    for (const [r, o] of i) {
      const l = je(r);
      if (l) {
        const c = ve(o, e + 1);
        c !== null && (t[l] = c);
      }
    }
    return t;
  }
  return null;
}, os = (n) => {
  if (typeof n != "object" || n === null)
    return {};
  try {
    const e = ve(n);
    return typeof e == "object" && e !== null ? e : {};
  } catch (e) {
    const t = e instanceof Error ? e.message : String(e);
    throw new Error(`[spoorly] Metadata sanitization failed: ${t}`, { cause: e });
  }
}, as = [
  // Email addresses.
  // Quantifiers are bounded (local part ≤64, each label ≤63, TLD ≤63 per RFC/DNS limits)
  // and the domain is matched as discrete dot-separated labels so the local-part and
  // domain classes never overlap. This keeps matching linear and prevents catastrophic
  // backtracking (ReDoS) on long, dot-heavy inputs that contain no real email.
  /\b[A-Za-z0-9._%+-]{1,64}@(?:[A-Za-z0-9-]{1,63}\.)+[A-Za-z]{2,63}\b/gi,
  // US Phone numbers (various formats)
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  // Credit card numbers (16 digits with optional separators)
  /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  // IBAN (International Bank Account Number)
  /\b[A-Z]{2}\d{2}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/gi,
  // API keys / tokens (sk_test_, sk_live_, pk_test_, pk_live_, …)
  /\b[sp]k_(test|live)_[a-zA-Z0-9]{10,}\b/gi,
  // Bearer tokens (JWT-like patterns — matches complete and partial tokens)
  /Bearer\s+[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)?(?:\.[A-Za-z0-9_-]+)?/gi,
  // Passwords in connection strings (protocol://user:password@host)
  /:\/\/[^:/]+:([^@]+)@/gi,
  // Sensitive URL query parameters (token=, password=, auth=, secret=, api_key=, …)
  /[?&](token|password|passwd|auth|secret|secret_key|private_key|auth_key|api_key|apikey|access_token)=[^&\s]+/gi
], R = (n) => {
  let e = n;
  for (const t of as)
    e = e.replace(t, "[REDACTED]");
  return e;
}, ls = (n) => {
  if (n !== void 0 && (n === null || typeof n != "object"))
    throw new g("Configuration must be an object", "config");
  if (n) {
    if (n.endpoint !== void 0 && !ss(n.endpoint))
      throw new g(y.INVALID_ENDPOINT, "config");
    if (n.sessionTimeout !== void 0 && (typeof n.sessionTimeout != "number" || n.sessionTimeout < 3e4 || n.sessionTimeout > 864e5))
      throw new Mt(y.INVALID_SESSION_TIMEOUT, "config");
    if (n.globalMetadata !== void 0 && (typeof n.globalMetadata != "object" || n.globalMetadata === null))
      throw new g(y.INVALID_GLOBAL_METADATA, "config");
    if (n.sensitiveQueryParams !== void 0) {
      if (!Array.isArray(n.sensitiveQueryParams))
        throw new g(y.INVALID_SENSITIVE_QUERY_PARAMS, "config");
      for (const e of n.sensitiveQueryParams)
        if (typeof e != "string")
          throw new g("All sensitive query params must be strings", "config");
    }
    if (n.errorSampling !== void 0 && (typeof n.errorSampling != "number" || n.errorSampling < 0 || n.errorSampling > 1))
      throw new Be(y.INVALID_ERROR_SAMPLING_RATE, "config");
    if (n.samplingRate !== void 0 && (typeof n.samplingRate != "number" || n.samplingRate < 0 || n.samplingRate > 1))
      throw new Be(y.INVALID_SAMPLING_RATE, "config");
    if (n.pageViewThrottleMs !== void 0 && (typeof n.pageViewThrottleMs != "number" || n.pageViewThrottleMs < 0))
      throw new g(y.INVALID_PAGE_VIEW_THROTTLE, "config");
    if (n.clickThrottleMs !== void 0 && (typeof n.clickThrottleMs != "number" || n.clickThrottleMs < 0))
      throw new g(y.INVALID_CLICK_THROTTLE, "config");
    if (n.maxSameEventPerMinute !== void 0 && (typeof n.maxSameEventPerMinute != "number" || n.maxSameEventPerMinute <= 0))
      throw new g(y.INVALID_MAX_SAME_EVENT_PER_MINUTE, "config");
    if (n.sendIntervalMs !== void 0 && (!Number.isFinite(n.sendIntervalMs) || n.sendIntervalMs < 1e3 || n.sendIntervalMs > 6e4))
      throw new g(y.INVALID_SEND_INTERVAL, "config");
    if (n.flushOnSpaNavigation !== void 0 && typeof n.flushOnSpaNavigation != "boolean")
      throw new g(
        `Invalid flushOnSpaNavigation type: ${typeof n.flushOnSpaNavigation}. Must be a boolean`,
        "config"
      );
    if (n.flushOnPageHidden !== void 0 && typeof n.flushOnPageHidden != "boolean")
      throw new g(
        `Invalid flushOnPageHidden type: ${typeof n.flushOnPageHidden}. Must be a boolean`,
        "config"
      );
    if (n.webVitalsMode !== void 0) {
      if (typeof n.webVitalsMode != "string")
        throw new g(
          `Invalid webVitalsMode type: ${typeof n.webVitalsMode}. Must be a string`,
          "config"
        );
      const e = ["all", "needs-improvement", "poor"];
      if (!e.includes(n.webVitalsMode))
        throw new g(
          `Invalid webVitalsMode: "${n.webVitalsMode}". Must be one of: ${e.join(", ")}`,
          "config"
        );
    }
    if (n.webVitalsThresholds !== void 0) {
      if (typeof n.webVitalsThresholds != "object" || n.webVitalsThresholds === null || Array.isArray(n.webVitalsThresholds))
        throw new g("webVitalsThresholds must be an object", "config");
      const e = ["LCP", "FCP", "CLS", "INP", "TTFB"];
      for (const [t, s] of Object.entries(n.webVitalsThresholds)) {
        if (!e.includes(t))
          throw new g(
            `Invalid Web Vitals threshold key: "${t}". Must be one of: ${e.join(", ")}`,
            "config"
          );
        if (typeof s != "number" || !Number.isFinite(s) || s < 0)
          throw new g(
            `Invalid Web Vitals threshold value for ${t}: ${s}. Must be a non-negative finite number`,
            "config"
          );
      }
    }
  }
}, cs = (n) => (ls(n), {
  ...n ?? {},
  sessionTimeout: n?.sessionTimeout ?? 9e5,
  globalMetadata: n?.globalMetadata ?? {},
  sensitiveQueryParams: n?.sensitiveQueryParams ?? [],
  errorSampling: n?.errorSampling ?? it,
  samplingRate: n?.samplingRate ?? 1,
  pageViewThrottleMs: n?.pageViewThrottleMs ?? 1e3,
  clickThrottleMs: n?.clickThrottleMs ?? 300,
  maxSameEventPerMinute: n?.maxSameEventPerMinute ?? 60,
  sendIntervalMs: n?.sendIntervalMs ?? 1e4,
  flushOnSpaNavigation: n?.flushOnSpaNavigation ?? !1,
  flushOnPageHidden: n?.flushOnPageHidden ?? !0
}), Te = (n, e = /* @__PURE__ */ new Set()) => {
  if (n == null)
    return !0;
  const t = typeof n;
  return t === "string" || t === "number" || t === "boolean" ? !0 : t === "function" || t === "symbol" || t === "bigint" || e.has(n) ? !1 : (e.add(n), Array.isArray(n) ? n.every((s) => Te(s, e)) : t === "object" ? Object.values(n).every((s) => Te(s, e)) : !1);
}, us = (n) => typeof n != "object" || n === null ? !1 : Te(n), _e = (n) => {
  if (typeof n != "object" || n === null || Array.isArray(n)) return;
  const e = {};
  for (const [t, s] of Object.entries(n))
    typeof s == "string" && (e[t] = s);
  return Object.keys(e).length > 0 ? e : void 0;
}, ds = (n) => typeof n != "string" ? {
  valid: !1,
  error: "Event name must be a string"
} : n.length === 0 ? {
  valid: !1,
  error: "Event name cannot be empty"
} : n.length > 120 ? {
  valid: !1,
  error: "Event name is too long (max 120 characters)"
} : n.includes("<") || n.includes(">") || n.includes("&") ? {
  valid: !1,
  error: "Event name contains invalid characters"
} : ["constructor", "prototype", "__proto__", "eval", "function", "var", "let", "const"].includes(n.toLowerCase()) ? {
  valid: !1,
  error: "Event name cannot be a reserved word"
} : { valid: !0 }, Ye = (n, e, t) => {
  const s = os(e), i = `${t} "${n}" metadata error`;
  if (!us(s))
    return {
      valid: !1,
      error: `${i}: object has invalid types. Valid types are string, number, boolean or string arrays.`
    };
  let r;
  try {
    r = JSON.stringify(s);
  } catch {
    return {
      valid: !1,
      error: `${i}: object contains circular references or cannot be serialized.`
    };
  }
  if (new TextEncoder().encode(r).byteLength > 49152)
    return {
      valid: !1,
      error: `${i}: object is too large (max ${49152 / 1024} KB).`
    };
  if (Object.keys(s).length > 100)
    return {
      valid: !1,
      error: `${i}: object has too many keys (max 100 keys).`
    };
  for (const [c, d] of Object.entries(s)) {
    if (Array.isArray(d)) {
      if (d.length > 500)
        return {
          valid: !1,
          error: `${i}: array property "${c}" is too large (max 500 items).`
        };
      for (const h of d)
        if (typeof h == "string" && h.length > 500)
          return {
            valid: !1,
            error: `${i}: array property "${c}" contains strings that are too long (max 500 characters).`
          };
    }
    if (typeof d == "string" && d.length > 1e3)
      return {
        valid: !1,
        error: `${i}: property "${c}" is too long (max 1000 characters).`
      };
  }
  return {
    valid: !0,
    sanitizedMetadata: s
  };
}, hs = (n, e, t) => {
  if (Array.isArray(e)) {
    const s = [], i = `${t} "${n}" metadata error`;
    for (let r = 0; r < e.length; r++) {
      const o = e[r];
      if (typeof o != "object" || o === null || Array.isArray(o))
        return {
          valid: !1,
          error: `${i}: array item at index ${r} must be an object.`
        };
      const l = Ye(n, o, t);
      if (!l.valid)
        return {
          valid: !1,
          error: `${i}: array item at index ${r} is invalid: ${l.error}`
        };
      l.sanitizedMetadata && s.push(l.sanitizedMetadata);
    }
    return {
      valid: !0,
      sanitizedMetadata: s
    };
  }
  return Ye(n, e, t);
}, fs = (n, e) => {
  const t = ds(n);
  if (!t.valid)
    return a("error", "Event name validation failed", {
      data: { eventName: n, error: t.error }
    }), t;
  if (!e)
    return { valid: !0 };
  const s = hs(n, e, "customEvent");
  return s.valid || a("error", "Event metadata validation failed", {
    data: {
      eventName: n,
      error: s.error
    }
  }), s;
};
class gs {
  listeners = /* @__PURE__ */ new Map();
  /**
   * Subscribes to an event channel
   *
   * **Behavior**:
   * - Creates event channel if it doesn't exist
   * - Appends callback to list of listeners for this event
   * - Same callback can be registered multiple times (will fire multiple times)
   *
   * **Type Safety**: Callback receives data type matching the event name
   *
   * @param event - Event name to subscribe to
   * @param callback - Function to call when event is emitted
   *
   * @example
   * ```typescript
   * emitter.on('event', (eventData) => {
   *   // eventData is typed as EventData
   *   console.log(eventData.type);
   * });
   * ```
   */
  on(e, t) {
    this.listeners.has(e) || this.listeners.set(e, []), this.listeners.get(e).push(t);
  }
  /**
   * Unsubscribes from an event channel
   *
   * **Behavior**:
   * - Removes first occurrence of callback from listener list
   * - If callback not found, no error is thrown
   * - If callback was registered multiple times, only one instance is removed
   *
   * **Important**: Must use same function reference passed to `on()`
   *
   * @param event - Event name to unsubscribe from
   * @param callback - Function reference to remove (must match `on()` reference)
   *
   * @example
   * ```typescript
   * const callback = (data) => console.log(data);
   * emitter.on('event', callback);
   * emitter.off('event', callback); // Unsubscribes successfully
   *
   * // BAD: Won't work (different function reference)
   * emitter.on('event', (data) => console.log(data));
   * emitter.off('event', (data) => console.log(data)); // No effect
   * ```
   */
  off(e, t) {
    const s = this.listeners.get(e);
    if (s) {
      const i = s.indexOf(t);
      i > -1 && s.splice(i, 1);
    }
  }
  /**
   * Emits an event with data to all subscribed listeners
   *
   * **Behavior**:
   * - Calls all registered callbacks for this event synchronously
   * - Callbacks execute in registration order
   * - If no listeners, no-op (no error thrown)
   * - Errors in callbacks are NOT caught (propagate to caller)
   *
   * **Type Safety**: Data type must match event name's expected type
   *
   * @param event - Event name to emit
   * @param data - Event data (type must match EmitterMap[event])
   *
   * @example
   * ```typescript
   * // Emit event data
   * emitter.emit('event', eventData);
   *
   * // Emit queue data
   * emitter.emit('queue', {
   *   user_id: 'user-123',
   *   session_id: 'session-456',
   *   device: DeviceType.Desktop,
   *   events: [event1, event2]
   * });
   * ```
   */
  emit(e, t) {
    const s = this.listeners.get(e);
    s && s.forEach((i) => {
      i(t);
    });
  }
  /**
   * Removes all listeners for all events
   *
   * **Purpose**: Cleanup method called during `App.destroy()` to prevent memory leaks
   *
   * **Behavior**:
   * - Clears all event channels
   * - Listeners cannot be restored (new subscriptions required)
   * - Called automatically during library teardown
   *
   * **Use Cases**:
   * - Application teardown
   * - Component unmounting in SPA frameworks
   * - Test cleanup
   *
   * @example
   * ```typescript
   * // During destroy
   * emitter.removeAllListeners();
   * // All subscriptions cleared
   * ```
   */
  removeAllListeners() {
    this.listeners.clear();
  }
}
const ms = /https?:\/\/\S+/g, ps = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, Ss = /0x[0-9a-fA-F]{4,}/g, Es = /(?<!\d)\d{4,}(?!\d)/g, vs = /(['"])[^'"]{20,}\1/g;
function Ts(n) {
  return n.replace(ms, "[URL]").replace(ps, "[ID]").replace(Ss, "[ADDR]").replace(Es, "[N]").replace(vs, "$1[VAR]$1").toLowerCase().trim();
}
function qe(n) {
  const e = n.search(/[?#]/);
  return e === -1 ? n : n.slice(0, e);
}
function _s(n, e) {
  const t = qe((n ?? "").trim());
  if (!t) return "";
  let s;
  try {
    s = new URL(t);
  } catch {
    return t;
  }
  if (s.protocol !== "http:" && s.protocol !== "https:") return "";
  const i = qe((e ?? "").trim());
  return i && t === i ? s.origin : t;
}
function ys(n) {
  const e = Ts(n.message), t = _s(n.filename, n.page_url), s = n.line == null ? "" : String(n.line);
  return `${e}|${t}|${s}`;
}
const de = { config: {} };
class _ {
  /**
   * Retrieves a value from global state.
   */
  get(e) {
    return de[e];
  }
  /**
   * Sets a value in global state.
   */
  set(e, t) {
    de[e] = t;
  }
  /**
   * Returns an immutable snapshot of the entire global state.
   */
  getState() {
    return { ...de };
  }
}
class Is extends _ {
  storeManager;
  apiUrl;
  lastPermanentErrorLog = null;
  recoveryInProgress = !1;
  lastMetadataTimestamp = 0;
  /**
   * Counts consecutive fetch() rejections where no HTTP response was received
   * (DNS failure, connection refused). Resets on success. When this reaches
   * MAX_CONSECUTIVE_NETWORK_FAILURES the circuit opens and further send attempts
   * are skipped until CIRCUIT_BREAKER_COOLDOWN_MS elapses.
   */
  consecutiveNetworkFailures = 0;
  circuitOpenedAt = 0;
  /**
   * Timestamp (epoch ms) before which `send()` must skip fetch() calls due to a
   * prior 429 response. Mirrored to `localStorage` (keyed by userId) so the
   * cooldown survives page navigations on traditional server-rendered sites and
   * is discoverable by other tabs on the same origin.
   */
  rateLimitedUntil = 0;
  /**
   * Storage key used when the current in-memory cooldown was armed. Captured at
   * arm time so identity changes mid-cooldown can't make persist/clear
   * operations target the wrong key.
   */
  rateLimitStorageKeyAtArm = null;
  constructor(e, t) {
    super(), this.storeManager = e, this.apiUrl = t, this.rateLimitedUntil = this.loadRateLimitCooldown();
  }
  getQueueStorageKey() {
    const e = this.get("userId") || "anonymous";
    return yt(e);
  }
  getRateLimitStorageKey() {
    const e = this.get("userId") || "anonymous";
    return It(e);
  }
  getActiveRateLimitKey() {
    return this.rateLimitStorageKeyAtArm ?? this.getRateLimitStorageKey();
  }
  armRateLimitCooldown(e) {
    this.rateLimitedUntil = e, this.rateLimitStorageKeyAtArm = this.getRateLimitStorageKey(), this.persistRateLimitCooldown(e);
  }
  loadRateLimitCooldown() {
    const e = this.getRateLimitStorageKey();
    try {
      const t = this.storeManager.getItem(e);
      if (!t) return 0;
      const s = Number(t);
      return !Number.isFinite(s) || s <= Date.now() ? (this.storeManager.removeItem(e), 0) : (this.rateLimitStorageKeyAtArm = e, s);
    } catch {
      return 0;
    }
  }
  persistRateLimitCooldown(e) {
    const t = this.getActiveRateLimitKey();
    try {
      const s = this.storeManager.getItem(t);
      if (s) {
        const i = Number(s);
        if (Number.isFinite(i) && i >= e)
          return;
      }
      this.storeManager.setItem(t, String(e));
    } catch {
    }
  }
  clearRateLimitCooldown() {
    const e = this.getActiveRateLimitKey();
    try {
      const t = this.storeManager.getItem(e);
      if (t) {
        const s = Number(t);
        if (Number.isFinite(s) && s > Date.now()) {
          this.rateLimitedUntil = s;
          return;
        }
      }
      this.storeManager.removeItem(e);
    } catch {
    }
    this.rateLimitedUntil = 0, this.rateLimitStorageKeyAtArm = null;
  }
  isRateLimited() {
    return this.rateLimitedUntil === 0 && (this.rateLimitedUntil = this.loadRateLimitCooldown()), !(this.rateLimitedUntil === 0 || Date.now() >= this.rateLimitedUntil && (this.clearRateLimitCooldown(), this.rateLimitedUntil === 0));
  }
  /**
   * Sends events synchronously using `navigator.sendBeacon()`.
   *
   * Falls back to localStorage persistence on rate-limit cooldown, beacon
   * rejection, or oversized payloads.
   */
  sendEventsQueueSync(e) {
    if (this.isRateLimited()) {
      a("debug", "Rate-limit cooldown active, skipping sync send", {
        data: {
          cooldownRemainingMs: this.rateLimitedUntil - Date.now(),
          events: e.events.length
        }
      });
      const t = this.ensureBatchMetadata(e), s = this.getPersistedData(), i = typeof s?.recoveryFailures == "number" && Number.isFinite(s.recoveryFailures) ? s.recoveryFailures : 0;
      return this.persistEventsWithFailureCount(t, i, !0), !1;
    }
    return this.sendQueueSyncInternal(e);
  }
  /**
   * Sends events asynchronously using `fetch()` with retry, circuit breaker, and 429 cooldown.
   * Persists on failure for recovery on next page load.
   */
  async sendEventsQueue(e, t) {
    const s = this.ensureBatchMetadata(e);
    try {
      const i = await this.send(s);
      return i ? (this.clearPersistedEvents(), t?.onSuccess?.(s.events.length, s.events, s)) : (this.persistEvents(s), t?.onFailure?.()), i;
    } catch (i) {
      return i instanceof b ? (this.logPermanentError("Permanent error, not retrying", i), this.clearPersistedEvents(), t?.onFailure?.(!0), !1) : (this.persistEvents(s), t?.onFailure?.(), !1);
    }
  }
  /**
   * Recovers and attempts to resend events persisted from a previous session.
   *
   * Idempotent: safe to call multiple times (recovery flag prevents concurrent attempts).
   */
  async recoverPersistedEvents(e) {
    if (this.recoveryInProgress) {
      a("debug", "Recovery already in progress, skipping duplicate attempt");
      return;
    }
    this.recoveryInProgress = !0;
    let t = null, s = 0;
    try {
      const i = this.getPersistedData();
      if (!i || !this.isDataRecent(i) || i.events.length === 0) {
        this.clearPersistedEvents();
        return;
      }
      const r = i.recoveryFailures;
      if (s = typeof r == "number" && Number.isFinite(r) && r >= 0 ? r : 0, s >= 3) {
        a("debug", `Discarding persisted events after ${s} failed recovery attempts`), this.clearPersistedEvents(), e?.onFailure?.();
        return;
      }
      if (this.isRateLimited()) {
        a("debug", "Rate-limit cooldown active, deferring recovery", {
          data: { cooldownRemainingMs: this.rateLimitedUntil - Date.now() }
        }), e?.onFailure?.();
        return;
      }
      if (t = this.ensureBatchMetadata(this.createRecoveryBody(i)), t.events.length === 0) {
        a("debug", "All persisted events exceeded the recovery age cutoff; discarding batch"), this.clearPersistedEvents();
        return;
      }
      await this.send(t) ? (this.clearPersistedEvents(), e?.onSuccess?.(i.events.length, i.events, t)) : (this.persistEventsWithFailureCount(t, s + 1, !0), e?.onFailure?.());
    } catch (i) {
      if (i instanceof b) {
        this.logPermanentError("Permanent error during recovery, clearing persisted events", i), this.clearPersistedEvents(), e?.onFailure?.();
        return;
      }
      a("error", "Failed to recover persisted events", { error: i }), t && this.persistEventsWithFailureCount(t, s + 1, !0), e?.onFailure?.();
    } finally {
      this.recoveryInProgress = !1;
    }
  }
  /**
   * Cleanup method called during `App.destroy()`. No-op — persisted events
   * intentionally kept in localStorage for recovery.
   */
  stop() {
  }
  async backoffDelay(e) {
    const t = 100 * Math.pow(2, e), s = Math.random() * 100;
    return new Promise((i) => setTimeout(i, t + s));
  }
  async send(e) {
    const t = this.ensureBatchMetadata(e, e._metadata?.idempotency_token);
    if (this.isRateLimited())
      return a("debug", "Rate-limit cooldown active, skipping send", {
        data: {
          cooldownRemainingMs: this.rateLimitedUntil - Date.now(),
          events: t.events.length
        }
      }), !1;
    if (this.consecutiveNetworkFailures >= 3) {
      const l = Date.now() - this.circuitOpenedAt;
      if (l < 12e4)
        return a("debug", "Network circuit open, skipping send", {
          data: {
            consecutiveNetworkFailures: this.consecutiveNetworkFailures,
            cooldownRemainingMs: 12e4 - l
          }
        }), !1;
    }
    const { url: s, payload: i } = this.prepareRequest(t);
    let r = !0, o = !1;
    for (let l = 1; l <= 3; l++)
      try {
        return (await this.sendWithTimeout(s, i)).ok ? (l > 1 && a("info", `Send succeeded after ${l - 1} retry attempt(s)`, {
          data: { events: t.events.length, attempt: l }
        }), this.consecutiveNetworkFailures = 0, this.circuitOpenedAt = 0, !0) : !1;
      } catch (c) {
        const d = l === 3;
        if (c instanceof b)
          throw this.consecutiveNetworkFailures = 0, this.circuitOpenedAt = 0, c;
        if (c instanceof q) {
          this.consecutiveNetworkFailures = 0, this.circuitOpenedAt = 0, this.armRateLimitCooldown(Date.now() + 6e4), a("warn", "Rate limited, skipping retries", {
            data: { events: e.events.length, attempt: l, cooldownMs: 6e4 }
          });
          break;
        }
        if (c instanceof J || (r = !1), c instanceof TypeError || (o = !0), a(
          d ? "error" : "warn",
          `Send attempt ${l} failed${d ? " (all retries exhausted)" : ", will retry"}`,
          {
            error: c,
            data: {
              events: e.events.length,
              url: s.replace(/\/\/[^/]+/, "//[DOMAIN]"),
              attempt: l,
              maxAttempts: 3
            }
          }
        ), !d) {
          await this.backoffDelay(l);
          continue;
        }
        return r ? (a("debug", "All retry attempts timed out, preserving batch for retry", {
          data: { events: t.events.length }
        }), !1) : (o ? (this.consecutiveNetworkFailures = 0, this.circuitOpenedAt = 0) : (this.consecutiveNetworkFailures = Math.min(
          this.consecutiveNetworkFailures + 1,
          3
        ), this.consecutiveNetworkFailures >= 3 && (this.circuitOpenedAt = Date.now())), !1);
      }
    return !1;
  }
  async sendWithTimeout(e, t) {
    const s = new AbortController();
    let i = !1;
    const r = setTimeout(() => {
      i = !0, s.abort();
    }, 15e3);
    try {
      const o = await fetch(e, {
        method: "POST",
        body: t,
        keepalive: !0,
        credentials: "omit",
        signal: s.signal,
        headers: {
          "Content-Type": ke
        }
      });
      if (!o.ok)
        throw o.status >= 400 && o.status < 500 && o.status !== 408 && o.status !== 429 ? new b(`HTTP ${o.status}: ${o.statusText}`, o.status) : o.status === 429 ? new q(`HTTP 429: ${o.statusText}`) : new Error(`HTTP ${o.status}: ${o.statusText}`);
      return o;
    } catch (o) {
      throw o instanceof b ? o : i ? new J("Request timed out") : o;
    } finally {
      clearTimeout(r);
    }
  }
  sendQueueSyncInternal(e) {
    const t = this.ensureBatchMetadata(e), s = this.ensureBatchMetadata(t, t._metadata?.idempotency_token), { url: i, payload: r } = this.prepareRequest(s);
    if (r.length > 65536)
      return a("warn", "Payload exceeds sendBeacon limit, persisting for recovery", {
        data: { size: r.length, limit: 65536, events: s.events.length }
      }), this.persistEvents(t), !1;
    const o = new Blob([r], { type: ke });
    if (!this.isSendBeaconAvailable())
      return a("warn", "sendBeacon not available, persisting events for recovery"), this.persistEvents(t), !1;
    const l = navigator.sendBeacon(i, o);
    return l || (a("warn", "sendBeacon rejected request, persisting events for recovery"), this.persistEvents(t)), l;
  }
  prepareRequest(e) {
    let t = Date.now();
    t < this.lastMetadataTimestamp && (t = this.lastMetadataTimestamp), this.lastMetadataTimestamp = t;
    const s = {
      ...e,
      _metadata: {
        ...e._metadata,
        idempotency_token: e._metadata?.idempotency_token ?? this.computeContentToken(e),
        referer: typeof window < "u" ? C(window.location.href, this.get("config")?.sensitiveQueryParams ?? []) : void 0,
        timestamp: t,
        client_version: qt
      }
    };
    return {
      url: this.apiUrl,
      payload: JSON.stringify(s)
    };
  }
  ensureBatchMetadata(e, t) {
    const s = e._metadata?.idempotency_token ?? t ?? this.computeContentToken(e);
    return e._metadata?.idempotency_token === s ? e : {
      ...e,
      _metadata: {
        ...e._metadata,
        idempotency_token: s
      }
    };
  }
  /**
   * Deterministic 32-bit FNV-1a hash of sorted event IDs, salted with
   * `user_id` and `session_id`. Produces the same idempotency token for the
   * same set of events across retries.
   */
  computeContentToken(e) {
    const t = e.events.map((r) => r.id).sort().join(","), s = `${e.user_id}|${e.session_id}|${t}`;
    let i = 2166136261;
    for (let r = 0; r < s.length; r++)
      i ^= s.charCodeAt(r), i = Math.imul(i, 16777619) >>> 0;
    return i.toString(16).padStart(8, "0");
  }
  getPersistedData() {
    try {
      const e = this.getQueueStorageKey(), t = this.storeManager.getItem(e);
      if (t)
        return JSON.parse(t);
    } catch (e) {
      a("debug", "Failed to parse persisted data", { error: e }), this.clearPersistedEvents();
    }
    return null;
  }
  isDataRecent(e) {
    return !e.timestamp || typeof e.timestamp != "number" ? !1 : (Date.now() - e.timestamp) / (1e3 * 60 * 60) < 2;
  }
  createRecoveryBody(e) {
    const { timestamp: t, recoveryFailures: s, ...i } = e, r = i.events ?? [], o = Date.now() - 5184e5, l = r.filter((c) => {
      const d = typeof c.timestamp == "number" ? c.timestamp : new Date(c.timestamp).getTime();
      return Number.isFinite(d) && d >= o;
    });
    return l.length < r.length && a("debug", "Recovery dropped stale events", {
      data: {
        dropped: r.length - l.length,
        kept: l.length
      }
    }), { ...i, events: l };
  }
  persistEvents(e) {
    const t = this.getPersistedData(), s = typeof t?.recoveryFailures == "number" && Number.isFinite(t.recoveryFailures) ? t.recoveryFailures : 0;
    return this.persistEventsWithFailureCount(e, s);
  }
  persistEventsWithFailureCount(e, t, s = !1) {
    try {
      const i = this.getPersistedData();
      if (!s && typeof i?.timestamp == "number") {
        const l = Date.now() - i.timestamp;
        if (l < 1e3)
          return a("debug", "Skipping persistence, another tab recently persisted events", {
            data: { timeSinceExisting: l }
          }), !0;
      }
      const r = {
        ...e,
        timestamp: Date.now(),
        ...t > 0 && { recoveryFailures: t }
      }, o = this.getQueueStorageKey();
      return this.storeManager.setItem(o, JSON.stringify(r)), !!this.storeManager.getItem(o);
    } catch (i) {
      return a("debug", "Failed to persist events", { error: i }), !1;
    }
  }
  clearPersistedEvents() {
    try {
      const e = this.getQueueStorageKey();
      this.storeManager.removeItem(e);
    } catch (e) {
      a("debug", "Failed to clear persisted events", { error: e });
    }
  }
  isSendBeaconAvailable() {
    return typeof navigator < "u" && typeof navigator.sendBeacon == "function";
  }
  logPermanentError(e, t) {
    const s = Date.now(), i = String(t.statusCode ?? "");
    (this.lastPermanentErrorLog?.key !== i || s - this.lastPermanentErrorLog.timestamp >= zt) && (a("error", e, {
      data: { status: t.statusCode, message: t.message }
    }), this.lastPermanentErrorLog = { key: i, timestamp: s });
  }
}
class ws extends _ {
  bootTime;
  bootTimestamp;
  hasPerformanceNow;
  constructor() {
    if (super(), typeof window > "u") {
      this.hasPerformanceNow = !1, this.bootTime = 0, this.bootTimestamp = 0;
      return;
    }
    this.hasPerformanceNow = typeof performance < "u" && typeof performance.now == "function", this.hasPerformanceNow ? (this.bootTime = performance.now(), this.bootTimestamp = Date.now()) : (this.bootTime = 0, this.bootTimestamp = Date.now(), a("debug", "performance.now() not available, falling back to Date.now()"));
  }
  /**
   * Returns current timestamp in milliseconds since epoch, immune to clock
   * changes during the session.
   */
  now() {
    if (!this.hasPerformanceNow)
      return Date.now();
    const e = performance.now() - this.bootTime;
    return Math.round(this.bootTimestamp + e);
  }
  /**
   * Validates a timestamp is not more than 2 minutes in the future relative
   * to the monotonic clock, so obvious clock-skew events are flagged before
   * they hit the wire.
   */
  validateTimestamp(e) {
    const s = e - this.now();
    return s > 12e4 ? {
      valid: !1,
      error: `Timestamp is ${(s / 1e3 / 60).toFixed(2)} minutes in the future (max allowed: 2 minutes)`
    } : { valid: !0 };
  }
}
const As = new Set(Object.values(u));
class Ms extends _ {
  dataSenders;
  emitter;
  timeManager;
  recentEventFingerprints = /* @__PURE__ */ new Map();
  perEventRateLimits = /* @__PURE__ */ new Map();
  eventsQueue = [];
  pendingEventsBuffer = [];
  sendTimeoutId = null;
  sendInProgress = !1;
  consecutiveSendFailures = 0;
  rateLimitCounter = 0;
  rateLimitWindowStart = 0;
  lastSessionId = null;
  // Set when a sync flush is requested mid-async-send; drained by the async
  // finally block. See `drainPendingSyncFlush` for the full rationale.
  pendingSyncFlush = !1;
  sessionEventCounts = {
    total: 0,
    [u.CLICK]: 0,
    [u.PAGE_VIEW]: 0,
    [u.CUSTOM]: 0,
    [u.SCROLL]: 0
  };
  saveSessionCountsDebounced = null;
  /**
   * Creates an EventManager instance.
   *
   * @param storeManager - Storage manager for persistence
   * @param emitter - Optional event emitter for local event consumption
   */
  constructor(e, t = null) {
    super(), this.emitter = t, this.timeManager = new ws(), this.dataSenders = [];
    const s = this.get("apiUrl");
    s && this.dataSenders.push(new Is(e, s)), this.saveSessionCountsDebounced = this.debounce((i) => {
      this.saveSessionCounts(i);
    }, 500), this.cleanupExpiredSessionCounts();
  }
  /**
   * Recovers persisted events from localStorage after a crash or page reload.
   *
   * **Purpose**: Ensures zero data loss by recovering events that failed to send
   * in the previous session due to network errors or crashes.
   *
   * **Flow**:
   * 1. Calls `recoverPersistedEvents()` on the SenderManager (if any)
   * 2. The SenderManager attempts to resend its persisted events to the endpoint
   * 3. On success: Removes recovered events from consent/pending buffers
   * 4. On failure: Logs warning (events remain in localStorage for next attempt)
   *
   * **Called by**: `App.init()` after initialization
   *
   * **Important**: Events are NOT removed from pending/consent buffers until
   * successful network transmission.
   */
  async recoverPersistedEvents() {
    const e = this.dataSenders.map(
      async (t) => t.recoverPersistedEvents({
        onSuccess: (s, i, r) => {
          if (i && i.length > 0) {
            const o = i.map((l) => l.id);
            this.removeProcessedEvents(o), r && this.emitEventsQueue(r);
          }
        },
        onFailure: () => {
          a("debug", "Failed to recover persisted events");
        }
      })
    );
    await Promise.allSettled(e);
  }
  /**
   * Tracks a user interaction event and adds it to the event queue.
   *
   * **Purpose**: Central tracking method for all analytics events (clicks, page views,
   * custom events, web vitals, errors, scroll, viewport visibility, session start/end).
   *
   * **Validation & Buffering**:
   * - Validates `type` is provided (required)
   * - If session not initialized: Buffers in `pendingEventsBuffer` (max 100 events, FIFO)
   *
   * **Rate Limiting** (non-critical events only):
   * - Global: 50 events/second sliding window (critical events exempted)
   * - Per-event-name: 60/minute for custom events (configurable via `maxSameEventPerMinute`)
   * - Per-session total: 1000 events max
   * - Per-session by type: Clicks 500, Page views 100, Custom 500, Viewport 200, Scroll 120
   *
   * **Deduplication**:
   * - LRU cache with 1000 fingerprints (10px coordinate precision for clicks, 500ms time threshold)
   * - Prevents duplicate events within 500ms window
   * - SESSION_START protected by `hasStartSession` flag
   *
   * **Sampling**:
   * - Applied after validation and rate limiting
   * - Critical events (SESSION_START/END) always included
   * - Configurable via `samplingRate` (0-1)
   *
   * **Queue Management**:
   * - Events added to `eventsQueue` (max 100 events, FIFO with priority for session events)
   * - Dynamic flush: Immediate send when 50-event batch threshold reached
   * - Periodic flush: Every 10 seconds
   *
   * **QA Mode**:
   * - Custom events are logged and emitted locally only; they are not queued or sent
   *
   * @param eventData - Event data to track
   *
   * @example
   * ```typescript
   * eventManager.track({
   *   type: EventType.CLICK,
   *   click_data: { x: 0.5, y: 0.3, tag: 'button', text: 'Submit' }
   * });
   *
   * eventManager.track({
   *   type: EventType.CUSTOM,
   *   custom_event: { name: 'checkout_completed', metadata: { total: 99.99 } }
   * });
   * ```
   */
  track({
    type: e,
    page_url: t,
    from_page_url: s,
    scroll_data: i,
    click_data: r,
    custom_event: o,
    web_vitals: l,
    error_data: c,
    page_view: d
  }) {
    if (!e) {
      a("error", "Event type is required - event will be ignored");
      return;
    }
    if (!As.has(e)) {
      a("error", "Invalid event type - event will be ignored", {
        data: { type: e }
      });
      return;
    }
    const h = this.get("sessionId");
    if (!h) {
      this.pendingEventsBuffer.length >= 100 && (this.pendingEventsBuffer.shift(), a("debug", "Pending events buffer full - dropping oldest event", {
        data: { maxBufferSize: 100 }
      })), this.pendingEventsBuffer.push({
        type: e,
        page_url: t,
        from_page_url: s,
        scroll_data: i,
        click_data: r,
        custom_event: o,
        web_vitals: l,
        error_data: c,
        page_view: d
      });
      return;
    }
    this.lastSessionId !== h && (this.lastSessionId = h, this.sessionEventCounts = this.loadSessionCounts(h));
    const p = e === u.SESSION_START;
    if (p && a("debug", "Processing SESSION_START event", {
      data: { sessionId: h }
    }), !p && !this.checkRateLimit())
      return;
    const S = e;
    if (!p) {
      if (this.sessionEventCounts.total >= 1e3) {
        a("warn", "Session event limit reached", {
          data: {
            type: S,
            total: this.sessionEventCounts.total,
            limit: 1e3
          }
        });
        return;
      }
      const T = this.getTypeLimitForEvent(S);
      if (T) {
        const oe = this.sessionEventCounts[S];
        if (oe !== void 0 && oe >= T) {
          a("warn", "Session event type limit reached", {
            data: {
              type: S,
              count: oe,
              limit: T
            }
          });
          return;
        }
      }
    }
    if (S === u.CUSTOM && o?.name) {
      const T = this.get("config")?.maxSameEventPerMinute ?? 60;
      if (!this.checkPerEventRateLimit(o.name, T))
        return;
    }
    const pt = S === u.SESSION_START, St = t || this.get("pageUrl"), W = this.buildEventPayload({
      type: S,
      page_url: St,
      from_page_url: s,
      scroll_data: i,
      click_data: r,
      custom_event: o,
      web_vitals: l,
      error_data: c,
      page_view: d
    });
    if (W && !(!p && S !== u.WEB_VITALS && !this.shouldSample())) {
      if (pt) {
        const T = this.get("sessionId");
        if (!T) {
          a("error", "Session start event requires sessionId - event will be ignored");
          return;
        }
        if (this.get("hasStartSession")) {
          a("debug", "Duplicate session_start detected", {
            data: { sessionId: T }
          });
          return;
        }
        this.set("hasStartSession", !0);
      }
      if (!this.isDuplicateEvent(W)) {
        if (this.get("mode") === Z.QA && S === u.CUSTOM && o) {
          a("info", `Custom Event: ${o.name}`, {
            visibility: "qa",
            data: {
              name: o.name,
              ...o.metadata && { metadata: o.metadata }
            }
          }), this.emitEvent(W);
          return;
        }
        if (this.addToQueue(W), !p) {
          this.sessionEventCounts.total++, this.sessionEventCounts[S] !== void 0 && this.sessionEventCounts[S]++;
          const T = this.get("sessionId");
          T && this.saveSessionCountsDebounced && this.saveSessionCountsDebounced(T);
        }
      }
    }
  }
  /**
   * Stops event tracking and clears all queues and buffers.
   *
   * **Purpose**: Cleanup method called during `App.destroy()` to reset EventManager state
   * and allow subsequent init() → destroy() → init() cycles.
   *
   * **Cleanup Actions**:
   * 1. **Clear send timeout**: Cancels pending queue flush timeout and resets backoff state
   * 2. **Clear all queues and buffers**:
   *    - `eventsQueue`: Discarded (not sent)
   *    - `pendingEventsBuffer`: Discarded (events before session init)
   * 3. **Reset rate limiting state**: Clears rate limit counters and per-event limits
   * 4. **Reset session counters**: Clears per-session event counts
   * 5. **Reset `hasStartSession` flag**: Allows SESSION_START in next init cycle
   * 6. **Stop SenderManager**: Calls `stop()` on the SenderManager (if any)
   *
   * **Important Behavior**:
   * - **No final flush**: `stop()` itself does NOT send queued events
   * - `App.destroy()` calls `flushImmediatelySync()` before `stop()` automatically
   *
   * **Called by**: `App.destroy()` during application teardown
   *
   * @example
   * ```typescript
   * // Proper cleanup with final flush
   * eventManager.flushImmediatelySync(); // Send pending events
   * eventManager.stop();                  // Stop and clear
   * ```
   */
  stop() {
    this.clearSendTimeout(), this.sendInProgress = !1, this.pendingSyncFlush = !1, this.consecutiveSendFailures = 0;
    const e = this.get("sessionId");
    e && this.saveSessionCounts(e), this.eventsQueue = [], this.pendingEventsBuffer = [], this.recentEventFingerprints.clear(), this.rateLimitCounter = 0, this.rateLimitWindowStart = 0, this.perEventRateLimits.clear(), this.sessionEventCounts = {
      total: 0,
      [u.CLICK]: 0,
      [u.PAGE_VIEW]: 0,
      [u.CUSTOM]: 0,
      [u.SCROLL]: 0
    }, this.lastSessionId = null, this.set("hasStartSession", !1), this.dataSenders.forEach((t) => {
      t.stop();
    });
  }
  /**
   * Flushes all events in the queue asynchronously.
   *
   * **Purpose**: Force immediate sending of queued events without waiting for
   * the scheduled queue flush timeout.
   *
   * **Use Cases**:
   * - Manual flush triggered by user action
   * - Before page unload (prefer `flushImmediatelySync()` for unload scenarios)
   * - Testing/debugging
   *
   * **Behavior**:
   * - Sends events via `fetch()` API (async, reliable, allows retries)
   * - Does NOT block (returns Promise that resolves when all sends complete)
   * - Clears queue only after successful transmission
   *
   * **Note**: For page unload, use `flushImmediatelySync()` instead,
   * which uses `sendBeacon()` for guaranteed delivery.
   *
   * @returns Promise resolving to `true` if the endpoint accepted the batch
   *          during this call (optimistic removal — failures persist for
   *          retry). `false` if no events, all
   *          senders failed, or a flush is already in flight.
   *
   * @example
   * ```typescript
   * // Before critical user action
   * await eventManager.flushImmediately();
   * ```
   *
   * @see flushImmediatelySync for synchronous page unload flush
   */
  async flushImmediately() {
    return this.flushEvents(!1);
  }
  /**
   * Flushes all events in the queue synchronously using `sendBeacon()`.
   *
   * **Purpose**: Ensure events are sent before page unload, even if network is slow.
   *
   * **Use Cases**:
   * - Page unload (`beforeunload`, `pagehide` events)
   * - Tab close detection
   * - Any scenario where async flush might be interrupted
   *
   * **Behavior**:
   * - Uses `navigator.sendBeacon()` API (synchronous, queued by browser)
   * - Payload size limited to 64KB per beacon
   * - Browser guarantees delivery attempt (queued even if page closes)
   * - Clears queue immediately (no retry mechanism)
   *
   * **Limitations**:
   * - No retry on failure (sendBeacon is fire-and-forget)
   * - 64KB payload limit (large batches may be truncated)
   *
   * **In-flight contract**: if an async send is already running this call is
   * deferred (queued for replay in the async send's `finally` block) and
   * returns `false` — nothing has been delivered yet at the point of return.
   * Mirrors `flushImmediately()`'s behaviour for the same condition.
   *
   * @returns `true` if the endpoint accepted the beacon batch
   *          *during this call*, `false` otherwise (no events, all senders
   *          failed, or the call was deferred behind an in-flight async send)
   *
   * @example
   * ```typescript
   * // Page unload handler
   * window.addEventListener('beforeunload', () => {
   *   eventManager.flushImmediatelySync();
   * });
   * ```
   *
   * @see flushImmediately for async flush with retries
   */
  flushImmediatelySync() {
    return this.flushEvents(!0);
  }
  /**
   * Returns the current number of events in the main queue.
   *
   * **Purpose**: Debugging and monitoring utility to check queue length.
   *
   * **Note**: This does NOT include:
   * - Pending events buffer (events before session init)
   * - Consent events buffer (events awaiting consent)
   * - Persisted events (events in localStorage from previous sessions)
   *
   * @returns Number of events currently in the main queue
   *
   * @example
   * ```typescript
   * const queueSize = eventManager.getQueueLength();
   * console.log(`Queue has ${queueSize} events`);
   * ```
   */
  getQueueLength() {
    return this.eventsQueue.length;
  }
  /**
   * Returns a copy of current events in the queue.
   *
   * **Purpose**: Test utility to inspect queued events for validation.
   *
   * **Note**: Only available in development mode via TestBridge.
   *
   * @returns Shallow copy of events queue
   * @internal Used by test-bridge.ts for test inspection
   */
  getQueueEvents() {
    return this.eventsQueue.map(({ _session_id: e, ...t }) => t);
  }
  /**
   * Triggers immediate queue flush (test utility).
   *
   * **Purpose**: Test utility to manually flush event queue for validation.
   *
   * **Note**: Only available in development mode via TestBridge.
   *
   * @returns Promise that resolves when flush completes
   * @internal Used by test-bridge.ts for test control
   */
  async flushQueue() {
    await this.flushImmediately();
  }
  /**
   * Clears the event queue (test utility - use with caution).
   *
   * **Purpose**: Test utility to reset queue state between tests.
   *
   * **Warning**: This will discard all queued events without sending them.
   * Only use in test cleanup or when explicitly required.
   *
   * **Note**: Only available in development mode via TestBridge.
   *
   * @internal Used by test-bridge.ts for test cleanup
   */
  clearQueue() {
    this.eventsQueue = [];
  }
  /**
   * Flushes buffered events to the main queue after session initialization.
   *
   * **Purpose**: Re-tracks events that were captured before session initialization
   * (e.g., events fired during `App.init()` before SessionManager completes).
   *
   * **Pending Events Buffer**:
   * - Holds up to 100 events captured before `sessionId` is available
   * - FIFO eviction when buffer full (oldest events dropped with warning)
   * - Cleared and re-tracked when session becomes available
   *
   * **Flow**:
   * 1. Check if session is initialized (`sessionId` exists in global state)
   * 2. If not initialized: Log warning and keep events in buffer
   * 3. If initialized: Copy buffer, clear it, and re-track each event via `track()`
   * 4. Each event goes through full validation/dedup/rate limiting pipeline
   *
   * **Called by**:
   * - `SessionManager.startTracking()` after session initialization
   * - Ensures no events are lost during initialization phase
   *
   * **Important**: Events are re-tracked through `track()` method, so they go
   * through all validation, deduplication, rate limiting, and consent checks again.
   *
   * @example
   * ```typescript
   * // In SessionManager after session creation
   * this.set('sessionId', newSessionId);
   * eventManager.flushPendingEvents(); // Re-track buffered events
   * ```
   */
  flushPendingEvents() {
    if (this.pendingEventsBuffer.length === 0)
      return;
    if (!this.get("sessionId")) {
      a("debug", "Cannot flush pending events: session not initialized - keeping in buffer", {
        data: { bufferedEventCount: this.pendingEventsBuffer.length }
      });
      return;
    }
    const t = [...this.pendingEventsBuffer];
    this.pendingEventsBuffer = [], t.forEach((s) => {
      this.track(s);
    });
  }
  clearSendTimeout() {
    this.sendTimeoutId !== null && (clearTimeout(this.sendTimeoutId), this.sendTimeoutId = null);
  }
  isSuccessfulResult(e) {
    return e.status === "fulfilled" && e.value === !0;
  }
  /**
   * Groups the queue by frozen `_session_id`, preserving insertion order.
   * Single pass — `buildBatchesWithIds()` builds one batch + one eventIds list
   * per group, so the grouping cost is O(N) per flush regardless of session
   * count.
   *
   * **Self-heal**: any entry missing `_session_id` (an internal invariant
   * violation — `buildEventPayload` always stamps it) is removed from the
   * queue rather than left behind, otherwise a single corrupted entry would
   * keep `eventsQueue.length > 0` forever and re-trigger periodic sends.
   */
  groupQueuedEventsBySession() {
    const e = /* @__PURE__ */ new Map(), t = [];
    for (const s of this.eventsQueue) {
      if (!s._session_id) {
        a("debug", "Queued event missing _session_id, dropping", {
          data: { eventId: s.id, type: s.type }
        }), t.push(s.id);
        continue;
      }
      const i = e.get(s._session_id);
      i ? i.push(s) : e.set(s._session_id, [s]);
    }
    return t.length > 0 && this.removeProcessedEvents(t), e;
  }
  /**
   * Builds a parallel list of `(batch, eventIds)` for sending. The eventIds are
   * the original `_session_id`-tagged event IDs in the queue that map to this
   * batch — used for optimistic removal. We can't read them off the wrapper's
   * `events[]` because dedup may have removed some signatures.
   */
  buildBatchesWithIds() {
    const e = this.groupQueuedEventsBySession();
    if (e.size === 0) return [];
    const t = [];
    for (const [s, i] of e)
      t.push({
        batch: this.buildBatchFromGroup(s, i),
        eventIds: i.map((r) => r.id)
      });
    return t;
  }
  flushEvents(e) {
    if (this.eventsQueue.length === 0)
      return e ? !0 : Promise.resolve(!0);
    if (!e && this.sendInProgress)
      return a("debug", "Async flush skipped: send already in progress"), Promise.resolve(!1);
    const t = this.buildBatchesWithIds();
    if (t.length === 0)
      return e ? !0 : Promise.resolve(!0);
    if (this.dataSenders.length === 0) {
      for (const { batch: s, eventIds: i } of t)
        this.removeProcessedEvents(i), this.emitEventsQueue(s);
      return this.clearSendTimeout(), e ? !0 : Promise.resolve(!0);
    }
    if (e && this.sendInProgress) {
      const s = t.reduce((i, r) => i + r.eventIds.length, 0);
      return this.pendingSyncFlush = !0, a("debug", "Sync flush deferred: async send in-flight, will retry on settle", {
        data: { eventCount: s }
      }), !1;
    }
    if (e) {
      const s = t.map(({ batch: i, eventIds: r }) => this.sendBatchSync(i, r));
      return this.settleSendTimeout(), s.some(Boolean);
    }
    return this.sendInProgress = !0, (async () => {
      try {
        const s = await Promise.all(
          t.map(async ({ batch: i, eventIds: r }) => this.sendBatchAsync(i, r))
        );
        return this.settleSendTimeout(), s.some(Boolean);
      } finally {
        this.sendInProgress = !1, this.drainPendingSyncFlush();
      }
    })();
  }
  /**
   * Reconciles the periodic send timer after a flush attempt. Clears the
   * timer when the queue is empty, otherwise (re)schedules a retry tick.
   *
   * **Why**: a `flushImmediately()` / `flushImmediatelySync()` call that
   * fails leaves events in `eventsQueue` for retry. The periodic
   * timer is the safety net that drains them when the endpoint recovers — if
   * we cleared it unconditionally here, the queue would sit untouched until
   * the next tracked event resurrects the timer in `addToQueue`. Mirrors the
   * pattern in `sendEventsQueue()` (the periodic path).
   */
  settleSendTimeout() {
    this.eventsQueue.length === 0 ? this.clearSendTimeout() : this.scheduleSendTimeout();
  }
  /**
   * Re-runs a sync flush that was deferred while an async send was in flight.
   *
   * Called from the `finally` blocks of `flushEvents(false)` and
   * `sendEventsQueue()`. If `pendingSyncFlush` is set, clears the flag and
   * invokes `flushImmediatelySync()` synchronously so any events that arrived
   * after the deferred sync call are delivered before the next event loop
   * tick. Critical for high-stakes events tracked mid-async-send.
   */
  drainPendingSyncFlush() {
    this.pendingSyncFlush && (this.pendingSyncFlush = !1, this.flushImmediatelySync());
  }
  /**
   * Sends one batch synchronously (sendBeacon path).
   * Optimistic removal: on success, we remove the batch's events from the
   * queue and emit it locally. Failures persist for retry.
   */
  sendBatchSync(e, t) {
    const i = this.dataSenders.map((r) => r.sendEventsQueueSync(e)).some((r) => r);
    return i ? (this.removeProcessedEvents(t), this.emitEventsQueue(e)) : a("debug", "Sync send complete failure, events kept in queue for retry", {
      data: { eventCount: t.length, sessionId: e.session_id }
    }), i;
  }
  /**
   * Sends one batch asynchronously (fetch path).
   */
  async sendBatchAsync(e, t) {
    let s = 0;
    const i = this.dataSenders.map(
      async (l) => l.sendEventsQueue(e, {
        onFailure: (c) => {
          c && s++;
        }
      })
    ), r = await Promise.allSettled(i), o = r.some((l) => this.isSuccessfulResult(l));
    if (o) {
      this.removeProcessedEvents(t), this.emitEventsQueue(e);
      const l = r.filter((c) => !this.isSuccessfulResult(c)).length;
      l > 0 && a("debug", "Async send completed with some failures, removed from queue and persisted", {
        data: { eventCount: t.length, failedCount: l, sessionId: e.session_id }
      });
    } else s === this.dataSenders.length ? (this.removeProcessedEvents(t), a("debug", "Batch rejected by the endpoint, events discarded", {
      data: { eventCount: t.length, sessionId: e.session_id }
    })) : a("debug", "Async send complete failure, events kept in queue for retry", {
      data: { eventCount: t.length, sessionId: e.session_id }
    });
    return o;
  }
  async sendEventsQueue() {
    if (!(this.eventsQueue.length === 0 || this.sendInProgress)) {
      this.sendInProgress = !0;
      try {
        const e = this.buildBatchesWithIds();
        if (e.length === 0) return;
        if (this.dataSenders.length === 0) {
          for (const { batch: i, eventIds: r } of e)
            this.removeProcessedEvents(r), this.emitEventsQueue(i);
          return;
        }
        (await Promise.all(
          e.map(async ({ batch: i, eventIds: r }) => this.sendBatchAsync(i, r))
        )).some(Boolean) ? this.consecutiveSendFailures = 0 : this.consecutiveSendFailures = Math.min(this.consecutiveSendFailures + 1, 5), this.eventsQueue.length === 0 ? this.clearSendTimeout() : this.scheduleSendTimeout();
      } finally {
        this.sendInProgress = !1, this.drainPendingSyncFlush();
      }
    }
  }
  /**
   * Builds a single batch from a per-session group: dedup by signature,
   * SESSION_START first, then timestamp order, strip `_session_id`.
   *
   * **Why N batches per flush**: events freeze their `_session_id` at `track()`
   * time. If the session was renewed (idle timeout) between two `track()`
   * calls, the queue contains events from multiple sessions. `buildBatchesWithIds()`
   * emits one batch per session so the batch's `session_id`
   * remains the single source of truth and stays consistent with the events it
   * carries.
   *
   * **Strip**: `_session_id` is removed from each event in the wrapper's
   * `events[]` because it is internal bookkeeping, not part of the wire shape.
   */
  buildBatchFromGroup(e, t) {
    const s = /* @__PURE__ */ new Map(), i = [];
    for (const d of t) {
      const h = this.createEventSignature(d);
      s.has(h) || i.push(h), s.set(h, d);
    }
    const r = i.map((d) => s.get(d)).filter((d) => !!d).sort((d, h) => d.type === u.SESSION_START && h.type !== u.SESSION_START ? -1 : h.type === u.SESSION_START && d.type !== u.SESSION_START ? 1 : d.timestamp - h.timestamp).map(({ _session_id: d, ...h }) => h), o = this.get("config")?.globalMetadata, l = this.get("identity");
    return {
      user_id: this.get("userId"),
      session_id: e,
      device: this.get("device"),
      events: r,
      ...o && { global_metadata: o },
      ...l && { identify: l }
    };
  }
  buildEventPayload(e) {
    const t = this.get("sessionId");
    if (!t)
      return a("error", "buildEventPayload reached without sessionId — event dropped", {
        data: { type: e.type },
        visibility: "critical"
      }), null;
    const s = e.page_url ?? this.get("pageUrl"), i = typeof s == "string" && s.length > 0 ? s : "unknown", r = this.timeManager.now(), o = this.timeManager.validateTimestamp(r);
    o.valid || a("warn", "Event timestamp validation failed", {
      data: { type: e.type, error: o.error }
    });
    const l = this.get("sessionReferrer"), c = this.get("sessionUtm"), d = this.get("sessionClickIds");
    return { ...{
      id: rs(),
      type: e.type,
      page_url: i,
      timestamp: r,
      ...l && { referrer: l },
      ...e.from_page_url && { from_page_url: e.from_page_url },
      ...e.scroll_data && { scroll_data: e.scroll_data },
      ...e.click_data && { click_data: e.click_data },
      ...e.custom_event && { custom_event: e.custom_event },
      ...e.web_vitals && { web_vitals: e.web_vitals },
      ...e.error_data && { error_data: e.error_data },
      ...e.page_view && { page_view: e.page_view },
      ...c && { utm: c },
      ...d && { click_ids: d }
    }, _session_id: t };
  }
  isDuplicateEvent(e) {
    const t = Date.now(), s = this.createEventFingerprint(e), i = this.recentEventFingerprints.get(s);
    return i && t - i < 1e3 ? (this.recentEventFingerprints.set(s, t), !0) : (this.recentEventFingerprints.set(s, t), this.recentEventFingerprints.size > 1500 && this.pruneOldFingerprints(), this.recentEventFingerprints.size > 3e3 && (this.recentEventFingerprints.clear(), this.recentEventFingerprints.set(s, t), a("debug", "Event fingerprint cache exceeded hard limit, cleared", {
      data: { hardLimit: 3e3 }
    })), !1);
  }
  pruneOldFingerprints() {
    const e = Date.now(), t = 1e3 * 10;
    for (const [s, i] of this.recentEventFingerprints.entries())
      e - i > t && this.recentEventFingerprints.delete(s);
    a("debug", "Pruned old event fingerprints", {
      data: {
        remaining: this.recentEventFingerprints.size,
        cutoffMs: t
      }
    });
  }
  createEventFingerprint(e) {
    let t = `${e.type}_${e.page_url}`;
    if (e.click_data) {
      const s = Math.round((e.click_data.x || 0) / 10) * 10, i = Math.round((e.click_data.y || 0) / 10) * 10;
      t += `_click_${s}_${i}`;
    }
    return e.scroll_data && (t += `_scroll_${e.scroll_data.depth}_${e.scroll_data.direction}`), e.custom_event && (t += `_custom_${e.custom_event.name}`, e.custom_event.metadata && (t += `_${this.stableStringify(e.custom_event.metadata)}`)), e.web_vitals && (t += `_vitals_${this.stableStringify(e.web_vitals)}`), e.error_data && (t += `_error_${e.error_data.type}_${e.error_data.message}`), t;
  }
  createEventSignature(e) {
    return this.createEventFingerprint(e);
  }
  /** Deterministic JSON string with sorted keys to ensure consistent fingerprints regardless of property insertion order */
  stableStringify(e) {
    return JSON.stringify(e, (t, s) => s && typeof s == "object" && !Array.isArray(s) ? Object.keys(s).sort().reduce((i, r) => (i[r] = s[r], i), {}) : s);
  }
  addToQueue(e) {
    if (this.emitEvent(e), this.eventsQueue.push(e), this.eventsQueue.length > 100) {
      const t = this.eventsQueue.findIndex((i) => i.type !== u.SESSION_START), s = t >= 0 ? this.eventsQueue.splice(t, 1)[0] : this.eventsQueue.shift();
      a("warn", "Event queue overflow, oldest non-critical event removed", {
        data: {
          maxLength: 100,
          currentLength: this.eventsQueue.length,
          removedEventType: s?.type,
          wasCritical: s?.type === u.SESSION_START
        }
      });
    }
    this.scheduleSendTimeout(), this.eventsQueue.length >= 50 && this.consecutiveSendFailures < 5 && this.sendEventsQueue();
  }
  scheduleSendTimeout() {
    if (this.sendTimeoutId !== null) return;
    const e = this.calculateSendDelay();
    this.sendTimeoutId = window.setTimeout(() => {
      this.sendTimeoutId = null, this.eventsQueue.length > 0 && this.sendEventsQueue();
    }, e);
  }
  calculateSendDelay() {
    const e = this.get("config")?.sendIntervalMs ?? 1e4;
    if (this.consecutiveSendFailures === 0) return e;
    const t = e * Math.pow(2, this.consecutiveSendFailures);
    return Math.min(t, 12e4);
  }
  shouldSample() {
    const e = this.get("config")?.samplingRate ?? 1;
    return Math.random() < e;
  }
  checkRateLimit() {
    const e = Date.now();
    return e - this.rateLimitWindowStart > 1e3 && (this.rateLimitCounter = 0, this.rateLimitWindowStart = e), this.rateLimitCounter >= 50 ? !1 : (this.rateLimitCounter++, !0);
  }
  checkPerEventRateLimit(e, t) {
    const s = Date.now(), r = (this.perEventRateLimits.get(e) ?? []).filter((o) => s - o < 6e4);
    return r.length >= t ? (a("warn", "Per-event rate limit exceeded for custom event", {
      data: {
        eventName: e,
        limit: t,
        window: `${6e4 / 1e3}s`
      }
    }), !1) : (r.push(s), this.perEventRateLimits.set(e, r), !0);
  }
  getTypeLimitForEvent(e) {
    return {
      [u.CLICK]: 500,
      [u.PAGE_VIEW]: 100,
      [u.CUSTOM]: 500,
      [u.SCROLL]: 120
    }[e] ?? null;
  }
  removeProcessedEvents(e) {
    const t = new Set(e);
    this.eventsQueue = this.eventsQueue.filter((s) => !t.has(s.id));
  }
  emitEvent(e) {
    if (this.emitter) {
      const { _session_id: t, ...s } = e;
      this.emitter.emit(B.EVENT, s);
    }
  }
  emitEventsQueue(e) {
    this.emitter && this.emitter.emit(B.QUEUE, e);
  }
  /**
   * Creates a debounced version of a function that delays execution until after
   * a specified wait time has elapsed since the last invocation.
   *
   * **Purpose**: Reduces frequency of expensive operations (localStorage writes)
   * while ensuring no data is lost (trailing edge execution).
   *
   * **Behavior**:
   * - Each call resets the timer
   * - Function executes only after `delay` ms of silence
   * - Last invocation always executes (trailing edge)
   *
   * **Use Case**: Batches rapid successive calls into a single execution
   *
   * @param fn - Function to debounce
   * @param delay - Delay in milliseconds
   * @returns Debounced version of the function
   *
   * @internal
   */
  debounce(e, t) {
    let s = null;
    return ((...i) => {
      s !== null && clearTimeout(s), s = setTimeout(() => {
        e(...i), s = null;
      }, t);
    });
  }
  /**
   * Returns initial zero counts for session event tracking.
   *
   * **Purpose**: DRY helper to avoid duplicating initial counts structure
   * across multiple methods (loadSessionCounts, validation fallbacks).
   *
   * @returns Fresh SessionEventCounts object with all counters at zero
   *
   * @internal
   */
  getInitialCounts() {
    return {
      total: 0,
      [u.CLICK]: 0,
      [u.PAGE_VIEW]: 0,
      [u.CUSTOM]: 0,
      [u.SCROLL]: 0
    };
  }
  /**
   * Loads persisted session event counts from localStorage.
   *
   * **Purpose**: Restore per-session event counts after page reload to maintain
   * accurate rate limiting across page navigations within the same session.
   *
   * **Behavior**:
   * - Attempts to load counts from localStorage using session ID as key
   * - If no persisted data found: Returns initial zero counts
   * - If corrupted data found: Returns initial zero counts with warning
   *
   * **Storage Key**: `spoorly:{userId}:session_counts:{sessionId}`
   *
   * **Why This Matters**:
   * - Without persistence, counts reset on every page reload
   * - This allows users to bypass per-session limits by refreshing the page
   * - Example: 100 PAGE_VIEW limit could be bypassed by reloading after 99 events
   *
   * @param sessionId - Current session identifier
   * @returns Session event counts object (either persisted or initial state)
   *
   * @internal
   */
  loadSessionCounts(e) {
    if (typeof window > "u" || typeof localStorage > "u")
      return this.getInitialCounts();
    const t = this.get("userId") || "anonymous", s = Fe(t, e);
    try {
      const i = localStorage.getItem(s);
      if (!i)
        return this.getInitialCounts();
      const r = JSON.parse(i);
      return r._timestamp && Date.now() - r._timestamp > Ve ? (a("debug", "Session counts expired, clearing", {
        data: { sessionId: e, age: Date.now() - r._timestamp }
      }), localStorage.removeItem(s), this.getInitialCounts()) : typeof r.total == "number" && typeof r[u.CLICK] == "number" && typeof r[u.PAGE_VIEW] == "number" && typeof r[u.CUSTOM] == "number" && typeof r[u.SCROLL] == "number" ? {
        total: r.total,
        [u.CLICK]: r[u.CLICK],
        [u.PAGE_VIEW]: r[u.PAGE_VIEW],
        [u.CUSTOM]: r[u.CUSTOM],
        [u.SCROLL]: r[u.SCROLL]
      } : (a("warn", "Invalid session counts structure in localStorage, resetting", {
        data: { sessionId: e, parsed: r }
      }), localStorage.removeItem(s), a("debug", "Session counts removed due to invalid/corrupted data", {
        data: { sessionId: e, parsed: r }
      }), this.getInitialCounts());
    } catch (i) {
      return a("warn", "Failed to load session counts from localStorage", {
        error: i,
        data: { sessionId: e }
      }), this.getInitialCounts();
    }
  }
  /**
   * Cleans up expired session counts from localStorage.
   *
   * **Purpose**: Prevents localStorage pollution from abandoned sessions by removing
   * counts older than 7 days.
   *
   * **Behavior**:
   * - Checks if cleanup was run recently (within last hour) and skips if so
   * - Iterates all localStorage keys matching the session counts prefix pattern
   * - Parses each entry and checks `_timestamp` field
   * - Removes entries where age exceeds SESSION_COUNTS_EXPIRY_MS (7 days)
   * - Silently ignores parse errors (corrupted entries cleaned on next load)
   * - Updates last cleanup timestamp after successful run
   *
   * **When Called**: Automatically on EventManager constructor initialization
   *
   * **Performance**: O(n) scan where n = localStorage keys (typically <100), but throttled
   * to run at most once per hour to prevent impact on rapid page reloads
   *
   * @internal
   */
  cleanupExpiredSessionCounts() {
    if (!(typeof window > "u" || typeof localStorage > "u"))
      try {
        const e = localStorage.getItem(He);
        if (e) {
          const r = Date.now() - parseInt(e, 10);
          if (r < xe) {
            a("debug", "Skipping session counts cleanup (throttled)", {
              data: { timeSinceLastCleanup: r, throttleMs: xe }
            });
            return;
          }
        }
        const t = this.get("userId") || "anonymous", s = `${m}:${t}:session_counts:`, i = [];
        for (let r = 0; r < localStorage.length; r++) {
          const o = localStorage.key(r);
          if (o?.startsWith(s))
            try {
              const l = localStorage.getItem(o);
              if (l) {
                const c = JSON.parse(l);
                c._timestamp && Date.now() - c._timestamp > Ve && i.push(o);
              }
            } catch {
            }
        }
        i.forEach((r) => {
          localStorage.removeItem(r), a("debug", "Cleaned up expired session counts", { data: { key: r } });
        }), i.length > 0 && a("info", `Cleaned up ${i.length} expired session counts entries`), localStorage.setItem(He, Date.now().toString());
      } catch (e) {
        a("warn", "Failed to cleanup expired session counts", { error: e });
      }
  }
  /**
   * Persists current session event counts to localStorage (debounced).
   *
   * **Purpose**: Save event counts to ensure they survive page reloads and
   * maintain accurate per-session rate limiting across navigations.
   *
   * **Behavior**:
   * - Saves current `sessionEventCounts` to localStorage using session ID as key
   * - Overwrites previous counts (always reflects latest state)
   * - Fails silently if localStorage quota exceeded or unavailable
   *
   * **Storage Key**: `spoorly:{userId}:session_counts:{sessionId}`
   *
   * **Debouncing**: This method is called via `saveSessionCountsDebounced()`
   * with 500ms debounce delay. Direct calls are for immediate saves (e.g., stop()).
   *
   * **Performance**: Debouncing reduces localStorage writes from ~1000 per session
   * to ~20-30 (96-97% reduction) while maintaining data integrity.
   *
   * **Cleanup**: Counts persist across page reloads for rate limiting enforcement.
   * Automatic cleanup on page reload removes expired counts (older than 7 days).
   * Note: SESSION_COUNTS_KEY entries are intentionally persistent to maintain
   * rate limits across sessions (~100 bytes per session).
   *
   * @param sessionId - Current session identifier
   *
   * @internal
   */
  saveSessionCounts(e) {
    const t = this.get("userId") || "anonymous", s = Fe(t, e);
    try {
      const i = {
        ...this.sessionEventCounts,
        _timestamp: Date.now(),
        _version: 1
      };
      localStorage.setItem(s, JSON.stringify(i));
    } catch (i) {
      a("warn", "Failed to persist session counts to localStorage", {
        error: i,
        data: { sessionId: e }
      });
    }
  }
}
class Ns {
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
  static getId(e) {
    const t = e.getItem(ge);
    if (t)
      return t;
    const s = ot();
    return e.setItem(ge, s), s;
  }
}
const bs = /^\d{13}-[a-z0-9]{9}$/;
class Ls extends _ {
  storageManager;
  eventManager;
  activityHandler = null;
  visibilityChangeHandler = null;
  sessionTimeoutId = null;
  broadcastChannel = null;
  isTracking = !1;
  needsRenewal = !1;
  prerenderActivationHandler = null;
  /**
   * Creates a SessionManager instance.
   *
   * @param storageManager - Storage manager for session persistence
   * @param eventManager - Event manager for SESSION_START events
   */
  constructor(e, t) {
    super(), this.storageManager = e, this.eventManager = t;
  }
  initCrossTabSync() {
    if (typeof BroadcastChannel > "u") {
      a("debug", "BroadcastChannel not supported");
      return;
    }
    this.broadcastChannel = new BroadcastChannel(At), this.broadcastChannel.onmessage = (e) => {
      const { action: t, sessionId: s, timestamp: i } = e.data ?? {};
      if (t === "session_start" && s && typeof i == "number" && i > Date.now() - 5e3) {
        this.set("sessionId", s);
        const r = this.loadStoredSession();
        this.set("sessionReferrer", r?.referrer), this.set("sessionUtm", r?.utm), this.set("sessionClickIds", r?.clickIds), this.persistSession(s, i, r?.referrer, r?.utm, r?.clickIds), this.isTracking && this.setupSessionTimeout();
      } else t && t !== "session_start" && a("debug", "Ignored BroadcastChannel message with unknown action", { data: { action: t } });
    };
  }
  shareSession(e) {
    this.broadcastChannel && typeof this.broadcastChannel.postMessage == "function" && this.broadcastChannel.postMessage({
      action: "session_start",
      sessionId: e,
      timestamp: Date.now()
    });
  }
  cleanupCrossTabSync() {
    this.broadcastChannel && (typeof this.broadcastChannel.close == "function" && this.broadcastChannel.close(), this.broadcastChannel = null);
  }
  recoverSession() {
    const e = this.loadStoredSession();
    if (!e)
      return null;
    if (!bs.test(e.id))
      return a("warn", "Invalid session ID format recovered from storage, clearing", {
        data: { sessionId: e.id }
      }), this.clearStoredSession(), null;
    const t = this.get("config")?.sessionTimeout ?? 9e5;
    return Date.now() - e.lastActivity > t ? (this.clearStoredSession(), null) : e.id;
  }
  persistSession(e, t = Date.now(), s, i, r) {
    this.saveStoredSession({
      id: e,
      lastActivity: t,
      ...s && { referrer: s },
      ...i && { utm: i },
      ...r && { clickIds: r }
    });
  }
  clearStoredSession() {
    const e = this.getSessionStorageKey();
    this.storageManager.removeItem(e);
  }
  loadStoredSession() {
    const e = this.getSessionStorageKey(), t = this.storageManager.getItem(e);
    if (t !== null)
      try {
        const i = JSON.parse(t);
        if (i.id && typeof i.lastActivity == "number")
          return i;
      } catch {
        this.storageManager.removeItem(e);
      }
    const s = this.storageManager.getSessionItem(e);
    if (s !== null)
      try {
        const i = JSON.parse(s);
        if (i.id && typeof i.lastActivity == "number")
          return i;
      } catch {
        this.storageManager.removeSessionItem(e);
      }
    return null;
  }
  saveStoredSession(e) {
    const t = this.getSessionStorageKey(), s = JSON.stringify(e);
    this.storageManager.setItem(t, s), this.storageManager.setSessionItem(t, s);
  }
  getSessionStorageKey() {
    return wt;
  }
  /**
   * Starts session tracking with lifecycle management and cross-tab synchronization.
   *
   * **Purpose**: Initializes session tracking, creating or recovering a session ID,
   * setting up activity listeners, and enabling cross-tab synchronization.
   *
   * **Flow**:
   * 1. Checks if tracking already active (idempotent)
   * 2. Attempts to recover session from localStorage
   * 3. If no recovery: Generates new session ID (`{timestamp}-{9-char-base36}`)
   * 4. Sets `sessionId` in global state
   * 5. Persists session to localStorage
   * 6. Initializes BroadcastChannel for cross-tab sync (BEFORE SESSION_START)
   * 7. Shares session via BroadcastChannel (notifies other tabs)
   * 8. If NOT recovered: Tracks SESSION_START event
   * 9. Sets up inactivity timeout (default 15 minutes)
   * 10. Sets up activity listeners (click, keydown, scroll)
   * 11. Sets up lifecycle listeners (visibilitychange, beforeunload)
   *
   * **Session Recovery**:
   * - Checks localStorage for existing session (primary)
   * - Falls back to sessionStorage mirror (survives external redirects)
   * - Recovers if session exists and is recent (within timeout window)
   * - NO SESSION_START event if session recovered
   *
   * **Error Handling**:
   * - On error: Rolls back all setup (cleanup listeners, timers, state)
   * - Re-throws error to caller (App.init() handles failure)
   *
   * **BroadcastChannel Initialization Order**:
   * - CRITICAL: BroadcastChannel initialized BEFORE SESSION_START event
   * - Prevents race condition with secondary tabs
   * - Ensures secondary tabs can receive session_start message
   *
   * **Pre-rendering**:
   * - On a pre-rendered page (`document.prerendering === true`), every observable side
   *   effect (persistence, cross-tab sync, SESSION_START, listeners) is deferred to the
   *   `prerenderingchange` activation event via `activateSession()`. `sessionId` is still
   *   set in state synchronously so `init()` returns a real id. A prerender that is never
   *   activated persists and emits nothing.
   *
   * **Called by**: `SessionHandler.startTracking()` during `App.init()`
   *
   * **Important**: After successful call, `sessionId` is available in global state
   * and EventManager can flush pending events via `flushPendingEvents()`.
   *
   * @throws Error if initialization fails (rolled back automatically)
   *
   * @example
   * ```typescript
   * sessionManager.startTracking();
   * // → Session created: '1704896400000-a3b4c5d6e'
   * // → SESSION_START event tracked
   * // → Activity listeners active
   * // → Cross-tab sync enabled
   * ```
   */
  startTracking() {
    if (this.isTracking) {
      a("debug", "Session tracking already active");
      return;
    }
    const e = this.recoverSession(), t = e ?? this.generateSessionId();
    let s, i, r;
    if (e) {
      const o = this.loadStoredSession();
      s = o?.referrer ?? ce(this.get("config").sensitiveQueryParams), i = o?.utm ?? ue(), r = o?.clickIds ?? le();
    } else
      s = ce(this.get("config").sensitiveQueryParams), i = ue(), r = le();
    a("debug", "Session tracking initialized", {
      data: {
        sessionId: t,
        wasRecovered: !!e,
        willEmitSessionStart: !e,
        sessionReferrer: s,
        hasUtm: !!i,
        hasClickIds: !!r
      }
    }), this.isTracking = !0;
    try {
      if (this.set("sessionId", t), this.set("sessionReferrer", s), this.set("sessionUtm", i), this.set("sessionClickIds", r), rt()) {
        this.prerenderActivationHandler = () => {
          this.prerenderActivationHandler = null, this.activateSession(t, e, s, i, r);
        }, document.addEventListener("prerenderingchange", this.prerenderActivationHandler, { once: !0 });
        return;
      }
      this.activateSession(t, e, s, i, r);
    } catch (o) {
      throw this.isTracking = !1, this.clearSessionTimeout(), this.cleanupActivityListeners(), this.cleanupLifecycleListeners(), this.cleanupCrossTabSync(), this.set("sessionId", null), o;
    }
  }
  /**
   * Commits all observable session side effects: persistence, cross-tab sync, the
   * SESSION_START emit (new sessions only) and the activity/lifecycle/timeout listeners.
   *
   * Runs synchronously on a normal page load. On a pre-rendered page it is deferred to
   * the `prerenderingchange` (activation) event, so a prerender that is never activated
   * persists nothing and emits nothing.
   *
   * BroadcastChannel is initialized before SESSION_START so secondary tabs can receive
   * the `session_start` message (avoids a cross-tab race).
   */
  activateSession(e, t, s, i, r) {
    this.persistSession(e, Date.now(), s, i, r), this.initCrossTabSync(), this.shareSession(e), t ? a("debug", "Session recovered, skipping SESSION_START", { data: { sessionId: e } }) : (a("debug", "Emitting SESSION_START event", { data: { sessionId: e } }), this.eventManager.track({ type: u.SESSION_START })), this.setupSessionTimeout(), this.setupActivityListeners(), this.setupLifecycleListeners();
  }
  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
  setupSessionTimeout() {
    this.clearSessionTimeout();
    const e = this.get("config")?.sessionTimeout ?? 9e5;
    this.sessionTimeoutId = setTimeout(() => {
      this.enterRenewalMode();
    }, e);
  }
  resetSessionTimeout() {
    this.setupSessionTimeout();
    const e = this.get("sessionId");
    e && this.persistSession(
      e,
      Date.now(),
      this.get("sessionReferrer"),
      this.get("sessionUtm"),
      this.get("sessionClickIds")
    );
  }
  clearSessionTimeout() {
    this.sessionTimeoutId && (clearTimeout(this.sessionTimeoutId), this.sessionTimeoutId = null);
  }
  setupActivityListeners() {
    this.activityHandler = () => {
      this.needsRenewal ? this.renewSession() : this.resetSessionTimeout();
    }, document.addEventListener("click", this.activityHandler, { passive: !0 }), document.addEventListener("keydown", this.activityHandler, { passive: !0 }), document.addEventListener("scroll", this.activityHandler, { passive: !0 });
  }
  /**
   * Renews the session after timeout when user returns.
   * Creates a new session ID and emits SESSION_START.
   */
  renewSession() {
    this.needsRenewal = !1;
    const e = this.generateSessionId(), t = ce(this.get("config").sensitiveQueryParams), s = ue(), i = le();
    a("debug", "Renewing session after timeout", {
      data: { newSessionId: e }
    }), this.set("sessionId", e), this.set("sessionReferrer", t), this.set("sessionUtm", s), this.set("sessionClickIds", i), this.persistSession(e, Date.now(), t, s, i), this.cleanupCrossTabSync(), this.initCrossTabSync(), this.shareSession(e), this.eventManager.track({
      type: u.SESSION_START
    }), this.eventManager.flushPendingEvents(), this.setupSessionTimeout();
  }
  cleanupActivityListeners() {
    this.activityHandler && (document.removeEventListener("click", this.activityHandler), document.removeEventListener("keydown", this.activityHandler), document.removeEventListener("scroll", this.activityHandler), this.activityHandler = null);
  }
  setupLifecycleListeners() {
    this.visibilityChangeHandler || (this.visibilityChangeHandler = () => {
      if (document.hidden)
        this.clearSessionTimeout();
      else {
        if (this.isSessionStale()) {
          a("debug", "Session expired during suspend, entering renewal mode"), this.enterRenewalMode();
          return;
        }
        this.get("sessionId") && this.setupSessionTimeout();
      }
    }, document.addEventListener("visibilitychange", this.visibilityChangeHandler));
  }
  /**
   * Checks if the current session has become stale (expired during browser suspend).
   * This handles the case where JavaScript timers are paused during suspend/hibernate.
   */
  isSessionStale() {
    if (this.needsRenewal || !this.get("sessionId"))
      return !1;
    const t = this.loadStoredSession();
    if (!t)
      return !1;
    const s = this.get("config")?.sessionTimeout ?? 9e5;
    return Date.now() - t.lastActivity > s;
  }
  cleanupLifecycleListeners() {
    this.visibilityChangeHandler && (document.removeEventListener("visibilitychange", this.visibilityChangeHandler), this.visibilityChangeHandler = null);
  }
  /**
   * Enters renewal mode after session timeout.
   * Keeps activity listeners active to detect when user returns.
   * Called by session timeout timer.
   */
  enterRenewalMode() {
    this.clearSessionTimeout(), this.cleanupCrossTabSync(), this.clearStoredSession(), this.set("sessionId", null), this.set("hasStartSession", !1), this.set("sessionReferrer", void 0), this.set("sessionUtm", void 0), this.set("sessionClickIds", void 0), this.needsRenewal = !0, a("debug", "Session timed out, entering renewal mode");
  }
  /**
   * Fully resets session state and cleans up all resources.
   * Called by stopTracking() for explicit session termination.
   */
  resetSessionState() {
    this.clearSessionTimeout(), this.cleanupActivityListeners(), this.cleanupLifecycleListeners(), this.cleanupCrossTabSync(), this.cleanupPrerenderActivation(), this.clearStoredSession(), this.set("sessionId", null), this.set("hasStartSession", !1), this.set("sessionReferrer", void 0), this.set("sessionUtm", void 0), this.set("sessionClickIds", void 0), this.needsRenewal = !1, this.isTracking = !1;
  }
  /**
   * Stops session tracking and cleans up all resources.
   *
   * **Purpose**: Manually stops the current session tracking and cleans up
   * all listeners and timers. Does not emit SESSION_END event.
   *
   * **Flow**:
   * 1. Clears inactivity timeout
   * 2. Removes activity listeners (click, keydown, scroll)
   * 3. Removes lifecycle listeners (visibilitychange)
   * 4. Closes BroadcastChannel
   * 5. Clears session from localStorage
   * 6. Resets `sessionId` and `hasStartSession` in global state
   * 7. Sets `isTracking` to false
   *
   * **Called by**: `App.destroy()` during application teardown or when session times out
   *
   * **Important**: After calling, session tracking is terminated and cannot be resumed.
   * A new session will be created on next `startTracking()` call.
   *
   * @example
   * ```typescript
   * // Stop session tracking
   * sessionManager.stopTracking();
   * // → All listeners cleaned up
   * // → Session cleared from localStorage
   * // → BroadcastChannel closed
   * // → No SESSION_END event emitted
   * ```
   */
  stopTracking() {
    this.resetSessionState();
  }
  /**
   * Destroys the session manager and cleans up all resources.
   *
   * **Purpose**: Performs deep cleanup of session manager resources during
   * application teardown. Preserves session in localStorage for recovery.
   *
   * **Differences from stopTracking()**:
   * - Does NOT clear localStorage (preserves session for recovery)
   * - Used for internal cleanup during teardown
   *
   * **Cleanup Flow**:
   * 1. Clears inactivity timeout
   * 2. Removes activity listeners (click, keydown, scroll)
   * 3. Closes BroadcastChannel
   * 4. Removes lifecycle listeners (visibilitychange)
   * 5. Resets tracking flag (`isTracking`)
   *
   * **Called by**: `App.destroy()` during application teardown
   *
   * @returns void
   *
   * @example
   * ```typescript
   * sessionManager.destroy();
   * // → All resources cleaned up
   * // → Session preserved in localStorage for recovery
   * ```
   */
  destroy() {
    this.clearSessionTimeout(), this.cleanupActivityListeners(), this.cleanupCrossTabSync(), this.cleanupLifecycleListeners(), this.cleanupPrerenderActivation(), this.isTracking = !1, this.needsRenewal = !1, this.set("hasStartSession", !1);
  }
  /**
   * Removes the pending `prerenderingchange` listener when the manager is torn
   * down before activation (the discarded-prerender case). On the activation path
   * `{ once: true }` removes the listener and the handler nulls its own reference,
   * so this is a no-op then.
   */
  cleanupPrerenderActivation() {
    this.prerenderActivationHandler && (document.removeEventListener("prerenderingchange", this.prerenderActivationHandler), this.prerenderActivationHandler = null);
  }
}
class Rs extends _ {
  eventManager;
  storageManager;
  sessionManager = null;
  destroyed = !1;
  constructor(e, t) {
    super(), this.eventManager = t, this.storageManager = e;
  }
  /**
   * Starts session tracking by creating SessionManager and initializing session.
   *
   * **Behavior**:
   * - Creates SessionManager instance with storage and event manager
   * - Calls SessionManager.startTracking() to begin session lifecycle
   * - Flushes pending events buffered during initialization
   * - Idempotent: Early return if session already active
   * - Validates state: Warns and returns if handler destroyed
   *
   * **Error Handling**:
   * - On failure: Automatically cleans up SessionManager via nested try-catch
   * - Leaves handler in clean, reusable state after error
   * - Re-throws error after logging
   *
   * @throws {Error} If SessionManager initialization fails
   */
  startTracking() {
    if (!this.isActive()) {
      if (this.destroyed) {
        a("debug", "Cannot start tracking on destroyed handler");
        return;
      }
      try {
        this.sessionManager = new Ls(this.storageManager, this.eventManager), this.sessionManager.startTracking(), this.eventManager.flushPendingEvents();
      } catch (e) {
        if (this.sessionManager) {
          try {
            this.sessionManager.destroy();
          } catch {
          }
          this.sessionManager = null;
        }
        throw a("error", "Failed to start session tracking", { error: e }), e;
      }
    }
  }
  isActive() {
    return this.sessionManager !== null && !this.destroyed;
  }
  cleanupSessionManager() {
    this.sessionManager && (this.sessionManager.stopTracking(), this.sessionManager.destroy(), this.sessionManager = null);
  }
  /**
   * Stops session tracking by cleaning up resources.
   *
   * **Purpose**: Terminates session tracking and removes all listeners and timers.
   * No events are emitted.
   *
   * **Behavior**:
   * - Calls SessionManager.stopTracking() to clean up listeners
   * - Calls SessionManager.destroy() to finalize cleanup
   * - Safe to call multiple times (idempotent via cleanupSessionManager)
   *
   * **Note**: This method only performs cleanup without emitting events.
   * The receiver infers session end time from the last event timestamp.
   */
  stopTracking() {
    this.cleanupSessionManager();
  }
  /**
   * Destroys handler and cleans up SessionManager.
   *
   * **Purpose**: Same as stopTracking(). Both methods perform cleanup
   * without emitting events.
   *
   * **Behavior**:
   * - Idempotent: Early return if already destroyed
   * - Calls SessionManager.destroy() to clean up listeners and timers
   * - Sets sessionManager to null and destroyed flag to true
   *
   * **Note**: There is no functional difference between stopTracking()
   * and destroy(). Both perform cleanup without emitting SESSION_END events.
   */
  destroy() {
    this.destroyed || (this.sessionManager && (this.sessionManager.destroy(), this.sessionManager = null), this.destroyed = !0);
  }
}
class Cs extends _ {
  eventManager;
  onTrack;
  originalPushState;
  originalReplaceState;
  lastPageViewTime = 0;
  constructor(e, t) {
    super(), this.eventManager = e, this.onTrack = t;
  }
  /**
   * Starts tracking page views.
   *
   * - Tracks initial page load first (via trackInitialPageView)
   * - Attaches popstate and hashchange event listeners
   * - Patches History API methods (pushState, replaceState) for SPA navigation
   * - All setup happens synchronously
   *
   * **Note**: onTrack() callback is invoked AFTER initial page view but BEFORE
   * subsequent navigation events for session management coordination.
   */
  startTracking() {
    this.trackInitialPageView(), window.addEventListener("popstate", this.trackCurrentPage, !0), window.addEventListener("hashchange", this.trackCurrentPage, !0), this.patchHistory("pushState"), this.patchHistory("replaceState");
  }
  /**
   * Stops tracking page views and restores original History API methods.
   *
   * - Removes event listeners (popstate, hashchange)
   * - Restores original pushState and replaceState methods
   * - Resets throttling state
   */
  stopTracking() {
    window.removeEventListener("popstate", this.trackCurrentPage, !0), window.removeEventListener("hashchange", this.trackCurrentPage, !0), this.originalPushState && (window.history.pushState = this.originalPushState), this.originalReplaceState && (window.history.replaceState = this.originalReplaceState), this.lastPageViewTime = 0;
  }
  patchHistory(e) {
    const t = window.history[e];
    e === "pushState" && !this.originalPushState ? this.originalPushState = t : e === "replaceState" && !this.originalReplaceState && (this.originalReplaceState = t), window.history[e] = (...s) => {
      t.apply(window.history, s), this.trackCurrentPage();
    };
  }
  trackCurrentPage = () => {
    const e = window.location.href, t = C(e, this.get("config").sensitiveQueryParams);
    if (this.get("pageUrl") === t)
      return;
    const s = Date.now(), i = this.get("config").pageViewThrottleMs ?? 1e3;
    if (s - this.lastPageViewTime < i)
      return;
    this.lastPageViewTime = s, this.onTrack();
    const r = this.get("pageUrl");
    this.set("pageUrl", t);
    const o = this.extractPageViewData();
    this.eventManager.track({
      type: u.PAGE_VIEW,
      page_url: this.get("pageUrl"),
      from_page_url: r,
      ...o && { page_view: o }
    }), this.get("config").flushOnSpaNavigation === !0 && this.eventManager.flushImmediately();
  };
  trackInitialPageView() {
    const e = C(window.location.href, this.get("config").sensitiveQueryParams), t = this.extractPageViewData();
    this.lastPageViewTime = Date.now(), this.eventManager.track({
      type: u.PAGE_VIEW,
      page_url: e,
      ...t && { page_view: t }
    }), this.onTrack();
  }
  extractPageViewData() {
    const e = document.referrer ? C(document.referrer, this.get("config").sensitiveQueryParams) : "", { title: t } = document;
    if (!(!e && !t))
      return {
        ...e && { referrer: e },
        ...t && { title: t }
      };
  }
}
const Je = "input, textarea, select";
class Os extends _ {
  eventManager;
  lastClickTimes = /* @__PURE__ */ new Map();
  clickHandler;
  lastPruneTime = 0;
  constructor(e) {
    super(), this.eventManager = e;
  }
  /**
   * Starts tracking click events on the document.
   *
   * Attaches a single capture-phase click listener to window that:
   * - Detects interactive elements or falls back to clicked element
   * - Applies click throttling per element (configurable, default 300ms)
   * - Extracts custom tracking data from data-spoorly-name attributes
   * - Generates both custom events (for tracked elements) and click events
   * - Respects data-spoorly-ignore privacy controls
   * - Sanitizes text content for PII protection
   *
   * Idempotent: Safe to call multiple times (early return if already tracking).
   */
  startTracking() {
    this.clickHandler || (this.clickHandler = (e) => {
      const t = e, s = t.target, i = typeof HTMLElement < "u" && s instanceof HTMLElement ? s : typeof HTMLElement < "u" && s instanceof Node && s.parentElement instanceof HTMLElement ? s.parentElement : null;
      if (!i) {
        a("debug", "Click target not found or not an element");
        return;
      }
      if (this.shouldIgnoreElement(i))
        return;
      const r = this.get("config")?.clickThrottleMs ?? 300;
      if (r > 0 && !this.checkClickThrottle(i, r))
        return;
      const o = this.findTrackingElement(i), l = this.getRelevantClickElement(i), c = this.calculateClickCoordinates(t);
      if (o) {
        const h = this.extractTrackingData(o);
        if (h) {
          const p = this.createCustomEventData(h);
          this.eventManager.track({
            type: u.CUSTOM,
            custom_event: {
              name: p.name,
              ...p.value && { metadata: { value: p.value } }
            }
          });
        }
      }
      if (!c) {
        a("debug", "Click skipped: invalid coordinates (likely synthetic)");
        return;
      }
      const d = this.generateClickData(i, l, c);
      this.eventManager.track({
        type: u.CLICK,
        click_data: d
      });
    }, window.addEventListener("click", this.clickHandler, !0));
  }
  /**
   * Stops tracking click events and cleans up resources.
   *
   * Removes the click event listener, clears throttle cache, and resets prune timer.
   * Prevents memory leaks by properly cleaning up all state.
   */
  stopTracking() {
    this.clickHandler && (window.removeEventListener("click", this.clickHandler, !0), this.clickHandler = void 0), this.lastClickTimes.clear(), this.lastPruneTime = 0;
  }
  shouldIgnoreElement(e) {
    return e.hasAttribute(`${M}-ignore`) ? !0 : e.closest(`[${M}-ignore]`) !== null;
  }
  /**
   * Checks per-element click throttling to prevent double-clicks and rapid spam
   * Returns true if the click should be tracked, false if throttled
   */
  checkClickThrottle(e, t) {
    const s = this.getElementSignature(e), i = Date.now();
    this.pruneThrottleCache(i);
    const r = this.lastClickTimes.get(s);
    return r !== void 0 && i - r < t ? (a("debug", "ClickHandler: Click suppressed by throttle", {
      data: {
        signature: s,
        throttleRemaining: t - (i - r)
      }
    }), !1) : (this.lastClickTimes.set(s, i), !0);
  }
  /**
   * Prunes stale entries from the throttle cache to prevent memory leaks
   * Uses TTL-based eviction (5 minutes) and enforces max size limit
   * Called during checkClickThrottle with built-in rate limiting (every 30 seconds)
   */
  pruneThrottleCache(e) {
    if (e - this.lastPruneTime < 3e4)
      return;
    this.lastPruneTime = e;
    const t = e - 3e5;
    for (const [s, i] of this.lastClickTimes.entries())
      i < t && this.lastClickTimes.delete(s);
    if (this.lastClickTimes.size > 1e3) {
      const s = Array.from(this.lastClickTimes.entries()).sort((o, l) => o[1] - l[1]), i = this.lastClickTimes.size - 1e3, r = s.slice(0, i);
      for (const [o] of r)
        this.lastClickTimes.delete(o);
      a("debug", "ClickHandler: Pruned throttle cache", {
        data: {
          removed: r.length,
          remaining: this.lastClickTimes.size
        }
      });
    }
  }
  /**
   * Creates a stable signature for an element to track throttling
   * Priority: id > data-testid > data-spoorly-name > DOM path
   */
  getElementSignature(e) {
    if (e.id)
      return `#${e.id}`;
    const t = e.getAttribute("data-testid");
    if (t)
      return `[data-testid="${t}"]`;
    const s = e.getAttribute(`${M}-name`);
    return s ? `[${M}-name="${s}"]` : this.getElementPath(e);
  }
  /**
   * Generates a DOM path for an element (e.g., "body>div>button")
   */
  getElementPath(e) {
    const t = [];
    let s = e;
    for (; s && s !== document.body; ) {
      let i = s.tagName.toLowerCase();
      if (s.className) {
        const r = s.className.split(" ")[0];
        r && (i += `.${r}`);
      }
      t.unshift(i), s = s.parentElement;
    }
    return t.join(">") || "unknown";
  }
  findTrackingElement(e) {
    return e.hasAttribute(`${M}-name`) ? e : e.closest(`[${M}-name]`);
  }
  getRelevantClickElement(e) {
    for (const t of Et)
      try {
        if (e.matches(t))
          return e;
        const s = e.closest(t);
        if (s)
          return s;
      } catch (s) {
        a("debug", "Invalid selector in element search", { error: s, data: { selector: t } });
        continue;
      }
    return e;
  }
  calculateClickCoordinates(e) {
    const t = e.clientX, s = e.clientY;
    return typeof t != "number" || typeof s != "number" || !Number.isFinite(t) || !Number.isFinite(s) || t === 0 && s === 0 && !e.isTrusted ? null : { x: t, y: s };
  }
  extractTrackingData(e) {
    const t = e.getAttribute(`${M}-name`), s = e.getAttribute(`${M}-value`);
    if (t)
      return {
        element: e,
        name: t,
        ...s && { value: s }
      };
  }
  generateClickData(e, t, s) {
    const { x: i, y: r } = s, o = this.getRelevantText(e, t), l = t.getAttribute("href"), c = l ? C(l, this.get("config").sensitiveQueryParams) : void 0;
    return {
      x: i,
      y: r,
      tag: t.tagName.toLowerCase(),
      ...t.id && { id: R(t.id) },
      ...t.className && { class: R(t.className) },
      ...o && { text: o },
      ...c && { href: c }
    };
  }
  getRelevantText(e, t) {
    if (e.closest(Je))
      return "";
    const s = this.getTextWithoutFormControls(e);
    if (s && s.length <= 255)
      return R(s);
    const i = t === e ? s : this.getTextWithoutFormControls(t);
    if (!i)
      return "";
    const r = i.length <= 255 ? i : i.slice(0, 252) + "...";
    return R(r);
  }
  /**
   * `textContent` minus the text inside form controls. Walks the live DOM read-only
   * (no cloning, so no custom-element constructors or image fetches run).
   */
  getTextWithoutFormControls(e) {
    const t = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: (i) => i.nodeType === Node.ELEMENT_NODE && i.matches(Je) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    let s = "";
    for (let i = t.nextNode(); i; i = t.nextNode())
      i.nodeType === Node.TEXT_NODE && (s += i.nodeValue ?? "");
    return s.trim();
  }
  createCustomEventData(e) {
    return {
      name: e.name,
      ...e.value && { value: e.value }
    };
  }
}
class Ps extends _ {
  eventManager;
  containers = [];
  limitWarningLogged = !1;
  containerDiscoveryTimeoutId = null;
  constructor(e) {
    super(), this.eventManager = e;
  }
  startTracking() {
    this.limitWarningLogged = !1, this.set("scrollEventCount", 0), this.tryDetectScrollContainers(0);
  }
  stopTracking() {
    this.containerDiscoveryTimeoutId !== null && (clearTimeout(this.containerDiscoveryTimeoutId), this.containerDiscoveryTimeoutId = null);
    for (const e of this.containers)
      this.clearContainerTimer(e), e.element === window ? window.removeEventListener("scroll", e.listener) : e.element.removeEventListener("scroll", e.listener);
    this.containers.length = 0, this.set("scrollEventCount", 0), this.limitWarningLogged = !1;
  }
  tryDetectScrollContainers(e) {
    const t = this.findScrollableElements();
    if (this.isWindowScrollable() && this.setupScrollContainer(window, "window"), t.length > 0) {
      for (const s of t) {
        const i = this.getElementSelector(s);
        this.setupScrollContainer(s, i);
      }
      return;
    }
    if (e < 5) {
      this.containerDiscoveryTimeoutId = window.setTimeout(() => {
        this.containerDiscoveryTimeoutId = null, this.tryDetectScrollContainers(e + 1);
      }, 200);
      return;
    }
    this.containers.length === 0 && this.setupScrollContainer(window, "window");
  }
  findScrollableElements() {
    if (!document.body)
      return [];
    const e = [], t = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (i) => {
        const r = i;
        if (!r.isConnected || !r.offsetParent)
          return NodeFilter.FILTER_SKIP;
        const o = getComputedStyle(r);
        return o.overflowY === "auto" || o.overflowY === "scroll" || o.overflow === "auto" || o.overflow === "scroll" ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    let s;
    for (; (s = t.nextNode()) && e.length < 10; ) {
      const i = s;
      this.isElementScrollable(i) && e.push(i);
    }
    return e;
  }
  getElementSelector(e) {
    if (e === window)
      return "window";
    const t = e;
    if (t.id)
      return `#${t.id}`;
    if (t.className && typeof t.className == "string") {
      const s = t.className.split(" ").filter((i) => i.trim())[0];
      if (s)
        return `.${s}`;
    }
    return t.tagName.toLowerCase();
  }
  setupScrollContainer(e, t) {
    if (this.containers.some((c) => c.element === e) || e !== window && !this.isElementScrollable(e))
      return;
    const i = this.getScrollTop(e), r = this.calculateScrollDepth(
      i,
      this.getScrollHeight(e),
      this.getViewportHeight(e)
    ), o = {
      element: e,
      selector: t,
      lastScrollPos: i,
      lastDepth: r,
      lastEventTime: 0,
      debounceTimer: null,
      listener: null
    }, l = () => {
      this.get("suppressNextScroll") || (this.clearContainerTimer(o), o.debounceTimer = window.setTimeout(() => {
        const c = this.calculateScrollData(o);
        c && this.processScrollEvent(o, c, Date.now()), o.debounceTimer = null;
      }, 250));
    };
    o.listener = l, this.containers.push(o), e === window ? window.addEventListener("scroll", l, { passive: !0 }) : e.addEventListener("scroll", l, { passive: !0 });
  }
  processScrollEvent(e, t, s) {
    if (!this.shouldEmitScrollEvent(e, t, s))
      return;
    e.lastEventTime = s, e.lastDepth = t.depth;
    const i = this.get("scrollEventCount") ?? 0;
    this.set("scrollEventCount", i + 1), this.eventManager.track({
      type: u.SCROLL,
      scroll_data: {
        ...t,
        container_selector: e.selector
      }
    });
  }
  shouldEmitScrollEvent(e, t, s) {
    return this.hasReachedSessionLimit() ? (this.logLimitOnce(), !1) : !(!this.hasElapsedMinimumInterval(e, s) || !this.hasSignificantDepthChange(e, t.depth));
  }
  hasReachedSessionLimit() {
    return (this.get("scrollEventCount") ?? 0) >= 120;
  }
  hasElapsedMinimumInterval(e, t) {
    return e.lastEventTime === 0 ? !0 : t - e.lastEventTime >= 500;
  }
  hasSignificantDepthChange(e, t) {
    return Math.abs(t - e.lastDepth) >= 5;
  }
  logLimitOnce() {
    this.limitWarningLogged || (this.limitWarningLogged = !0, a("debug", "Max scroll events per session reached", {
      data: { limit: 120 }
    }));
  }
  isWindowScrollable() {
    return document.documentElement.scrollHeight > window.innerHeight;
  }
  clearContainerTimer(e) {
    e.debounceTimer !== null && (clearTimeout(e.debounceTimer), e.debounceTimer = null);
  }
  getScrollDirection(e, t) {
    return e > t ? me.DOWN : me.UP;
  }
  calculateScrollDepth(e, t, s) {
    if (t <= s)
      return 0;
    const i = t - s;
    return Math.min(100, Math.max(0, Math.floor(e / i * 100)));
  }
  calculateScrollData(e) {
    const { element: t, lastScrollPos: s } = e, i = this.getScrollTop(t);
    if (Math.abs(i - s) < 10 || t === window && !this.isWindowScrollable())
      return null;
    const o = this.getViewportHeight(t), l = this.getScrollHeight(t), c = this.getScrollDirection(i, s), d = this.calculateScrollDepth(i, l, o);
    return e.lastScrollPos = i, { depth: d, direction: c };
  }
  getScrollTop(e) {
    return e === window ? window.scrollY : e.scrollTop;
  }
  getViewportHeight(e) {
    return e === window ? window.innerHeight : e.clientHeight;
  }
  getScrollHeight(e) {
    return e === window ? document.documentElement.scrollHeight : e.scrollHeight;
  }
  isElementScrollable(e) {
    const t = getComputedStyle(e), s = t.overflowY === "auto" || t.overflowY === "scroll" || t.overflow === "auto" || t.overflow === "scroll", i = e.scrollHeight > e.clientHeight;
    return s && i;
  }
}
class ks {
  storage;
  sessionStorageRef;
  fallbackStorage = /* @__PURE__ */ new Map();
  fallbackSessionStorage = /* @__PURE__ */ new Map();
  constructor() {
    this.storage = this.initializeStorage("localStorage"), this.sessionStorageRef = this.initializeStorage("sessionStorage"), this.storage || a("debug", "localStorage not available, using memory fallback"), this.sessionStorageRef || a("debug", "sessionStorage not available, using memory fallback");
  }
  getItem(e) {
    try {
      return this.storage ? this.storage.getItem(e) : this.fallbackStorage.get(e) ?? null;
    } catch {
      return this.fallbackStorage.get(e) ?? null;
    }
  }
  setItem(e, t) {
    if (this.fallbackStorage.set(e, t), !!this.storage)
      try {
        this.storage.setItem(e, t);
        return;
      } catch (s) {
        if (!(s instanceof DOMException && s.name === "QuotaExceededError" || s instanceof Error && s.name === "QuotaExceededError"))
          return;
        if (a("warn", "localStorage quota exceeded, attempting cleanup", {
          data: { key: e, valueSize: t.length }
        }), !this.cleanupOldData()) {
          a("error", "localStorage quota exceeded and no data to cleanup - data will not persist", {
            error: s,
            data: { key: e, valueSize: t.length }
          });
          return;
        }
        try {
          this.storage.setItem(e, t);
        } catch (r) {
          a("error", "localStorage quota exceeded even after cleanup - data will not persist", {
            error: r,
            data: { key: e, valueSize: t.length }
          });
        }
      }
  }
  removeItem(e) {
    try {
      this.storage && this.storage.removeItem(e);
    } catch {
    }
    this.fallbackStorage.delete(e);
  }
  /**
   * Single-pass cleanup for QuotaExceededError. Purges persisted event queues
   * (largest, safe to discard) and up to 5 other non-critical library keys in
   * one pass. Preserves user id, session, identity and rate-limit keys.
   */
  cleanupOldData() {
    if (!this.storage)
      return !1;
    try {
      const e = `${m}:`, t = [":uid", ":session", ":identity", ":pending_identity", ":rate_limit"], s = [], i = [];
      for (let o = 0; o < this.storage.length; o++) {
        const l = this.storage.key(o);
        l?.startsWith(e) && (l.endsWith(":queue") ? s.push(l) : t.some((c) => l.endsWith(c)) || i.push(l));
      }
      const r = [...s, ...i.slice(0, 5)];
      return r.length === 0 ? !1 : (r.forEach((o) => {
        try {
          this.storage.removeItem(o);
        } catch {
        }
      }), !0);
    } catch (e) {
      return a("error", "Failed to cleanup old data", { error: e }), !1;
    }
  }
  initializeStorage(e) {
    if (typeof window > "u")
      return null;
    try {
      const t = e === "localStorage" ? window.localStorage : window.sessionStorage, s = "__spoorly_test__";
      return t.setItem(s, "test"), t.removeItem(s), t;
    } catch {
      return null;
    }
  }
  getSessionItem(e) {
    try {
      return this.sessionStorageRef ? this.sessionStorageRef.getItem(e) : this.fallbackSessionStorage.get(e) ?? null;
    } catch {
      return this.fallbackSessionStorage.get(e) ?? null;
    }
  }
  setSessionItem(e, t) {
    this.fallbackSessionStorage.set(e, t);
    try {
      if (this.sessionStorageRef) {
        this.sessionStorageRef.setItem(e, t);
        return;
      }
    } catch (s) {
      (s instanceof DOMException && s.name === "QuotaExceededError" || s instanceof Error && s.name === "QuotaExceededError") && a("error", "sessionStorage quota exceeded - data will not persist", {
        error: s,
        data: { key: e, valueSize: t.length }
      });
    }
  }
  removeSessionItem(e) {
    try {
      this.sessionStorageRef && this.sessionStorageRef.removeItem(e);
    } catch {
    }
    this.fallbackSessionStorage.delete(e);
  }
}
class Ds extends _ {
  eventManager;
  seenNavIds = /* @__PURE__ */ new Set();
  navigationHistory = [];
  // FIFO queue for tracking navigation order
  observers = [];
  vitalThresholds;
  navigationCounter = 0;
  // Suffix counter for repeat navigations to the same path (SPA A→B→A)
  currentNavBase = null;
  currentNavId = null;
  // Metrics measured for the navigation currently being buffered, keyed by
  // type (last value wins — CLS/INP fallback observers can re-report a
  // running total for the same type before flush). Flushed as ONE
  // consolidated event on pagehide/hidden or when a new navigation starts.
  currentBuffer = /* @__PURE__ */ new Map();
  currentBufferNavId = null;
  isTracking = !1;
  lifecycleListenersRegistered = !1;
  // Set by a `pagehide` that arrived while the document was still visible.
  pageUnloading = !1;
  pageHideHandler = () => {
    if (typeof document < "u" && !document.hidden) {
      this.pageUnloading = !0;
      return;
    }
    this.flushAndDeliver(!0);
  };
  visibilityHandler = () => {
    if (typeof document < "u" && document.hidden) {
      const e = this.pageUnloading;
      this.pageUnloading = !1, this.flushAndDeliver(e || this.get("config").flushOnPageHidden !== !1);
    }
  };
  constructor(e) {
    super(), this.eventManager = e, this.vitalThresholds = Qe(Ee);
  }
  /**
   * Starts tracking Web Vitals and performance metrics.
   *
   * Loads the web-vitals library, then registers the consolidation lifecycle
   * listeners (see `registerLifecycleListeners` for why that order matters).
   * Falls back to native Performance Observer API if web-vitals fails to load.
   *
   * **Configuration**:
   * - Reads webVitalsMode from config ('all', 'needs-improvement', 'poor')
   * - Merges webVitalsThresholds with mode defaults for custom thresholds
   * - Initializes web-vitals library observers (LCP, CLS, FCP, TTFB, INP)
   *
   * @returns Promise that resolves when tracking is initialized
   */
  async startTracking() {
    const e = this.get("config"), t = e?.webVitalsMode ?? Ee;
    this.vitalThresholds = Qe(t), e?.webVitalsThresholds && (this.vitalThresholds = { ...this.vitalThresholds, ...e.webVitalsThresholds }), this.isTracking = !0;
    try {
      await this.initWebVitals();
    } finally {
      this.registerLifecycleListeners();
    }
  }
  /**
   * Registers the `pagehide` / `visibilitychange` listeners that flush the
   * consolidated buffer. Two properties make one honest event per navigation:
   *
   * 1. **Registered AFTER `initWebVitals()`**, so on the same `visibilitychange`
   *    dispatch the `web-vitals` library's own hidden callbacks — its listeners
   *    were registered while the import resolved, therefore earlier — finalize
   *    LCP/CLS/INP into the buffer BEFORE this flush reads it. web-vitals does
   *    not finalize on `pagehide`, which on unload fires first, so that earlier
   *    `pagehide` must not flush (see `pageHideHandler`).
   *    Registering first (or in the constructor) splits every navigation into
   *    two events: the early metrics (TTFB/FCP) and the late ones. The wire
   *    payload carries no navigation id, so a receiver cannot merge that split
   *    back into one navigation.
   * 2. **Each flush drains the queue itself** (`flushAndDeliver`) rather than
   *    relying on `App`'s page-lifecycle listeners running afterwards. `App`
   *    registers those during `init()`, but on a prerendered page it defers
   *    handler startup to `prerenderingchange` — inverting the order, so
   *    `App`'s `sendBeacon` would drain the queue before the vitals event was
   *    ever added to it, and the event would die with the page.
   *
   * Idempotent, and a no-op once `stopTracking()` has run — `startTracking()`
   * is async, so teardown can land while the import is still in flight.
   */
  registerLifecycleListeners() {
    !this.isTracking || this.lifecycleListenersRegistered || (this.lifecycleListenersRegistered = !0, window.addEventListener("pagehide", this.pageHideHandler), document.addEventListener("visibilitychange", this.visibilityHandler));
  }
  /**
   * Stops tracking Web Vitals and cleans up resources.
   *
   * Flushes any buffered (not-yet-shipped) vitals for the current navigation
   * first — called from `App.destroy()` before the final
   * `flushImmediatelySync()`, so a partial buffer is never silently dropped.
   * Then disconnects all Performance Observers and clears internal state:
   * - Removes the consolidation lifecycle listeners
   * - Disconnects all active observers (web-vitals)
   * - Clears navigation-boundary tracking and history
   * - Prevents memory leaks in long-running applications
   */
  stopTracking() {
    this.isTracking = !1, this.lifecycleListenersRegistered = !1, this.pageUnloading = !1, this.flushConsolidatedVitals(), window.removeEventListener("pagehide", this.pageHideHandler), document.removeEventListener("visibilitychange", this.visibilityHandler), this.observers.forEach((e, t) => {
      try {
        e.disconnect();
      } catch (s) {
        a("debug", "Failed to disconnect performance observer", { error: s, data: { observerIndex: t } });
      }
    }), this.observers.length = 0, this.seenNavIds.clear(), this.navigationHistory.length = 0, this.navigationCounter = 0, this.currentNavBase = null, this.currentNavId = null, this.currentBuffer.clear(), this.currentBufferNavId = null;
  }
  observeWebVitalsFallback() {
    this.reportTTFB(), this.safeObserve(
      "largest-contentful-paint",
      (s) => {
        const i = s.getEntries(), r = i[i.length - 1];
        r && this.sendVital({ type: "LCP", value: Number(r.startTime.toFixed(2)) });
      },
      { type: "largest-contentful-paint", buffered: !0 },
      !0
    );
    let e = 0, t = this.getNavigationId();
    this.safeObserve(
      "layout-shift",
      (s) => {
        const i = this.getNavigationId();
        i !== t && (e = 0, t = i);
        const r = s.getEntries();
        for (const o of r) {
          if (o.hadRecentInput === !0)
            continue;
          const l = typeof o.value == "number" ? o.value : 0;
          e += l;
        }
        this.sendVital({ type: "CLS", value: Number(e.toFixed(2)) });
      },
      { type: "layout-shift", buffered: !0 }
    ), this.safeObserve(
      "paint",
      (s) => {
        for (const i of s.getEntries())
          i.name === "first-contentful-paint" && this.sendVital({ type: "FCP", value: Number(i.startTime.toFixed(2)) });
      },
      { type: "paint", buffered: !0 },
      !0
    ), this.safeObserve(
      "event",
      (s) => {
        let i = 0;
        const r = s.getEntries();
        for (const o of r) {
          const l = (o.processingEnd ?? 0) - (o.startTime ?? 0);
          i = Math.max(i, l);
        }
        i > 0 && this.sendVital({ type: "INP", value: Number(i.toFixed(2)) });
      },
      { type: "event", buffered: !0 }
    );
  }
  async initWebVitals() {
    try {
      const { onLCP: e, onCLS: t, onFCP: s, onTTFB: i, onINP: r } = await Promise.resolve().then(() => ln), o = (l) => (c) => {
        const d = Number(c.value.toFixed(2));
        this.sendVital({ type: l, value: d });
      };
      e(o("LCP"), { reportAllChanges: !1 }), t(o("CLS"), { reportAllChanges: !1 }), s(o("FCP"), { reportAllChanges: !1 }), i(o("TTFB"), { reportAllChanges: !1 }), r(o("INP"), { reportAllChanges: !1 });
    } catch (e) {
      a("debug", "Failed to load web-vitals library, using fallback", { error: e }), this.observeWebVitalsFallback();
    }
  }
  reportTTFB() {
    try {
      const e = performance.getEntriesByType("navigation")[0];
      if (!e)
        return;
      const t = e.responseStart;
      typeof t == "number" && Number.isFinite(t) && this.sendVital({ type: "TTFB", value: Number(t.toFixed(2)) });
    } catch (e) {
      a("debug", "Failed to report TTFB", { error: e });
    }
  }
  /**
   * Buffers a measured metric for the current navigation, ready for
   * consolidation into ONE event. Runs the threshold filter FIRST — a
   * filtered-out sample must never touch navigation-boundary bookkeeping —
   * then, on a genuine navigation-boundary change (a new navId the buffer
   * isn't already tracking), flushes whatever was buffered for the previous
   * navigation before starting a fresh one: SPA route changes never fire
   * `pagehide`, so that's the only chance to ship it.
   *
   * When no navigation id is available (navigation timing unsupported), the
   * sample is still buffered — boundaries just stop being detectable, so the
   * buffer ships on the next lifecycle flush instead. Degraded, never silent.
   */
  sendVital(e) {
    if (!this.shouldSendVital(e.type, e.value))
      return;
    const t = this.getNavigationId();
    if (t) {
      if (!this.seenNavIds.has(t) && (this.seenNavIds.add(t), this.navigationHistory.push(t), this.navigationHistory.length > jt)) {
        const s = this.navigationHistory.shift();
        s && this.seenNavIds.delete(s);
      }
      t !== this.currentBufferNavId && (this.flushConsolidatedVitals(), this.currentBufferNavId = t);
    }
    this.currentBuffer.set(e.type, e.value);
  }
  /**
   * Consolidates whatever is currently buffered into ONE `WEB_VITALS` event
   * and clears the buffer. No-op when nothing is buffered — safe to call
   * from both lifecycle listeners on every `pagehide`/hidden transition, and
   * from `sendVital` on every navigation-boundary change.
   *
   * @returns `true` when an event was tracked, `false` when the buffer was empty
   */
  flushConsolidatedVitals() {
    if (this.currentBuffer.size === 0)
      return !1;
    const e = Array.from(this.currentBuffer, ([t, s]) => ({ type: t, value: s })).sort(
      (t, s) => t.type.localeCompare(s.type)
    );
    return this.currentBuffer.clear(), this.eventManager.track({
      type: u.WEB_VITALS,
      web_vitals: {
        schema: "consolidated",
        metrics: e
      }
    }), !0;
  }
  /**
   * Flushes the buffer and, when it produced an event, delivers it right away
   * instead of leaving it for the next batch interval — the page is going away.
   *
   * `App` drains on the same transitions, but its listeners run BEFORE this one
   * (see `registerLifecycleListeners`), so by the time the consolidated event is
   * queued that drain has already happened. Draining here is what gets it out.
   *
   * @param canDeliver `false` when the caller must honour `flushOnPageHidden`
   *        being disabled — the event is still queued and ships on the
   *        `pagehide` drain instead.
   */
  flushAndDeliver(e) {
    !this.flushConsolidatedVitals() || !e || this.eventManager.flushImmediatelySync();
  }
  /**
   * Generates a deterministic navigation identifier for deduplication.
   *
   * **Purpose**: Every call within the same navigation must return the SAME id,
   * so the vitals buffer can collapse repeat reports of the same metric type
   * into one buffered value per navigation — critical for the fallback
   * observers, which fire per entry batch.
   *
   * **ID Format**: `{startTime}_{pathname}` or `{startTime}_{pathname}_{counter}`
   *
   * **Determinism**:
   * - Base id is derived only from the navigation entry's `startTime` (0 by spec
   *   for the document navigation — no `performance.now()` fallback, which made
   *   every call unique) and the current pathname.
   * - The id is cached per navigation; the counter suffix is appended ONLY on a
   *   real collision: a new navigation whose base id was already reported
   *   (SPA revisit to the same path, e.g. A→B→A), so the revisit's vitals are
   *   not suppressed by the first visit's dedup entries.
   *
   * @returns Navigation ID string or null if navigation timing unavailable
   *
   * @internal
   */
  getNavigationId() {
    try {
      const e = performance.getEntriesByType("navigation")[0];
      if (!e)
        return null;
      const t = `${e.startTime.toFixed(2)}_${window.location.pathname}`;
      return t === this.currentNavBase && this.currentNavId !== null ? this.currentNavId : (this.currentNavBase = t, this.currentNavId = this.seenNavIds.has(t) ? `${t}_${++this.navigationCounter}` : t, this.currentNavId);
    } catch (e) {
      return a("debug", "Failed to get navigation ID", { error: e }), null;
    }
  }
  isObserverSupported(e) {
    if (typeof PerformanceObserver > "u") return !1;
    const t = PerformanceObserver.supportedEntryTypes;
    return !t || t.includes(e);
  }
  safeObserve(e, t, s, i = !1) {
    try {
      if (!this.isObserverSupported(e))
        return !1;
      const r = new PerformanceObserver((o, l) => {
        try {
          t(o, l);
        } catch (c) {
          a("debug", "Observer callback failed", {
            error: c,
            data: { type: e }
          });
        }
        if (i)
          try {
            l.disconnect();
          } catch {
          }
      });
      return r.observe(s ?? { type: e, buffered: !0 }), i || this.observers.push(r), !0;
    } catch (r) {
      return a("debug", "Failed to create performance observer", {
        error: r,
        data: { type: e }
      }), !1;
    }
  }
  /**
   * `<=`: a value exactly AT the "good" boundary is good, matching web.dev's
   * classification — an LCP of exactly 2500 ms is not "needs improvement".
   *
   * 'all' mode keeps everything not by relying on that comparison but by having
   * no floor at all (`WEB_VITALS_ALL_THRESHOLDS` is `-Infinity`), so the
   * legitimate zeros survive: CLS is exactly `0` on a page that never shifts,
   * and TTFB reads `0` in Mobile Safari when the response is served from cache
   * (see `reportTTFB`'s comment).
   */
  shouldSendVital(e, t) {
    if (typeof t != "number" || !Number.isFinite(t))
      return a("debug", "Invalid web vital value", { data: { type: e, value: t } }), !1;
    const s = this.vitalThresholds[e];
    return !(typeof s == "number" && t <= s);
  }
}
class te extends _ {
  eventManager;
  emitter;
  recentErrors = /* @__PURE__ */ new Map();
  pageviewSignatureCounts = /* @__PURE__ */ new Map();
  errorBurstCounter = 0;
  burstWindowStart = 0;
  burstBackoffUntil = 0;
  pagehideHandler = null;
  pageviewResetListener = null;
  constructor(e, t) {
    super(), this.eventManager = e, this.emitter = t;
  }
  /**
   * Starts tracking JavaScript errors and promise rejections.
   *
   * - Registers global error event listener
   * - Registers unhandledrejection event listener
   * - Registers pagehide listener to reset the per-pageview signature counter
   * - Subscribes to emitter SESSION_START + PAGE_VIEW to reset the counter on new
   *   sessions and SPA route changes (the only signal `pagehide` does not cover)
   */
  startTracking() {
    window.addEventListener("error", this.handleError), window.addEventListener("unhandledrejection", this.handleRejection), this.pagehideHandler = () => {
      this.resetPageviewCounter();
    }, window.addEventListener("pagehide", this.pagehideHandler, { passive: !0 }), this.emitter && (this.pageviewResetListener = (e) => {
      (e.type === u.SESSION_START || e.type === u.PAGE_VIEW) && this.resetPageviewCounter();
    }, this.emitter.on(B.EVENT, this.pageviewResetListener));
  }
  /**
   * Stops tracking errors and cleans up resources.
   *
   * - Removes error event listeners
   * - Removes pagehide listener and unsubscribes from emitter
   * - Clears recent errors and pageview signature counters
   * - Resets burst detection counters
   */
  stopTracking() {
    window.removeEventListener("error", this.handleError), window.removeEventListener("unhandledrejection", this.handleRejection), this.pagehideHandler && (window.removeEventListener("pagehide", this.pagehideHandler), this.pagehideHandler = null), this.emitter && this.pageviewResetListener && (this.emitter.off(B.EVENT, this.pageviewResetListener), this.pageviewResetListener = null), this.recentErrors.clear(), this.pageviewSignatureCounts.clear(), this.errorBurstCounter = 0, this.burstWindowStart = 0, this.burstBackoffUntil = 0;
  }
  /**
   * Clears the per-pageview signature counter.
   *
   * Public so `App` or tests can drive a reset explicitly; the handler itself wires
   * `pagehide` and emitter `SESSION_START` / `PAGE_VIEW` in `startTracking()`.
   */
  resetPageviewCounter() {
    this.pageviewSignatureCounts.clear();
  }
  /**
   * Checks sampling rate and burst detection
   * Returns false if in cooldown period after burst detection
   */
  shouldSample() {
    const e = Date.now();
    if (e < this.burstBackoffUntil)
      return !1;
    if (e - this.burstWindowStart > $t && (this.errorBurstCounter = 0, this.burstWindowStart = e), this.errorBurstCounter++, this.errorBurstCounter > Xt)
      return this.burstBackoffUntil = e + Ge, a("debug", "Error burst detected - entering cooldown", {
        data: {
          errorsInWindow: this.errorBurstCounter,
          cooldownMs: Ge
        }
      }), !1;
    const s = this.get("config").errorSampling ?? it;
    return Math.random() < s;
  }
  /**
   * Returns true when the per-pageview signature cap has been hit for this error.
   * Dropped errors do not increment the counter — the 5s suppression window already
   * silences identical repeats, and double-counting here would skew the cap for any
   * later signature that recycles the same map key after a counter reset.
   */
  shouldThrottleBySignature(e) {
    const t = ys(e), s = this.pageviewSignatureCounts.get(t) ?? 0;
    if (s >= Wt)
      return a("debug", "Error throttled (pageview cap)", {
        data: { signature: t, count: s }
      }), !0;
    const i = s + 1;
    return this.pageviewSignatureCounts.set(t, i), this.pageviewSignatureCounts.size > Gt && (this.pageviewSignatureCounts.clear(), this.pageviewSignatureCounts.set(t, i)), !1;
  }
  handleError = (e) => {
    if (!this.shouldSample())
      return;
    const t = this.sanitizeMessage(e.message, "Unknown error");
    if (this.shouldSuppressError(V.JS_ERROR, t) || this.shouldThrottleBySignature({
      message: t,
      filename: e.filename,
      line: e.lineno,
      // Inline-script errors report the page URL as `filename`; passing the current
      // page URL lets buildErrorSignatureKey collapse them to origin, so every inline
      // script on a page shares one signature. normalizeFilename strips
      // query/hash internally.
      page_url: window.location.href
    }))
      return;
    const s = typeof e.error?.stack == "string" ? this.truncateStack(e.error.stack) : void 0, i = typeof e.error?.name == "string" && e.error.name !== "Error" ? e.error.name : void 0;
    this.eventManager.track({
      type: u.ERROR,
      error_data: {
        type: V.JS_ERROR,
        message: t,
        ...i !== void 0 && { name: i },
        ...e.filename !== "" && { filename: e.filename },
        ...e.lineno !== 0 && { line: e.lineno },
        ...e.colno !== 0 && { column: e.colno },
        ...s !== void 0 && { stack: s }
      }
    });
  };
  handleRejection = (e) => {
    if (!this.shouldSample())
      return;
    const t = this.extractRejectionMessage(e.reason), s = this.sanitizeMessage(t, "Unknown rejection");
    if (this.shouldSuppressError(V.PROMISE_REJECTION, s) || this.shouldThrottleBySignature({ message: s }))
      return;
    const i = e.reason instanceof Error && typeof e.reason.stack == "string" ? this.truncateStack(e.reason.stack) : void 0, r = e.reason instanceof Error && e.reason.name !== "Error" ? e.reason.name : void 0;
    this.eventManager.track({
      type: u.ERROR,
      error_data: {
        type: V.PROMISE_REJECTION,
        message: s,
        ...r !== void 0 && { name: r },
        ...i !== void 0 && { stack: i }
      }
    });
  };
  extractRejectionMessage(e) {
    if (e == null) return "Unknown rejection";
    if (typeof e == "string") return e;
    if (e instanceof Error)
      return e.message;
    if (typeof e == "object" && "message" in e)
      return String(e.message);
    try {
      return JSON.stringify(e);
    } catch {
      return "Unserializable rejection";
    }
  }
  sanitize(e) {
    const t = e.length > $e ? e.slice(0, $e) + "..." : e;
    return R(t);
  }
  /**
   * Sanitizes an error message and guarantees a non-empty result.
   *
   * An empty `error_data.message` (from a `Promise.reject('')`, `new Error('')`,
   * or `{ message: '' }` reason — all of which stringify to '') may be rejected
   * by a strict receiver, which would drop the whole batch and its co-traveling
   * events. Every error path must fall back to a non-empty placeholder.
   */
  sanitizeMessage(e, t) {
    return this.sanitize(e) || t;
  }
  shouldSuppressError(e, t) {
    const s = Date.now(), i = `${e}:${t}`, r = this.recentErrors.get(i);
    return r !== void 0 && s - r < We ? (this.recentErrors.set(i, s), !0) : (this.recentErrors.set(i, s), this.recentErrors.size > Bt ? (this.recentErrors.clear(), this.recentErrors.set(i, s), !1) : (this.recentErrors.size > j && this.pruneOldErrors(), !1));
  }
  static TRUNCATION_SUFFIX = `
...truncated`;
  truncateStack(e) {
    if (e.length <= Xe) return R(e);
    const t = Xe - te.TRUNCATION_SUFFIX.length, s = e.slice(0, t) + te.TRUNCATION_SUFFIX;
    return R(s);
  }
  pruneOldErrors() {
    const e = Date.now();
    for (const [i, r] of this.recentErrors.entries())
      e - r > We && this.recentErrors.delete(i);
    if (this.recentErrors.size <= j)
      return;
    const t = Array.from(this.recentErrors.entries()).sort((i, r) => i[1] - r[1]), s = this.recentErrors.size - j;
    for (let i = 0; i < s; i += 1) {
      const r = t[i];
      r && this.recentErrors.delete(r[0]);
    }
  }
}
class Us extends _ {
  isInitialized = !1;
  suppressNextScrollTimer = null;
  pageUnloadHandler = null;
  pageShowHandler = null;
  visibilityFlushHandler = null;
  prerenderActivationHandler = null;
  emitter = new gs();
  managers = {};
  handlers = {};
  get initialized() {
    return this.isInitialized;
  }
  /**
   * Initializes Spoorly with configuration.
   *
   * @internal Called from api.init()
   */
  async init(e = {}) {
    if (this.isInitialized)
      return { sessionId: this.get("sessionId") ?? "" };
    this.managers.storage = new ks();
    try {
      return this.setupState(e), this.managers.event = new Ms(this.managers.storage, this.emitter), this.loadPersistedIdentity(), this.initializeHandlers(), this.setupPageLifecycleListeners(), await this.managers.event.recoverPersistedEvents().catch((t) => {
        a("warn", "Failed to recover persisted events", { error: t });
      }), this.isInitialized = !0, { sessionId: this.get("sessionId") ?? "" };
    } catch (t) {
      this.destroy(!0);
      const s = t instanceof Error ? t.message : String(t);
      throw new Error(`[spoorly] spoorly initialization failed: ${s}`, { cause: t });
    }
  }
  /**
   * Sends a custom event with optional metadata and options.
   *
   * @internal Called from api.event()
   */
  sendCustomEvent(e, t, s) {
    if (!this.managers.event) {
      a("warn", "Cannot send custom event: spoorly not initialized", { data: { name: e } });
      return;
    }
    let i = t;
    t && typeof t == "object" && !Array.isArray(t) && Object.getPrototypeOf(t) !== Object.prototype && (i = Object.assign({}, t));
    const { valid: r, error: o, sanitizedMetadata: l } = fs(e, i);
    if (!r) {
      if (this.get("mode") === Z.QA)
        throw new Error(`[spoorly] Custom event "${e}" validation failed: ${o}`);
      a("warn", `Custom event "${e}" dropped: ${o}`);
      return;
    }
    this.managers.event.track({
      type: u.CUSTOM,
      custom_event: {
        name: e,
        ...l && { metadata: l }
      }
    }), s?.critical === !0 && (this.managers.event.flushImmediatelySync() || a("debug", "Critical event flush returned false (deferred to in-flight send or empty queue)", {
      data: { name: e }
    }));
  }
  on(e, t) {
    this.emitter.on(e, t);
  }
  off(e, t) {
    this.emitter.off(e, t);
  }
  /**
   * Destroys the Spoorly instance and cleans up all resources.
   *
   * @internal Called from api.destroy()
   */
  destroy(e = !1) {
    !this.isInitialized && !e || (Object.values(this.handlers).filter(Boolean).forEach((t) => {
      try {
        t.stopTracking();
      } catch (s) {
        a("warn", "Failed to stop tracking", { error: s });
      }
    }), this.suppressNextScrollTimer && (clearTimeout(this.suppressNextScrollTimer), this.suppressNextScrollTimer = null), this.pageUnloadHandler && (window.removeEventListener("pagehide", this.pageUnloadHandler), window.removeEventListener("beforeunload", this.pageUnloadHandler), this.pageUnloadHandler = null), this.pageShowHandler && (window.removeEventListener("pageshow", this.pageShowHandler), this.pageShowHandler = null), this.visibilityFlushHandler && (document.removeEventListener("visibilitychange", this.visibilityFlushHandler), this.visibilityFlushHandler = null), this.prerenderActivationHandler && (document.removeEventListener("prerenderingchange", this.prerenderActivationHandler), this.prerenderActivationHandler = null), this.managers.event?.flushImmediatelySync(), this.managers.event?.stop(), this.emitter.removeAllListeners(), this.set("suppressNextScroll", !1), this.set("sessionId", null), this.set("identity", void 0), this.clearPersistedIdentity(), this.isInitialized = !1, this.handlers = {}, this.managers = {});
  }
  setupState(e = {}) {
    this.set("config", e), this.set("apiUrl", e.endpoint);
    const t = Ns.getId(this.managers.storage);
    this.set("userId", t);
    const s = xt();
    this.set("device", s);
    const i = C(window.location.href, e.sensitiveQueryParams);
    this.set("pageUrl", i), es() && this.set("mode", Z.QA);
  }
  /**
   * @internal Used by api.ts for configuration access
   */
  getConfig() {
    return this.get("config");
  }
  /**
   * @internal Used by api.ts for event operations
   */
  getEventManager() {
    return this.managers.event;
  }
  /**
   * @internal Used by api.getSessionId()
   */
  getSessionId() {
    return this.get("sessionId");
  }
  /**
   * @internal Used by api.getUserId()
   */
  getUserId() {
    return this.get("userId");
  }
  /**
   * Associates the current anonymous visitor with a known user identity.
   *
   * Identity is persisted to localStorage and included in every
   * subsequent batch payload so the endpoint always receives the latest identity.
   *
   * @param userId - External user identifier (email, customer_id, etc.). Trimmed; max 256 chars.
   * @param traits - Optional user attributes (name, email, plan, etc.). Only string values
   *   are kept; non-string fields, arrays, and null are dropped silently.
   *
   * @internal Called from api.identify()
   */
  identify(e, t) {
    if (!e || typeof e != "string" || e.trim().length === 0) {
      a("warn", "identify() called with invalid userId", {
        data: { type: typeof e, length: typeof e == "string" ? e.trim().length : 0 }
      });
      return;
    }
    if (e.trim().length > 256) {
      a("warn", "identify() userId exceeds 256 characters", { data: { length: e.trim().length } });
      return;
    }
    const s = e.trim(), i = _e(t), r = {
      userId: s,
      ...i ? { traits: i } : {}
    };
    this.set("identity", r), this.persistIdentity(r), a("debug", "Visitor identified", {
      data: { userIdLength: s.length, traitKeys: i ? Object.keys(i) : [] }
    });
  }
  /**
   * Clears identity, regenerates UUID, and starts a fresh session.
   *
   * Use for logout flows: events already sent keep the previous identity,
   * and the next user in the same browser gets a clean anonymous profile.
   *
   * Pending events are flushed under the OLD identity first via async fetch.
   * Then the identity is cleared, the userId is regenerated, and the session handler is
   * restarted to emit a new `SESSION_START`.
   *
   * @internal Called from api.resetIdentity()
   */
  async resetIdentity() {
    await this.managers.event?.flushImmediately().catch((t) => (a("debug", "Failed to flush before identity reset", { error: t }), !1)), this.set("identity", void 0), this.clearPersistedIdentity();
    const e = ot();
    this.managers.storage.setItem(ge, e), this.set("userId", e), this.set("hasStartSession", !1), this.set("sessionId", null), this.handlers.session?.stopTracking(), this.handlers.session?.startTracking(), a("debug", "Identity reset, new UUID generated");
  }
  /**
   * Persists identity to localStorage under `spoorly:identity`.
   */
  persistIdentity(e) {
    try {
      const t = ae;
      this.managers.storage.setItem(t, JSON.stringify(e));
    } catch {
      a("debug", "Failed to persist identity to localStorage");
    }
  }
  /**
   * Loads identity from localStorage on init.
   * Also migrates pending identity (set before init) to `spoorly:identity`.
   */
  loadPersistedIdentity() {
    const e = this.managers.storage, t = ae;
    try {
      const s = e.getItem(k);
      if (s) {
        const i = JSON.parse(s);
        if (e.removeItem(k), !this.isValidIdentityData(i)) {
          a("debug", "Invalid pending identity in localStorage, discarded");
          return;
        }
        const r = this.normalizePersistedIdentity(i);
        e.setItem(t, JSON.stringify(r)), this.set("identity", r), a("debug", "Migrated pending identity");
        return;
      }
    } catch {
      e.removeItem(k);
    }
    try {
      const s = e.getItem(t);
      if (s) {
        const i = JSON.parse(s);
        if (!this.isValidIdentityData(i)) {
          e.removeItem(t), a("debug", "Invalid persisted identity in localStorage, discarded");
          return;
        }
        const r = this.normalizePersistedIdentity(i);
        this.set("identity", r), a("debug", "Loaded persisted identity");
      }
    } catch {
      a("debug", "Failed to load persisted identity");
    }
  }
  /**
   * Validates identity data loaded from localStorage. `traits` is intentionally
   * accepted as `unknown` here: `normalizePersistedIdentity()` runs it through
   * `sanitizeTraits()` so tampered values are dropped silently instead of
   * rejecting an otherwise-valid identity.
   */
  isValidIdentityData(e) {
    if (!e || typeof e != "object") return !1;
    const { userId: t } = e;
    return !(typeof t != "string" || t.trim().length === 0 || t.trim().length > 256);
  }
  /**
   * Trims the `userId` and re-sanitizes `traits` through the same gate
   * `identify()` uses at call time, defending later batches against tampered
   * localStorage values.
   */
  normalizePersistedIdentity(e) {
    const t = _e(e.traits);
    return {
      userId: e.userId.trim(),
      ...t ? { traits: t } : {}
    };
  }
  /**
   * Clears persisted identity from localStorage.
   */
  clearPersistedIdentity() {
    try {
      const e = this.managers.storage;
      e.removeItem(ae), e.removeItem(k);
    } catch {
      a("debug", "Failed to clear persisted identity");
    }
  }
  setupPageLifecycleListeners() {
    this.pageUnloadHandler = () => {
      this.managers.event?.flushImmediatelySync();
    }, this.pageShowHandler = (e) => {
      e.persisted && this.managers.event?.recoverPersistedEvents().catch((t) => {
        a("warn", "Failed to recover persisted events on bfcache restore", { error: t });
      });
    }, this.visibilityFlushHandler = () => {
      typeof document > "u" || !document.hidden || this.get("config").flushOnPageHidden !== !1 && this.managers.event?.flushImmediatelySync();
    }, window.addEventListener("pagehide", this.pageUnloadHandler), window.addEventListener("beforeunload", this.pageUnloadHandler), window.addEventListener("pageshow", this.pageShowHandler), document.addEventListener("visibilitychange", this.visibilityFlushHandler);
  }
  initializeHandlers() {
    this.handlers.session = new Rs(
      this.managers.storage,
      this.managers.event
    ), this.handlers.session.startTracking();
    const e = () => {
      this.set("suppressNextScroll", !0), this.suppressNextScrollTimer && clearTimeout(this.suppressNextScrollTimer), this.suppressNextScrollTimer = window.setTimeout(() => {
        this.set("suppressNextScroll", !1);
      }, 500);
    };
    this.handlers.pageView = new Cs(this.managers.event, e), this.handlers.click = new Os(this.managers.event), this.handlers.scroll = new Ps(this.managers.event), this.handlers.performance = new Ds(this.managers.event), this.handlers.error = new te(this.managers.event, this.emitter);
    const t = () => {
      this.handlers.pageView?.startTracking(), this.handlers.click?.startTracking(), this.handlers.scroll?.startTracking(), this.handlers.performance?.startTracking().catch((s) => {
        a("warn", "Failed to start performance tracking", { error: s });
      }), this.handlers.error?.startTracking();
    };
    rt() ? (this.prerenderActivationHandler = () => {
      this.prerenderActivationHandler = null, t();
    }, document.addEventListener("prerenderingchange", this.prerenderActivationHandler, { once: !0 })) : t();
  }
}
const O = [];
let f = null, U = !1, A = !1, L = null, ye;
const Fs = async (n) => typeof window > "u" || typeof document > "u" ? { sessionId: "" } : (A = !1, window.__spoorlyDisabled === !0 ? { sessionId: "" } : f ? (JSON.stringify(n ?? {}) !== JSON.stringify(ye ?? {}) && a(
  "warn",
  "init() was called again with a different config, which is ignored. Call destroy() first to re-initialize."
), { sessionId: f.getSessionId() ?? "" }) : (U && L || (U = !0, L = (async () => {
  try {
    const e = cs(n ?? {}), t = new Us();
    try {
      O.forEach(({ event: o, callback: l }) => {
        t.on(o, l);
      }), O.length = 0;
      const s = t.init(e), i = new Promise((o, l) => {
        setTimeout(() => {
          l(new Error("[spoorly] Initialization timeout after 10000ms"));
        }, 1e4);
      }), r = await Promise.race([s, i]);
      return f = t, ye = n, r;
    } catch (s) {
      try {
        t.destroy(!0);
      } catch (i) {
        a("error", "Failed to cleanup partially initialized app", { error: i });
      }
      throw s;
    }
  } catch (e) {
    throw f = null, e;
  } finally {
    U = !1, L = null;
  }
})()), L)), Vs = (n, e, t) => {
  if (!(typeof window > "u" || typeof document > "u")) {
    if (!f)
      throw new Error("[spoorly] spoorly not initialized. Please call init() first.");
    if (A)
      throw new Error("[spoorly] Cannot send events while spoorly is being destroyed");
    f.sendCustomEvent(n, e, t);
  }
}, Hs = (n, e) => {
  if (!(typeof window > "u" || typeof document > "u")) {
    if (!f || U) {
      O.push({ event: n, callback: e });
      return;
    }
    f.on(n, e);
  }
}, xs = (n, e) => {
  if (!(typeof window > "u" || typeof document > "u")) {
    if (!f) {
      const t = O.findIndex((s) => s.event === n && s.callback === e);
      t !== -1 && O.splice(t, 1);
      return;
    }
    f.off(n, e);
  }
}, Bs = () => typeof window > "u" || typeof document > "u" ? !1 : f !== null, $s = () => typeof window > "u" || typeof document > "u" || !f ? null : f.getSessionId(), Xs = () => typeof window > "u" || typeof document > "u" || !f ? null : f.getUserId(), Ws = () => {
  if (!(typeof window > "u" || typeof document > "u")) {
    if (A)
      throw new Error("[spoorly] Destroy operation already in progress");
    if (!f) {
      A = !1;
      return;
    }
    A = !0, ye = void 0;
    try {
      f.destroy(), f = null, U = !1, L = null, O.length = 0, A = !1;
    } catch (n) {
      f = null, U = !1, L = null, O.length = 0, A = !1, a("warn", "Error during destroy, forced cleanup completed", { error: n });
    }
  }
}, Gs = (n, e) => {
  if (!(typeof window > "u" || typeof document > "u")) {
    if (!n || typeof n != "string" || n.trim().length === 0) {
      a("warn", "identify() called with invalid userId");
      return;
    }
    if (n.trim().length > 256) {
      a("warn", "identify() userId exceeds 256 characters");
      return;
    }
    if (A) {
      a("warn", "Cannot identify while spoorly is being destroyed");
      return;
    }
    if (f) {
      f.identify(n, e);
      return;
    }
    try {
      const t = _e(e), s = {
        userId: n.trim(),
        ...t ? { traits: t } : {}
      };
      localStorage.setItem(k, JSON.stringify(s)), a("debug", "Identity persisted pre-init (will be applied on init)");
    } catch {
      a("debug", "Failed to persist pre-init identity");
    }
  }
}, zs = async () => {
  if (!(typeof window > "u" || typeof document > "u")) {
    if (!f) {
      try {
        localStorage.removeItem(k);
      } catch {
      }
      return;
    }
    if (A)
      throw new Error("[spoorly] Cannot reset identity while spoorly is being destroyed");
    await f.resetIdentity();
  }
}, cn = {
  init: Fs,
  event: Vs,
  on: Hs,
  off: xs,
  isInitialized: Bs,
  getSessionId: $s,
  getUserId: Xs,
  destroy: Ws,
  identify: Gs,
  resetIdentity: zs
};
var Ie, N, x, at, se, lt = -1, P = function(n) {
  addEventListener("pageshow", (function(e) {
    e.persisted && (lt = e.timeStamp, n(e));
  }), !0);
}, Ce = function() {
  var n = self.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
  if (n && n.responseStart > 0 && n.responseStart < performance.now()) return n;
}, ie = function() {
  var n = Ce();
  return n && n.activationStart || 0;
}, E = function(n, e) {
  var t = Ce(), s = "navigate";
  return lt >= 0 ? s = "back-forward-cache" : t && (document.prerendering || ie() > 0 ? s = "prerender" : document.wasDiscarded ? s = "restore" : t.type && (s = t.type.replace(/_/g, "-"))), { name: n, value: e === void 0 ? -1 : e, rating: "good", delta: 0, entries: [], id: "v4-".concat(Date.now(), "-").concat(Math.floor(8999999999999 * Math.random()) + 1e12), navigationType: s };
}, F = function(n, e, t) {
  try {
    if (PerformanceObserver.supportedEntryTypes.includes(n)) {
      var s = new PerformanceObserver((function(i) {
        Promise.resolve().then((function() {
          e(i.getEntries());
        }));
      }));
      return s.observe(Object.assign({ type: n, buffered: !0 }, t || {})), s;
    }
  } catch {
  }
}, v = function(n, e, t, s) {
  var i, r;
  return function(o) {
    e.value >= 0 && (o || s) && ((r = e.value - (i || 0)) || i === void 0) && (i = e.value, e.delta = r, e.rating = (function(l, c) {
      return l > c[1] ? "poor" : l > c[0] ? "needs-improvement" : "good";
    })(e.value, t), n(e));
  };
}, Oe = function(n) {
  requestAnimationFrame((function() {
    return requestAnimationFrame((function() {
      return n();
    }));
  }));
}, $ = function(n) {
  document.addEventListener("visibilitychange", (function() {
    document.visibilityState === "hidden" && n();
  }));
}, re = function(n) {
  var e = !1;
  return function() {
    e || (n(), e = !0);
  };
}, D = -1, Ze = function() {
  return document.visibilityState !== "hidden" || document.prerendering ? 1 / 0 : 0;
}, ne = function(n) {
  document.visibilityState === "hidden" && D > -1 && (D = n.type === "visibilitychange" ? n.timeStamp : 0, Qs());
}, et = function() {
  addEventListener("visibilitychange", ne, !0), addEventListener("prerenderingchange", ne, !0);
}, Qs = function() {
  removeEventListener("visibilitychange", ne, !0), removeEventListener("prerenderingchange", ne, !0);
}, Pe = function() {
  return D < 0 && (D = Ze(), et(), P((function() {
    setTimeout((function() {
      D = Ze(), et();
    }), 0);
  }))), { get firstHiddenTime() {
    return D;
  } };
}, X = function(n) {
  document.prerendering ? addEventListener("prerenderingchange", (function() {
    return n();
  }), !0) : n();
}, we = [1800, 3e3], ct = function(n, e) {
  e = e || {}, X((function() {
    var t, s = Pe(), i = E("FCP"), r = F("paint", (function(o) {
      o.forEach((function(l) {
        l.name === "first-contentful-paint" && (r.disconnect(), l.startTime < s.firstHiddenTime && (i.value = Math.max(l.startTime - ie(), 0), i.entries.push(l), t(!0)));
      }));
    }));
    r && (t = v(n, i, we, e.reportAllChanges), P((function(o) {
      i = E("FCP"), t = v(n, i, we, e.reportAllChanges), Oe((function() {
        i.value = performance.now() - o.timeStamp, t(!0);
      }));
    })));
  }));
}, Ae = [0.1, 0.25], Ks = function(n, e) {
  e = e || {}, ct(re((function() {
    var t, s = E("CLS", 0), i = 0, r = [], o = function(c) {
      c.forEach((function(d) {
        if (!d.hadRecentInput) {
          var h = r[0], p = r[r.length - 1];
          i && d.startTime - p.startTime < 1e3 && d.startTime - h.startTime < 5e3 ? (i += d.value, r.push(d)) : (i = d.value, r = [d]);
        }
      })), i > s.value && (s.value = i, s.entries = r, t());
    }, l = F("layout-shift", o);
    l && (t = v(n, s, Ae, e.reportAllChanges), $((function() {
      o(l.takeRecords()), t(!0);
    })), P((function() {
      i = 0, s = E("CLS", 0), t = v(n, s, Ae, e.reportAllChanges), Oe((function() {
        return t();
      }));
    })), setTimeout(t, 0));
  })));
}, ut = 0, he = 1 / 0, Q = 0, js = function(n) {
  n.forEach((function(e) {
    e.interactionId && (he = Math.min(he, e.interactionId), Q = Math.max(Q, e.interactionId), ut = Q ? (Q - he) / 7 + 1 : 0);
  }));
}, dt = function() {
  return Ie ? ut : performance.interactionCount || 0;
}, Ys = function() {
  "interactionCount" in performance || Ie || (Ie = F("event", js, { type: "event", buffered: !0, durationThreshold: 0 }));
}, I = [], Y = /* @__PURE__ */ new Map(), ht = 0, qs = function() {
  var n = Math.min(I.length - 1, Math.floor((dt() - ht) / 50));
  return I[n];
}, Js = [], Zs = function(n) {
  if (Js.forEach((function(i) {
    return i(n);
  })), n.interactionId || n.entryType === "first-input") {
    var e = I[I.length - 1], t = Y.get(n.interactionId);
    if (t || I.length < 10 || n.duration > e.latency) {
      if (t) n.duration > t.latency ? (t.entries = [n], t.latency = n.duration) : n.duration === t.latency && n.startTime === t.entries[0].startTime && t.entries.push(n);
      else {
        var s = { id: n.interactionId, latency: n.duration, entries: [n] };
        Y.set(s.id, s), I.push(s);
      }
      I.sort((function(i, r) {
        return r.latency - i.latency;
      })), I.length > 10 && I.splice(10).forEach((function(i) {
        return Y.delete(i.id);
      }));
    }
  }
}, ft = function(n) {
  var e = self.requestIdleCallback || self.setTimeout, t = -1;
  return n = re(n), document.visibilityState === "hidden" ? n() : (t = e(n), $(n)), t;
}, Me = [200, 500], en = function(n, e) {
  "PerformanceEventTiming" in self && "interactionId" in PerformanceEventTiming.prototype && (e = e || {}, X((function() {
    var t;
    Ys();
    var s, i = E("INP"), r = function(l) {
      ft((function() {
        l.forEach(Zs);
        var c = qs();
        c && c.latency !== i.value && (i.value = c.latency, i.entries = c.entries, s());
      }));
    }, o = F("event", r, { durationThreshold: (t = e.durationThreshold) !== null && t !== void 0 ? t : 40 });
    s = v(n, i, Me, e.reportAllChanges), o && (o.observe({ type: "first-input", buffered: !0 }), $((function() {
      r(o.takeRecords()), s(!0);
    })), P((function() {
      ht = dt(), I.length = 0, Y.clear(), i = E("INP"), s = v(n, i, Me, e.reportAllChanges);
    })));
  })));
}, Ne = [2500, 4e3], fe = {}, tn = function(n, e) {
  e = e || {}, X((function() {
    var t, s = Pe(), i = E("LCP"), r = function(c) {
      e.reportAllChanges || (c = c.slice(-1)), c.forEach((function(d) {
        d.startTime < s.firstHiddenTime && (i.value = Math.max(d.startTime - ie(), 0), i.entries = [d], t());
      }));
    }, o = F("largest-contentful-paint", r);
    if (o) {
      t = v(n, i, Ne, e.reportAllChanges);
      var l = re((function() {
        fe[i.id] || (r(o.takeRecords()), o.disconnect(), fe[i.id] = !0, t(!0));
      }));
      ["keydown", "click"].forEach((function(c) {
        addEventListener(c, (function() {
          return ft(l);
        }), { once: !0, capture: !0 });
      })), $(l), P((function(c) {
        i = E("LCP"), t = v(n, i, Ne, e.reportAllChanges), Oe((function() {
          i.value = performance.now() - c.timeStamp, fe[i.id] = !0, t(!0);
        }));
      }));
    }
  }));
}, be = [800, 1800], sn = function n(e) {
  document.prerendering ? X((function() {
    return n(e);
  })) : document.readyState !== "complete" ? addEventListener("load", (function() {
    return n(e);
  }), !0) : setTimeout(e, 0);
}, nn = function(n, e) {
  e = e || {};
  var t = E("TTFB"), s = v(n, t, be, e.reportAllChanges);
  sn((function() {
    var i = Ce();
    i && (t.value = Math.max(i.responseStart - ie(), 0), t.entries = [i], s(!0), P((function() {
      t = E("TTFB", 0), (s = v(n, t, be, e.reportAllChanges))(!0);
    })));
  }));
}, H = { passive: !0, capture: !0 }, rn = /* @__PURE__ */ new Date(), tt = function(n, e) {
  N || (N = e, x = n, at = /* @__PURE__ */ new Date(), mt(removeEventListener), gt());
}, gt = function() {
  if (x >= 0 && x < at - rn) {
    var n = { entryType: "first-input", name: N.type, target: N.target, cancelable: N.cancelable, startTime: N.timeStamp, processingStart: N.timeStamp + x };
    se.forEach((function(e) {
      e(n);
    })), se = [];
  }
}, on = function(n) {
  if (n.cancelable) {
    var e = (n.timeStamp > 1e12 ? /* @__PURE__ */ new Date() : performance.now()) - n.timeStamp;
    n.type == "pointerdown" ? (function(t, s) {
      var i = function() {
        tt(t, s), o();
      }, r = function() {
        o();
      }, o = function() {
        removeEventListener("pointerup", i, H), removeEventListener("pointercancel", r, H);
      };
      addEventListener("pointerup", i, H), addEventListener("pointercancel", r, H);
    })(e, n) : tt(e, n);
  }
}, mt = function(n) {
  ["mousedown", "keydown", "touchstart", "pointerdown"].forEach((function(e) {
    return n(e, on, H);
  }));
}, Le = [100, 300], an = function(n, e) {
  e = e || {}, X((function() {
    var t, s = Pe(), i = E("FID"), r = function(c) {
      c.startTime < s.firstHiddenTime && (i.value = c.processingStart - c.startTime, i.entries.push(c), t(!0));
    }, o = function(c) {
      c.forEach(r);
    }, l = F("first-input", o);
    t = v(n, i, Le, e.reportAllChanges), l && ($(re((function() {
      o(l.takeRecords()), l.disconnect();
    }))), P((function() {
      var c;
      i = E("FID"), t = v(n, i, Le, e.reportAllChanges), se = [], x = -1, N = null, mt(addEventListener), c = r, se.push(c), gt();
    })));
  }));
};
const ln = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  CLSThresholds: Ae,
  FCPThresholds: we,
  FIDThresholds: Le,
  INPThresholds: Me,
  LCPThresholds: Ne,
  TTFBThresholds: be,
  onCLS: Ks,
  onFCP: ct,
  onFID: an,
  onINP: en,
  onLCP: tn,
  onTTFB: nn
}, Symbol.toStringTag, { value: "Module" }));
export {
  B as EmitterEvent,
  u as EventType,
  as as PII_PATTERNS,
  cn as spoorly
};
