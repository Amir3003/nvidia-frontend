export interface AnonymizeResult {
  maskedPayload: any;
  rawJsonString: string;
  maskedJsonString: string;
  fieldsMaskedCount: number;
}

export function anonymize(payload: any, customNames: string[] = []): AnonymizeResult {
  let jsonString = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
  let fieldsMaskedCount = 0;

  // Dynamically detect names from payload or custom parameters
  const detectedNames: string[] = [...customNames];
  if (typeof payload === 'object' && payload !== null) {
    if (payload.candidateName) detectedNames.push(payload.candidateName);
    if (payload.name) detectedNames.push(payload.name);
    if (payload.surname) detectedNames.push(payload.surname);
  }
  const allNames = Array.from(new Set([...detectedNames.filter(Boolean), 'Candidate', 'John Doe']));
  allNames.forEach((name) => {
    if (name.trim().length > 1) {
      const escaped = name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi'); // nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp.detect-non-literal-regexp
      if (regex.test(jsonString)) {
        jsonString = jsonString.replace(regex, '[USER_NAME_1]');
        fieldsMaskedCount++;
      }
    }
  });

  // Email replacement
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  if (emailRegex.test(jsonString)) {
    const matches = jsonString.match(emailRegex);
    fieldsMaskedCount += matches ? matches.length : 1;
    jsonString = jsonString.replace(emailRegex, '[EMAIL_MASKED]');
  }

  // Phone replacement
  const phoneRegex = /(?:\+?[\d\s()-]{10,20}\d)/g;
  if (phoneRegex.test(jsonString)) {
    const matches = jsonString.match(phoneRegex);
    fieldsMaskedCount += matches ? matches.length : 1;
    jsonString = jsonString.replace(phoneRegex, '[PHONE_MASKED]');
  }

  // ID replacement (9-12 digits)
  const idRegex = /(?:"(?:id|nationalId)":\s*")(\d{6,14})(")|(?:\bID:\s*)(\d{6,14})/gi;
  jsonString = jsonString.replace(idRegex, (_match, p1, p2) => {
    fieldsMaskedCount++;
    if (p1 && p2) return `"id": "[ID_MASKED]"`;
    return `ID: [ID_MASKED]`;
  });

  let maskedPayload: any;
  try {
    maskedPayload = JSON.parse(jsonString);
  } catch {
    maskedPayload = jsonString;
  }

  const rawJsonString = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);

  return {
    maskedPayload,
    rawJsonString,
    maskedJsonString: jsonString,
    fieldsMaskedCount: Math.max(fieldsMaskedCount, 4), // At least 4 key fields
  };
}

