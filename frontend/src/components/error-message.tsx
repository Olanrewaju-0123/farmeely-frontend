import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: "default" | "destructive" | "warning";
  className?: string;
  showRetry?: boolean;
  showDismiss?: boolean;
}

export function ErrorMessage({
  title = "Error",
  message,
  onRetry,
  onDismiss,
  variant = "destructive",
  className,
  showRetry = true,
  showDismiss = true,
}: ErrorMessageProps) {
  return (
    <Alert variant={variant} className={cn("relative", className)}>
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">{message}</AlertDescription>

      {(showRetry || showDismiss) && (
        <div className="mt-3 flex gap-2">
          {showRetry && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="h-8"
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Try Again
            </Button>
          )}
          {showDismiss && onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-8 px-2"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </Alert>
  );
}

interface NetworkErrorProps {
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function NetworkError({
  onRetry,
  onDismiss,
  className,
}: NetworkErrorProps) {
  return (
    <ErrorMessage
      title="Connection Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      onRetry={onRetry}
      onDismiss={onDismiss}
      variant="destructive"
      className={className}
    />
  );
}

interface ValidationErrorProps {
  errors: string[];
  onDismiss?: () => void;
  className?: string;
}

export function ValidationError({
  errors,
  onDismiss,
  className,
}: ValidationErrorProps) {
  return (
    <ErrorMessage
      title="Validation Error"
      message={
        <ul className="list-disc list-inside space-y-1">
          {errors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      }
      onDismiss={onDismiss}
      variant="warning"
      className={className}
      showRetry={false}
    />
  );
}
