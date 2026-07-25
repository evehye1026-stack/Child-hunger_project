"use client";

import type { ReactNode } from "react";
import { useScrollRestoration } from "@/lib/useScrollRestoration";

type Props = {
  className?: string;
  children: ReactNode;
};

export default function ScrollRestoreMain({ className, children }: Props) {
  const ref = useScrollRestoration<HTMLElement>();

  return (
    <main ref={ref} className={className}>
      {children}
    </main>
  );
}
