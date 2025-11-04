"use client";

import { type ReactNode, useEffect, useRef } from "react";

interface InfiniteScrollListProps {
  children?: ReactNode;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  className?: string;
}

export function InfiniteScrollList({
  children,
  onLoadMore,
  hasMore,
  isLoading,
  className = "",
}: InfiniteScrollListProps) {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <>
      {children}
      {hasMore && (
        <div ref={observerTarget} className={`h-4 w-full ${className}`}>
          {isLoading && (
            <div className="flex items-center justify-center py-2">
              <div className="text-xs text-muted-foreground">
                Cargando más...
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
