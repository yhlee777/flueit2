// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('🔍 세션 조회 시작 - token.id:', session?.user?.id)
    
    if (!session || !session.user?.id) {
      console.log('⚠️ 세션이 없습니다')
      return NextResponse.json({
        hasUser: false,
        userId: null,
        userType: null,
      })
    }

    // ✅ 올바른 쿼리: provider_id 사용 (kakao_id 제거)
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, username, user_type, name, image')
      .eq('id', session.user.id)
      .single()

    if (error) {
      console.error('❌ 세션 사용자 조회 오류:', error)
      return NextResponse.json(
        { error: '사용자 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    console.log('🔍 DB에서 조회한 사용자 데이터:', {
      id: user?.id,
      email: user?.email,
      username: user?.username,
      user_type: user?.user_type,
      hasUserType: !!user?.user_type
    })

    if (!user) {
      console.log('⚠️ DB에서 사용자를 찾을 수 없습니다!')
      return NextResponse.json({
        hasUser: true,
        userId: session.user.id,
        userType: null,
        needsUserTypeSelection: true,
      })
    }

    const response = {
      hasUser: true,
      userId: user.id,
      userType: user.user_type,
      email: user.email,
      username: user.username,
      name: user.name,
      image: user.image,
      needsUserTypeSelection: !user.user_type,
    }

    console.log('✅ 최종 세션 반환:', response)
    
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ 세션 조회 오류:', error)
    return NextResponse.json(
      { error: '세션 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}