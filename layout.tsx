// app/(site)/layout.tsx
'use client';

import LayoutShell from "@/components/layout-shell";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <LayoutShell>{children}</LayoutShell>;
}
