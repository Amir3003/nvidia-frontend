// Analytics consent. The choice lives in localStorage (not a cookie) under one key and is never
// sent to a server. The only optional processing is Vercel Web Analytics, loaded after Accept.
export type ConsentChoice = 'granted' | 'denied';
export type ConsentState = ConsentChoice | 'unset';

const KEY = 'qadam_consent_analytics_v1';
const EVENT = 'qadam:consent-change';

export function getConsent(): ConsentState {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === 'granted' || value === 'denied' ? value : 'unset';
  } catch {
    return 'unset';
  }
}

export function subscribeConsent(listener: () => void): () => void {
  window.addEventListener(EVENT, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener('storage', listener);
  };
}

// null clears the choice, which shows the banner again.
export function setConsent(choice: ConsentChoice | null): void {
  try {
    if (choice === null) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, choice);
  } catch {
    // Storage unavailable: the choice is not remembered and analytics stays off.
  }
  window.dispatchEvent(new Event(EVENT));
}
