import { networkClient } from './network';

export const CONTACT_EMAIL = 'a.nagiyev.dev@gmail.com';

export interface PilotRequest {
  institution: string;
  contactName: string;
  role: string;
  email: string;
  phone: string;
  city: string;
  cohortSize: string;
  message: string;
}

export function pilotRequestMailto(request: PilotRequest): string {
  const lines = [
    `Institution: ${request.institution}`,
    `Name: ${request.contactName}`,
    `Role: ${request.role || 'Not specified'}`,
    `Email: ${request.email}`,
    `Phone or Telegram: ${request.phone || 'Not specified'}`,
    `City: ${request.city || 'Not specified'}`,
    `Learners per cohort: ${request.cohortSize || 'Not specified'}`,
    '',
    request.message,
  ];
  const subject = `Pilot request: ${request.institution}`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
}

// Returns 'stored' when Supabase accepted the request, 'email' when the caller
// should fall back to the prepared email (no Supabase config or a failed insert).
export async function submitPilotRequest(request: PilotRequest): Promise<'stored' | 'email'> {
  if (!networkClient) return 'email';
  const { error } = await networkClient.from('pilot_requests').insert({
    institution: request.institution,
    contact_name: request.contactName,
    role: request.role,
    email: request.email,
    phone: request.phone,
    city: request.city,
    cohort_size: request.cohortSize,
    message: request.message,
  });
  return error ? 'email' : 'stored';
}
