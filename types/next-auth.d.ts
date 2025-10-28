import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    provider?: string
    user: {
      id: string
      userType?: "INFLUENCER" | "ADVERTISER" | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    userType?: "INFLUENCER" | "ADVERTISER" | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    provider?: string
    id?: string
    userType?: "INFLUENCER" | "ADVERTISER" | null
  }
}