import type { ReactNode } from "react";
import type { FetchStatus } from "../types/types";

interface DataFetcherProps<T> {
  items: readonly T[];
  status: FetchStatus;
  error: string | null;
  renderItem: (item: T) => ReactNode;
  getKey: (item: T) => string | number;
  emptyMessage?: string;
  idleMessage?: string;
  onRetry?: () => void;
}

export function DataFetcher<T>({
  items,
  status,
  error,
  renderItem,
  getKey,
  emptyMessage = "No results found.",
  idleMessage = "Search for something delicious to get started.",
  onRetry,
}: DataFetcherProps<T>) {
  if (status === "loading") {
    return (
      <div className="feedback feedback-loading" role="status" aria-live="polite">
        <span className="spinner" aria-hidden="true" />
        <span>Finding something delicious…</span>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="feedback feedback-error" role="alert">
        <p>{error ?? "Something went wrong while fetching data."}</p>
        {onRetry && (
          <button className="retry-button" type="button" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    );
  }

  if (status === "idle") {
    return <p className="feedback feedback-idle">{idleMessage}</p>;
  }

  if (items.length === 0) {
    return <p className="feedback feedback-idle">{emptyMessage}</p>;
  }

  return (
    <div className="recipe-grid" aria-live="polite">
      {items.map((item) => (
        <div key={getKey(item)}>{renderItem(item)}</div>
      ))}
    </div>
  );
}
