export const securityHeaders = {
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'strict-origin-when-cross-origin',
  'Content-Security-Policy':"default-src 'self'; script-src 'self' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.google-analytics.com https://www.googletagmanager.com; connect-src 'self' https://api.openai.com https://api.anthropic.com https://*.google-analytics.com https://www.googletagmanager.com; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
};
