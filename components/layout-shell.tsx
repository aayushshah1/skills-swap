'use client';

import Header from "@/components/ui/header";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}
