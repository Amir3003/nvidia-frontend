import * as Sentry from '@sentry/react';

// Error reporting is optional. Without VITE_SENTRY_DSN (local dev, previews
// without the variable) nothing is initialised and nothing is sent.
export function initErrorTracking(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    sendDefaultPii: false,
    // Errors only, no performance tracing.
    tracesSampleRate: 0,
    // Console output can contain profile or CV text, so keep it out of reports.
    beforeBreadcrumb: (breadcrumb) => (breadcrumb.category === 'console' ? null : breadcrumb),
  });
}

export const ErrorBoundary = Sentry.ErrorBoundary;
