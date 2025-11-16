import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  onReset: () => void;
}

export const ErrorFallback = ({ error, errorInfo, onReset }: ErrorFallbackProps) => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleReload = () => {
    window.location.reload();
  };

  const isDevelopment = import.meta.env.DEV;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-2xl">Something went wrong</CardTitle>
              <CardDescription>
                We encountered an unexpected error. Please try refreshing the page or returning to the home screen.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="font-mono text-sm">
                {error.message || 'An unknown error occurred'}
              </AlertDescription>
            </Alert>
          )}

          {isDevelopment && errorInfo && (
            <details className="mt-4 p-4 bg-muted rounded-lg">
              <summary className="cursor-pointer font-semibold text-sm mb-2">
                Error Details (Development Only)
              </summary>
              <pre className="text-xs overflow-auto max-h-64 mt-2 p-2 bg-background rounded">
                {errorInfo.componentStack}
              </pre>
            </details>
          )}
        </CardContent>

        <CardFooter className="flex gap-3 justify-end">
          <Button variant="outline" onClick={handleGoHome}>
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
          <Button onClick={handleReload}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload Page
          </Button>
          <Button variant="secondary" onClick={onReset}>
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
