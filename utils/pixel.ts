
export const FB_PIXEL_ID = '1322350008857541';

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

/**
 * Initializes the Facebook Pixel script.
 * Call this once in the entry point or public pages.
 */
export const initPixel = () => {
  if (typeof window === 'undefined') return;
  if (window.fbq) return;

  const n: any = (window as any).fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  };
  if (!window._fbq) window._fbq = n;
  n.push = n;
  n.loaded = !0;
  n.version = '2.0';
  n.queue = [];

  const t = document.createElement('script');
  t.async = !0;
  t.src = 'https://connect.facebook.net/en_US/fbevents.js';
  const s = document.getElementsByTagName('script')[0];
  s.parentNode?.insertBefore(t, s);

  window.fbq('init', FB_PIXEL_ID);
};

/**
 * Tracks a PageView event.
 * Always allowed regardless of cookie consent (neutral event).
 */
export const pageView = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
};

/**
 * Tracks a custom or standard event.
 * Only fires if user has accepted cookies.
 */
export const trackEvent = (eventName: string, data?: any) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, data);
  }
};
