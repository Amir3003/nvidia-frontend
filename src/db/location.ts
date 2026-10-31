import type { Opportunity } from './opportunities';
import { VALID_CITIES } from './cities';

// Profile location is "City, Country". Returns the country, or '' if unknown.
export function profileCountry(location: string): string {
  const value = location.trim();
  if (!value) return '';
  if (value.includes(',')) return value.split(',').pop()!.trim();
  const known = VALID_CITIES.find((c) => c.toLowerCase().startsWith(value.toLowerCase() + ','));
  return known ? known.split(',').pop()!.trim() : '';
}

const OPEN_ANYWHERE = /online|virtual|remote|worldwide|global|international|anywhere/i;

// True when the source says the opportunity is open from this country: it is
// online or worldwide, or it names the country. Unknown location returns false.
export function availableIn(opp: Opportunity, country: string): boolean {
  if (!country) return false;
  const c = country.toLowerCase();
  if ((opp.countries || []).some((x) => x.toLowerCase() === c)) return true;
  return OPEN_ANYWHERE.test(opp.location) || opp.location.toLowerCase().includes(c);
}
