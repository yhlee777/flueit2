import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

// ✅ 관리자가 인플루언서의 인스타그램 인증을 승인/거절하는 API
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // 관리자 권한 확인 (실제로는 admin role 체크 필요)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { userId, status } = await request.json()

    if (!userId || !status) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    if (!['verified', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: '유효하지 않은 상태값입니다.' },
        { status: 400 }
      )
    }

    console.log('🔍 인스타그램 인증 상태 변경:', { userId, status })

    // ✅ DB 업데이트
    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update({
        instagram_verification_status: status,
        instagram_verified_at: status === 'verified' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('❌ 인증 상태 업데이트 오류:', error)
      return NextResponse.json(
        { error: '인증 상태 업데이트에 실패했습니다.', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ 인증 상태 업데이트 성공:', updatedUser.id)

    return NextResponse.json({
      success: true,
      message: status === 'verified' ? '인증이 승인되었습니다.' : '인증이 거절되었습니다.',
      user: updatedUser,
    })

  } catch (error) {
    console.error('❌ 인증 상태 업데이트 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// ✅ 인플루언서의 인증 상태를 조회하는 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId가 필요합니다.' },
        { status: 400 }
      )
    }

    console.log('🔍 인스타그램 인증 상태 조회:', userId)

    // ✅ DB에서 조회
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('instagram_verification_status, instagram_username, instagram_data, instagram_verified_at')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    console.log('✅ 인증 상태 조회 성공:', user.instagram_verification_status)

    return NextResponse.json({
      success: true,
      status: user.instagram_verification_status || 'idle',
      instagramData: user.instagram_data,
      instagramUsername: user.instagram_username,
      verifiedAt: user.instagram_verified_at,
    })

  } catch (error) {
    console.error('❌ 인증 상태 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}