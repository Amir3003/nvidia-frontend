import { CONTACT_EMAIL } from './pilotRequests';

// Operator details for the legal pages. They come from environment variables so nothing is
// invented in code; anything left unset is not shown.
const clean = (value: string | undefined): string | null => {
  const v = value?.trim();
  return v ? v : null;
};

export const legal = {
  operator: clean(import.meta.env.VITE_LEGAL_NAME) ?? 'QADAM Hub',
  address: clean(import.meta.env.VITE_LEGAL_ADDRESS),
  registrationId: clean(import.meta.env.VITE_LEGAL_REGISTRATION_ID),
  contactEmail: clean(import.meta.env.VITE_CONTACT_EMAIL) ?? CONTACT_EMAIL,
  siteUrl: 'https://www.qadamhub.com',
  lastUpdated: '26 October 2026',
};
