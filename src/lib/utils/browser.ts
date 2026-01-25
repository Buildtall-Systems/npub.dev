export type BrowserType = 'chrome' | 'firefox' | 'safari' | 'edge' | 'mobile' | 'unknown';

export function detectBrowser(): BrowserType {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'unknown';
  }

  const ua = navigator.userAgent;

  if (/Mobile|Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return 'mobile';
  }

  if (/Edg\//i.test(ua)) {
    return 'edge';
  }

  if (/Firefox\//i.test(ua)) {
    return 'firefox';
  }

  if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) {
    return 'safari';
  }

  if (/Chrome\//i.test(ua)) {
    return 'chrome';
  }

  return 'unknown';
}

export function supportsExtensions(browser: BrowserType): boolean {
  return browser === 'chrome' || browser === 'firefox' || browser === 'edge';
}

export function getBrowserDisplayName(browser: BrowserType): string {
  const names: Record<BrowserType, string> = {
    chrome: 'Chrome',
    firefox: 'Firefox',
    safari: 'Safari',
    edge: 'Edge',
    mobile: 'Mobile Browser',
    unknown: 'Your Browser'
  };
  return names[browser];
}
