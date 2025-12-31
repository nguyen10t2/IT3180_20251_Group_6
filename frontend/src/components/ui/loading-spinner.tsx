"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "orange" | "white";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

const colorClasses = {
  primary: "border-primary",
  orange: "border-orange-500",
  white: "border-white",
};

export function LoadingSpinner({ 
  className, 
  size = "md", 
  color = "primary" 
}: LoadingSpinnerProps) {
  return (
    <div className={cn("min-h-screen flex items-center justify-center", className)}>
      <div 
        className={cn(
          "animate-spin rounded-full border-b-2",
          sizeClasses[size],
          colorClasses[color]
        )} 
      />
    </div>
  );
}
