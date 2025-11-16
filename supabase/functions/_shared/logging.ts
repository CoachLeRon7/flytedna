// Centralized logging utility for edge functions
// Provides secure logging with PII masking, request ID tracking, and performance metrics

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

// Performance tracking utilities
export interface PerformanceTimer {
  start: number;
  checkpoints: Map<string, number>;
  requestId?: string;
  supabaseClient?: any; // Optional Supabase client for DB storage
}

// Start a performance timer
export const startPerformanceTimer = (requestId?: string, supabaseClient?: any): PerformanceTimer => {
  return {
    start: performance.now(),
    checkpoints: new Map(),
    requestId,
    supabaseClient
  };
};

// Add a checkpoint to track operation duration
export const checkpoint = (timer: PerformanceTimer, label: string): void => {
  timer.checkpoints.set(label, performance.now());
};

// Log performance metrics with all checkpoints and optionally store in DB
export const logPerformance = async (
  timer: PerformanceTimer,
  operation: string,
  metadata?: Record<string, any>
): Promise<void> => {
  const endTime = performance.now();
  const totalDuration = Math.round(endTime - timer.start);
  
  // Calculate checkpoint durations
  const checkpoints: Record<string, number> = {};
  let lastTime = timer.start;
  
  timer.checkpoints.forEach((time, label) => {
    checkpoints[label] = Math.round(time - lastTime);
    lastTime = time;
  });
  
  // Add final checkpoint if there are any checkpoints
  if (timer.checkpoints.size > 0) {
    checkpoints['completion'] = Math.round(endTime - lastTime);
  }
  
  console.log('[edge-function:performance]', {
    requestId: timer.requestId,
    operation,
    totalDurationMs: totalDuration,
    checkpoints: Object.keys(checkpoints).length > 0 ? checkpoints : undefined,
    ...metadata
  });
  
  // Warn on slow operations (>5 seconds)
  if (totalDuration > 5000) {
    console.warn('[edge-function:performance:slow]', {
      requestId: timer.requestId,
      operation,
      totalDurationMs: totalDuration,
      threshold: 5000
    });
  }

  // Store in database if Supabase client is provided
  if (timer.supabaseClient) {
    try {
      await timer.supabaseClient
        .from('performance_metrics')
        .insert({
          request_id: timer.requestId || 'unknown',
          operation,
          total_duration_ms: totalDuration,
          checkpoints: Object.keys(checkpoints).length > 0 ? checkpoints : null,
          metadata: metadata || null
        });
    } catch (dbError) {
      // Don't throw on DB errors - just log
      console.error('[edge-function:performance] Failed to store metrics:', dbError);
    }
  }
};

// Quick performance wrapper for async operations
export const measureAsync = async <T>(
  operation: string,
  fn: () => Promise<T>,
  requestId?: string,
  supabaseClient?: any
): Promise<T> => {
  const timer = startPerformanceTimer(requestId, supabaseClient);
  try {
    const result = await fn();
    await logPerformance(timer, operation);
    return result;
  } catch (error) {
    await logPerformance(timer, `${operation}:failed`);
    throw error;
  }
};
