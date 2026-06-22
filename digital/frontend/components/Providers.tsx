"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { AppProvider } from "@/context/AppContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>{children}</AppProvider>
    </QueryClientProvider>
  );
}
