/**
 * Error Boundary Components
 * 
 * This module exports error boundary components for graceful error handling.
 * 
 * Usage:
 * 
 * 1. Full-page error boundary (App.tsx level):
 *    import { ErrorBoundary } from '@/components/ErrorBoundary';
 *    <ErrorBoundary><App /></ErrorBoundary>
 * 
 * 2. Section-level error boundary (for dashboard tabs, cards, etc):
 *    import { SectionErrorBoundary } from '@/components/SectionErrorBoundary';
 *    <SectionErrorBoundary title="Custom Error Title">
 *      <YourComponent />
 *    </SectionErrorBoundary>
 * 
 * Error boundaries catch JavaScript errors anywhere in their child component tree,
 * log those errors, and display a fallback UI instead of crashing the whole app.
 */

export { ErrorBoundary } from './ErrorBoundary';
export { SectionErrorBoundary } from './SectionErrorBoundary';
export { ErrorFallback } from './ErrorFallback';
