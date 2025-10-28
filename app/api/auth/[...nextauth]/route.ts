import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import KakaoProvider from "next-auth/providers/kakao"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabaseAdmin } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    KakaoProvider({
      clientId: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "아이디", type: "text" },
        password: { label: "비밀번호", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("아이디와 비밀번호를 입력해주세요.")
        }

        const { data: user, error } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('username', credentials.username)
          .single()

        if (error || !user || !user.password) {
          throw new Error("존재하지 않는 사용자입니다.")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("비밀번호가 일치하지 않습니다.")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          image: user.image,
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🔍 signIn callback 시작', { provider: account?.provider })
      
      if (account?.provider === 'google' || account?.provider === 'kakao') {
        try {
          const email = user.email!
          
          console.log('🔍 OAuth 로그인 시도:', { email, provider: account.provider })
          
          const { data: existingUser, error: selectError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email)
            .single()

          console.log('🔍 기존 사용자 조회:', { found: !!existingUser, selectError })

          if (existingUser) {
            // ✅ 기존 사용자 - ID 설정
            user.id = existingUser.id
            
            const { error: updateError } = await supabaseAdmin
              .from('users')
              .update({
                name: user.name,
                image: user.image,
                provider: account.provider,
                provider_id: account.providerAccountId,
                updated_at: new Date().toISOString(),
              })
              .eq('email', email)
            
            console.log('🔍 사용자 업데이트:', { updateError })
          } else {
            // ✅ 신규 사용자 생성
            const username = email.split('@')[0] + '_' + Math.random().toString(36).substr(2, 6)
            
            const { data: newUser, error: insertError } = await supabaseAdmin
              .from('users')
              .insert({
                email,
                username,
                name: user.name,
                image: user.image,
                provider: account.provider,
                provider_id: account.providerAccountId,
                user_type: null, // 나중에 선택
              })
              .select()
              .single()
            
            console.log('🔍 사용자 생성:', { newUser: !!newUser, insertError })
            
            if (insertError) {
              console.error('❌ 사용자 생성 실패:', insertError)
              return false
            }
            
            // ✅ 중요: 신규 사용자 ID 설정
            if (newUser) {
              user.id = newUser.id
            }
          }
          
          console.log('✅ OAuth 로그인 성공')
          return true
        } catch (error) {
          console.error('❌ OAuth 처리 중 오류:', error)
          return false
        }
      }
      
      return true
    },
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token
        token.provider = account.provider
      }
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.provider = token.provider as string
      session.user.id = token.id as string
      
      if (token.id) {
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id, email, username, name, image, user_type')
          .eq('id', token.id as string)
          .single()
        
        if (user) {
          session.user.id = user.id
          session.user.email = user.email
          session.user.name = user.name || user.username
          session.user.image = user.image
          // ✅ user_type 추가
          session.user.userType = user.user_type
        }
      }
      
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }