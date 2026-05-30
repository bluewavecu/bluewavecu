"use client";

import { ErrorState } from "@/components/ui/ErrorState";
import { ServerErrorState } from "@/components/ui/ServerErrorState";
import { isServerSideError } from "@/lib/authSession";

type ApiErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  actionLabel?: string;
};

export function ApiErrorState({
  title = "Unable to load data",
  message,
  onRetry,
  actionLabel = "Try Again",
}: ApiErrorStateProps) {
  if (isServerSideError(message)) {
    return <ServerErrorState title={title} message={message} onRetry={onRetry} />;
  }

  return (
    <ErrorState
      title={title}
      message={message}
      actionLabel={actionLabel}
      onRetry={onRetry}
    />
  );
}
