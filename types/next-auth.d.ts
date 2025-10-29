import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      userType?: "INFLUENCER" | "ADVERTISER" | null
      approval_status?: string  // ✅ 추가
      is_admin?: boolean  // ✅ 추가
    }
    accessToken?: string
    provider?: string
  }

  interface User {
    id: string
    email?: string | null
    name?: string | null
    image?: string | null
    userType?: "INFLUENCER" | "ADVERTISER" | null
    approval_status?: string  // ✅ 추가
    is_admin?: boolean  // ✅ 추가
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    accessToken?: string
    provider?: string
    userType?: "INFLUENCER" | "ADVERTISER" | null
    approval_status?: string  // ✅ 추가
    is_admin?: boolean  // ✅ 추가
  }
}