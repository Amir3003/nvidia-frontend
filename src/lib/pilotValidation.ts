import type { PilotRequest } from './pilotRequests';

// Keep these lists in sync with the checks in
// supabase/migrations/202610240001_pilot_requests_validation.sql.
export const PILOT_ROLES = ['Director', 'Program lead', 'Career staff', 'Other'];
export const PILOT_COHORT_SIZES = ['Under 30', '30 to 50', '50 to 100', 'Over 100'];

export type PilotErrors = Partial<Record<keyof PilotRequest, string>>;

const LETTER = /\p{L}/u;
const EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,24}$/;
const TELEGRAM = /^@[A-Za-z0-9_]{5,32}$/;
const PHONE_CHARS = /^\+?[0-9\s()-]+$/;
const PERSON_NAME = /^[\p{L}][\p{L}\s.'-]*$/u;
const PLACE_NAME = /^[\p{L}][\p{L}\s.'()-]*$/u;
const INSTITUTION = /^[\p{L}\p{N}\s.,&'"()«»№#/+-]+$/u;

// Rejects keyboard mashing such as "kjgfhkdtufd": a run of 6 consonants, 4 identical
// characters in a row, or a single "word" longer than 30 characters.
export function looksLikeGibberish(value: string): boolean {
  const text = value.toLowerCase();
  if (/(.)\1{3,}/u.test(text)) return true;
  if (/[bcdfghjklmnpqrstvwxz]{6,}/.test(text)) return true;
  if (/[бвгджзйклмнпрстфхцчшщ]{6,}/.test(text)) return true;
  return text.split(/\s+/).some((word) => word.length > 30);
}

function checkText(value: string, min: number, max: number, pattern: RegExp, label: string): string | undefined {
  if (value.length < min) return `Enter ${label}.`;
  if (value.length > max) return `Keep ${label} under ${max} characters.`;
  if (!LETTER.test(value) || !pattern.test(value) || looksLikeGibberish(value)) return `Enter a real ${label}.`;
  return undefined;
}

export function validatePilotRequest(request: PilotRequest): PilotErrors {
  const errors: PilotErrors = {};
  const institution = request.institution.trim();
  const name = request.contactName.trim();
  const email = request.email.trim();
  const phone = request.phone.trim();
  const city = request.city.trim();
  const message = request.message.trim();

  const institutionError = checkText(institution, 2, 160, INSTITUTION, 'institution name');
  if (institutionError) errors.institution = institutionError;

  const nameError = checkText(name, 2, 80, PERSON_NAME, 'name');
  if (nameError) errors.contactName = nameError;

  if (!PILOT_ROLES.includes(request.role)) errors.role = 'Choose your role.';

  if (!EMAIL.test(email) || looksLikeGibberish(email.split('@')[0])) errors.email = 'Enter a valid work email.';

  if (phone) {
    const digits = phone.replace(/\D/g, '');
    const validPhone = PHONE_CHARS.test(phone) && digits.length >= 10 && digits.length <= 15 && !/^(\d)\1+$/.test(digits);
    if (!TELEGRAM.test(phone) && !validPhone) {
      errors.phone = 'Enter a phone number with country code or a Telegram username like @your_school.';
    }
  }

  const cityError = checkText(city, 2, 60, PLACE_NAME, 'city');
  if (cityError) errors.city = cityError;

  if (!PILOT_COHORT_SIZES.includes(request.cohortSize)) errors.cohortSize = 'Choose the cohort size.';

  if (message) {
    if (message.length < 10) errors.message = 'Write at least a short sentence, or leave this empty.';
    else if (message.length > 1000) errors.message = 'Keep the message under 1000 characters.';
    else if (!/\s/.test(message) || looksLikeGibberish(message)) errors.message = 'Write a real message, or leave this empty.';
  }

  return errors;
}
