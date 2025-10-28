import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

// localStorage의 influencer_mode를 DB로 마이그레이션
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { influencerMode } = await request.json()

    // influencerMode를 user_type으로 변환
    const userType = influencerMode === true || influencerMode === 'true' 
      ? 'INFLUENCER' 
      : 'ADVERTISER'

    console.log('🔄 마이그레이션:', { userId: session.user.id, influencerMode, userType })

    // DB의 user_type 업데이트
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ user_type: userType })
      .eq('id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error('마이그레이션 오류:', error)
      return NextResponse.json(
        { error: '마이그레이션에 실패했습니다.' },
        { status: 500 }
      )
    }

    console.log('✅ 마이그레이션 완료:', data)

    return NextResponse.json({
      success: true,
      message: '회원 유형이 동기화되었습니다.',
      userType,
    })

  } catch (error) {
    console.error('마이그레이션 오류:', error)
    return NextResponse.json(
      { error: '오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}