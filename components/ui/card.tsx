"use client";

import { Card as HeroCard, CardHeader, CardContent, CardFooter } from "@heroui/react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <HeroCard className={`glass-panel border-slate-800 text-slate-100 shadow-xl overflow-hidden relative ${className}`}>
      {children}
    </HeroCard>
  );
}

export { CardHeader, CardContent, CardFooter };
