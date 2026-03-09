// src/app/api/auth/[...nextauth]/route.js
// Chỉ re-export handler — authOptions sống ở src/lib/auth.config.js
// để import được từ Server Components / middleware mà không kéo theo Edge constraints.

import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth.config"

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }