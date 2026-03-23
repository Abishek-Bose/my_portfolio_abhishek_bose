"use client";

import { CursorProvider } from "@/lib/CursorContext";

export default function ClientProviders({ children }) {
  return <CursorProvider>{children}</CursorProvider>;
}
