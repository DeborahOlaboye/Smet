import React from "react";

export function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse bg-muted-foreground/10 rounded-md ${className}`}
      style={style}
      aria-hidden
    />
  );
}
