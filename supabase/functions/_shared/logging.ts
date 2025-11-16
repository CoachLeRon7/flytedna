// Centralized logging utility for edge functions
// Provides secure logging with PII masking and request ID tracking

// Request ID utility
export const generateRequestId = () => crypto.randomUUID();

// Secure masking helpers - mask sensitive data
export const maskEmail = (email: string) => {
  if (!email) return '[NO_EMAIL]';
  const [user, domain] = email.split('@');
  return `${user.substring(0, 2)}***@${domain}`;
};

export const maskUserId = (id: string) => id ? `${id.substring(0, 8)}***` : '[NO_ID]';

export const maskName = () => '[NAME_REDACTED]';

export const maskAmount = (amount: number | string) => {
  if (!amount) return '[NO_AMOUNT]';
  return '[AMOUNT_REDACTED]';
};

export const maskPaymentId = (id: string) => id ? `${id.substring(0, 12)}***` : '[NO_ID]';

// Structured error logging - only logs error codes in production
export const logError = (context: string, error: any, requestId?: string) => {
  console.error(`[edge-function] ${context}`, {
    requestId,
    code: error?.code,
    message: error?.message?.substring(0, 100), // Truncate messages
    type: error?.constructor?.name
  });
};

// Structured info logging - sanitizes sensitive data
export const logInfo = (context: string, data?: Record<string, any>, requestId?: string) => {
  const sanitized = data ? Object.entries(data).reduce((acc, [key, val]) => {
    if (key.includes('email')) acc[key] = maskEmail(val);
    else if (key.includes('id') || key.includes('Id')) acc[key] = maskUserId(val);
    else if (key.includes('name') || key.includes('Name')) acc[key] = maskName();
    else if (key.includes('amount') || key.includes('Amount') || key.includes('price')) acc[key] = maskAmount(val);
    else if (key.includes('token')) acc[key] = '[REDACTED]';
    else acc[key] = val;
    return acc;
  }, {} as Record<string, any>) : {};
  
  console.log(`[edge-function] ${context}`, { requestId, ...sanitized });
};
