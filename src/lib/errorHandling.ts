/**
 * Maps technical error messages to user-friendly descriptions
 * Prevents information leakage while maintaining good UX
 */
export const getUserFriendlyError = (error: any): string => {
  // Log full error for debugging (only visible in dev console)
  console.error('Error details:', error);
  
  const message = error?.message?.toLowerCase() || '';
  const code = error?.code;
  
  // Map specific error patterns to user-friendly messages
  if (message.includes('row-level security') || message.includes('rls')) {
    return 'You do not have permission to perform this action.';
  }
  
  if (code === 'PGRST116' || message.includes('not found')) {
    return 'No data found.';
  }
  
  if (message.includes('duplicate') || code === '23505') {
    return 'This record already exists.';
  }
  
  if (message.includes('invalid') && message.includes('email')) {
    return 'Please enter a valid email address.';
  }
  
  if (message.includes('password')) {
    return 'Invalid password. Please check and try again.';
  }
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  if (message.includes('user already registered') || message.includes('already exists')) {
    return 'An account with this email already exists.';
  }
  
  if (message.includes('invalid login credentials')) {
    return 'Invalid email or password.';
  }
  
  // Generic fallback - never expose internal error details
  return 'An error occurred. Please try again or contact support if the problem persists.';
};
