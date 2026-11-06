export const GOOGLE_RICH_RESULTS_TEST_URL = 'https://search.google.com/test/rich-results';

export interface JsonLdValidationResult {
  valid: boolean;
  error?: string;
}

const hasJsonLdContext = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') return false;

  const record = value as Record<string, unknown>;

  if ('@context' in record) return true;

  if (Array.isArray(record['@graph'])) {
    return record['@graph'].some((item) => hasJsonLdContext(item));
  }

  return false;
};

const hasJsonLdType = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') return false;

  const record = value as Record<string, unknown>;

  if ('@type' in record) return true;

  if (Array.isArray(record['@graph'])) {
    return record['@graph'].some((item) => hasJsonLdType(item));
  }

  return false;
};

export const validateJsonLd = (code: string): JsonLdValidationResult => {
  const trimmed = code.trim();

  if (!trimmed) {
    return { valid: false, error: 'JSON-LD không được để trống' };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { valid: false, error: 'JSON không hợp lệ' };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { valid: false, error: 'JSON-LD phải là một đối tượng JSON' };
  }

  if (!hasJsonLdContext(parsed)) {
    return { valid: false, error: 'Thiếu thuộc tính @context trong JSON-LD' };
  }

  if (!hasJsonLdType(parsed)) {
    return { valid: false, error: 'Thiếu @type hoặc @graph trong JSON-LD' };
  }

  return { valid: true };
};

export const formatJsonLd = (code: string): string => {
  const trimmed = code.trim();
  if (!trimmed) return '';

  try {
    return JSON.stringify(JSON.parse(trimmed), null, 2);
  } catch {
    return trimmed;
  }
};

export const wrapJsonLdForGoogleTest = (jsonLd: string): string =>
  `<!DOCTYPE html>
<html>
  <head>
    <script type="application/ld+json">
${jsonLd.trim()}
    </script>
  </head>
  <body></body>
</html>`;

export const copyToClipboard = async (text: string): Promise<void> => {
  await navigator.clipboard.writeText(text);
};
