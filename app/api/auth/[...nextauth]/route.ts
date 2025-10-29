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
            
            // ✅ 기존 사용자 확인 (provider_id 또는 email로) - kakao_id 대신 provider_id 사용
            const { data: existingUser, error: selectError } = await supabaseAdmin
              .from('users')
              .select('*')
              .or(`email.eq.${email},provider_id.eq.${kakaoId}`)
              .maybeSingle()  // single 대신 maybeSingle 사용

            console.log('🔍 기존 사용자 조회:', { 
              found: !!existingUser,
              errorCode: selectError?.code 
            })

            if (!existingUser) {
              console.log('🆕 신규 카카오 사용자 생성')
              
              const { data: newUser, error: insertError } = await supabaseAdmin
                .from('users')
                .insert({
                  email: email,
                  username: username,
                  name: nickname || username,
                  image: profileImage,
                  provider: 'kakao',
                  provider_id: kakaoId,  // ✅ kakao_id 대신 provider_id 사용
                  user_type: null,
                  created_at: new Date().toISOString(),
                })
                .select()
                .single()
              
              console.log('🔍 신규 사용자 생성 결과:', { 
                success: !!newUser, 
                userId: newUser?.id,
                errorCode: insertError?.code 
              })
              
              if (insertError) {
                console.error('❌ 사용자 생성 실패:', insertError)
                
                // 중복 사용자 에러 처리
                if (insertError.code === '23505') {
                  console.log('⚠️ 이미 존재하는 사용자, 로그인 허용')
                  return true
                }
                
                return false
              }
              
              if (newUser) {
                user.id = newUser.id
                console.log('✅ 신규 사용자 ID 설정:', newUser.id)
              }
            } else {
              // 기존 사용자 - ID 설정
              user.id = existingUser.id
              console.log('✅ 기존 사용자 ID 설정:', existingUser.id)
              
              // ✅ 기존 사용자의 provider_id가 없으면 업데이트
              if (!existingUser.provider_id && kakaoId) {
                await supabaseAdmin
                  .from('users')
                  .update({ provider_id: kakaoId })  // ✅ kakao_id 대신 provider_id 사용
                  .eq('id', existingUser.id)
                console.log('✅ 기존 사용자에 provider_id 추가')
              }
            }
            
            console.log('✅ 카카오 로그인 성공, userId:', user.id)
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
              .select('*')
              .eq('email', email)
              .maybeSingle()

            if (!existingUser) {
              console.log('🆕 신규 구글 사용자 생성')
              
              const { data: newUser, error: insertError } = await supabaseAdmin
                .from('users')
                .insert({
                  email: email,
                  username: user.name || email.split('@')[0],
                  name: user.name,
                  image: user.image,
                  provider: 'google',
                  provider_id: account.providerAccountId,  // ✅ 구글 provider_id도 저장
                  user_type: null,
                  created_at: new Date().toISOString(),
                })
                .select()
                .single()
              
              if (insertError && insertError.code !== '23505') {
                console.error('❌ 구글 사용자 생성 실패:', insertError)
                return false
              }
              
              if (newUser) {
                user.id = newUser.id
              }
            } else {
              user.id = existingUser.id
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
      if (user) {
        token.id = user.id
      }
      return token
    },
    
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.provider = token.provider as string
      
      if (token.id) {
        console.log('🔍 세션 생성 시작 - token.id:', token.id)
        
        // ✅ kakao_id 제거 - session에서는 필요 없음
        const { data: user, error } = await supabaseAdmin
          .from('users')
          .select('id, email, username, name, image, user_type, provider_id')
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
          hasUserType: user?.user_type !== null && user?.user_type !== undefined,
        })
        
        if (user) {
          session.user.id = user.id
          session.user.email = user.email
          session.user.name = user.name || user.username
          session.user.image = user.image
          session.user.userType = user.user_type
          
          console.log('✅ 세션에 userType 설정 완료:', {
            userType: user.user_type,
            sessionUserType: session.user.userType,
          })
          
          console.log('✅ 최종 session.user 객체:', JSON.stringify(session.user, null, 2))
          
          // ✅ 임시 이메일인지 확인
          if (user.email?.includes('@temp.local')) {
            // @ts-ignore
            session.user.needsEmail = true
          }
        } else {
          console.warn('⚠️ DB에서 사용자를 찾을 수 없습니다!')
        }
      } else {
        console.warn('⚠️ token.id가 없습니다! JWT 토큰 문제일 수 있습니다.')
      }
      
      console.log('✅ 최종 세션 반환:', {
        hasUser: !!session.user,
        userId: session.user?.id,
        userType: session.user?.userType,
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