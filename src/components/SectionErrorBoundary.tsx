import React, { Component, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  title?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Lightweight error boundary for sections/components
 * Shows an inline error message instead of full-screen fallback
 */
export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SectionErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{this.props.title || 'Error Loading Section'}</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p className="text-sm">
              {this.state.error?.message || 'An unexpected error occurred in this section.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleReset}
              className="mt-2"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
