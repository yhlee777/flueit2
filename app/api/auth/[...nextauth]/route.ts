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
      console.log('🔍 signIn callback 시작', { 
        provider: account?.provider,
        hasEmail: !!user.email,
        originalUserId: user.id,
      })
      
      if (account?.provider === 'google' || account?.provider === 'kakao') {
        try {
          const kakaoProfile = profile as any
          
          // ✅ 카카오의 경우 ID를 기반으로 처리
          if (account.provider === 'kakao') {
            const kakaoId = kakaoProfile.id.toString()
            
            // 카카오에서 제공하는 정보 추출
            const nickname = kakaoProfile.properties?.nickname || 
                           kakaoProfile.kakao_account?.profile?.nickname
            const profileImage = kakaoProfile.properties?.profile_image || 
                               kakaoProfile.kakao_account?.profile?.profile_image_url ||
                               kakaoProfile.properties?.thumbnail_image
            
            // ✅ 이메일이 있으면 사용, 없으면 임시 이메일 생성
            const email = user.email || 
                         kakaoProfile.kakao_account?.email || 
                         `kakao_${kakaoId}@temp.local`
            
            const username = nickname || `kakao_user_${kakaoId}`
            
            console.log('🔍 카카오 로그인 정보:', { 
              kakaoId, 
              username, 
              email,
              hasRealEmail: !!user.email,
              profileImage: !!profileImage 
            })
            
            // ✅ 기존 사용자 확인 (provider_id로만 확인)
            const { data: existingUser, error: selectError } = await supabaseAdmin
              .from('users')
              .select('id, email, username, provider_id')
              .eq('provider', 'kakao')
              .eq('provider_id', kakaoId)
              .maybeSingle()

            console.log('🔍 기존 사용자 조회:', { 
              found: !!existingUser,
              userId: existingUser?.id,
              errorCode: selectError?.code 
            })

            if (!existingUser) {
              console.log('🆕 신규 카카오 사용자 생성 (자동 승인)')
              
              const { data: newUser, error: insertError } = await supabaseAdmin
                .from('users')
                .insert({
                  email: email,
                  username: username,
                  name: nickname || username,
                  image: profileImage,
                  provider: 'kakao',
                  provider_id: kakaoId,
                  user_type: null,
                  approval_status: 'approved', // ✅ OAuth는 자동 승인
                  approved_at: new Date().toISOString(), // ✅ 승인 시간 기록
                  is_admin: false,
                  created_at: new Date().toISOString(),
                })
                .select('id, email, username')
                .single()
              
              console.log('🔍 신규 사용자 생성 결과:', { 
                success: !!newUser, 
                userId: newUser?.id,
                errorCode: insertError?.code 
              })
              
              if (insertError) {
                console.error('❌ 사용자 생성 실패:', insertError)
                return false
              }
              
              if (newUser) {
                // ✅ user 객체를 완전히 교체
                user.id = newUser.id
                user.email = newUser.email
                user.name = newUser.username
                console.log('✅ 신규 사용자 ID 설정 (자동 승인):', newUser.id)
              }
            } else {
              // ✅ 기존 사용자 - user 객체를 완전히 교체
              user.id = existingUser.id
              user.email = existingUser.email || email
              user.name = existingUser.username || nickname
              console.log('✅ 기존 사용자 ID 설정:', existingUser.id)
            }
            
            console.log('✅ 카카오 로그인 성공, 최종 user.id:', user.id)
            return true
          }
          
          // ✅ 구글 로그인 처리
          if (account.provider === 'google') {
            const email = user.email
            
            if (!email) {
              console.error('❌ 구글 이메일 정보 없음')
              return false
            }
            
            console.log('🔍 구글 로그인 시도:', { email })
            
            const { data: existingUser } = await supabaseAdmin
              .from('users')
              .select('id, email, username')
              .eq('provider', 'google')
              .eq('provider_id', account.providerAccountId)
              .maybeSingle()

            if (!existingUser) {
              console.log('🆕 신규 구글 사용자 생성 (자동 승인)')
              
              const { data: newUser, error: insertError } = await supabaseAdmin
                .from('users')
                .insert({
                  email: email,
                  username: user.name || email.split('@')[0],
                  name: user.name,
                  image: user.image,
                  provider: 'google',
                  provider_id: account.providerAccountId,
                  user_type: null,
                  approval_status: 'approved', // ✅ OAuth는 자동 승인
                  approved_at: new Date().toISOString(), // ✅ 승인 시간 기록
                  is_admin: false,
                  created_at: new Date().toISOString(),
                })
                .select('id, email, username')
                .single()
              
              if (insertError && insertError.code !== '23505') {
                console.error('❌ 구글 사용자 생성 실패:', insertError)
                return false
              }
              
              if (newUser) {
                user.id = newUser.id
                user.email = newUser.email
                user.name = newUser.username
                console.log('✅ 신규 구글 사용자 ID 설정 (자동 승인):', newUser.id)
              }
            } else {
              user.id = existingUser.id
              user.email = existingUser.email
              user.name = existingUser.username
              console.log('✅ 기존 구글 사용자 ID 설정:', existingUser.id)
            }
            
            console.log('✅ 구글 로그인 성공')
            return true
          }
          
        } catch (error) {
          console.error('❌ OAuth 처리 중 예외 발생:', error)
          if (error instanceof Error) {
            console.error('에러 메시지:', error.message)
          }
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
      if (user?.id) {
        token.id = user.id
        console.log('✅ JWT에 user.id 저장:', user.id)
      }
      
      console.log('🔍 JWT callback 완료:', {
        tokenId: token.id,
        provider: token.provider,
      })
      
      return token
    },
    
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.provider = token.provider as string
      
      console.log('🔍 Session callback 시작:', {
        tokenId: token.id,
        tokenType: typeof token.id,
      })
      
      if (token.id) {
        console.log('🔍 세션 생성 시작 - token.id:', token.id)
        
        const { data: user, error } = await supabaseAdmin
          .from('users')
          .select('id, email, username, name, image, user_type, provider_id, approval_status, is_admin')
          .eq('id', token.id as string)
          .single()
        
        if (error) {
          console.error('❌ 세션 사용자 조회 오류:', error)
        }
        
        console.log('🔍 DB에서 조회한 사용자 데이터:', {
          id: user?.id,
          email: user?.email,
          username: user?.username,
          user_type: user?.user_type,
          approval_status: user?.approval_status,
          is_admin: user?.is_admin,
          hasUserType: user?.user_type !== null && user?.user_type !== undefined,
        })
        
        if (user) {
          session.user.id = user.id
          session.user.email = user.email
          session.user.name = user.name || user.username
          session.user.image = user.image
          session.user.userType = user.user_type
          // @ts-ignore
          session.user.approval_status = user.approval_status
          // @ts-ignore
          session.user.is_admin = user.is_admin
          
          console.log('✅ 세션에 userType 설정 완료:', {
            userType: user.user_type,
            sessionUserType: session.user.userType,
            approval_status: user.approval_status,
            is_admin: user.is_admin,
          })
          
          // ✅ 임시 이메일인지 확인
          if (user.email?.includes('@temp.local')) {
            // @ts-ignore
            session.user.needsEmail = true
          }
        } else {
          console.warn('⚠️ DB에서 사용자를 찾을 수 없습니다!')
        }
      } else {
        console.warn('⚠️ token.id가 없습니다!')
      }
      
      console.log('✅ 최종 세션 반환:', {
        hasUser: !!session.user,
        userId: session.user?.id,
        userType: session.user?.userType,
        approval_status: (session.user as any)?.approval_status,
        is_admin: (session.user as any)?.is_admin,
      })
      
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
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }