// src/lib/auth.config.js
// authOptions tách khỏi route handler để import được từ Server Components,
// middleware, và bất kỳ đâu mà không kéo theo Edge runtime constraints.

import CredentialsProvider from "next-auth/providers/credentials"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 giờ
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Vui lòng nhập email và mật khẩu")
        }

        const sql = neon(process.env.DATABASE_URL)

        const rows = await sql`
          SELECT id, email, name, password_hash, avatar, is_active
          FROM users
          WHERE email = ${credentials.email}
          LIMIT 1
        `
        const user = rows[0]

        if (!user)        throw new Error("Email hoặc mật khẩu không đúng")
        if (!user.is_active) throw new Error("Tài khoản đã bị vô hiệu hóa")

        const isValid = await bcrypt.compare(credentials.password, user.password_hash)
        if (!isValid) throw new Error("Email hoặc mật khẩu không đúng")

        // Fire-and-forget — không block login
        neon(process.env.DATABASE_URL)`
          UPDATE users SET last_login_at = now() WHERE id = ${user.id}
        `.catch(() => {})

        return {
          id:     user.id,
          email:  user.email,
          name:   user.name,
          avatar: user.avatar,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id     = user.id
        token.avatar = user.avatar
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id     = token.id
        session.user.avatar = token.avatar
      }
      return session
    },
  },

  pages: {
    signIn: "/admin/login",
    error:  "/admin/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
}