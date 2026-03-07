"use client"

// src/components/session-provider.js
// Wrapper cho NextAuth SessionProvider
// Cần thiết vì SessionProvider là client component, layout.js là server component

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

export function SessionProvider({ children, session }) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  )
}