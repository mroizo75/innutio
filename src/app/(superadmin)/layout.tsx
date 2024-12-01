"use client"

import { SuperAdminNav } from "@/components/superadmin/SuperAdminNav"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      refetchOnWindowFocus: false,
    },
  },
})

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen">
        <SuperAdminNav />
        <div className="flex-1">
          {children}
        </div>
      </div>
    </QueryClientProvider>
  )
}