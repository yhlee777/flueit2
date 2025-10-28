import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { userType } = await request.json()

    if (!userType || !['INFLUENCER', 'ADVERTISER'].includes(userType)) {
      return NextResponse.json(
        { error: '올바른 회원 유형을 선택해주세요.' },
        { status: 400 }
      )
    }

    // user_type 업데이트
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ user_type: userType })
      .eq('id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error('user_type 업데이트 오류:', error)
      return NextResponse.json(
        { error: '회원 유형 저장에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '회원 유형이 저장되었습니다.',
      userType,
    })

  } catch (error) {
    console.error('user_type 업데이트 오류:', error)
    return NextResponse.json(
      { error: '오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}