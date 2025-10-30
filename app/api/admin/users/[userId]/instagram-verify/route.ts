import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

// PATCH /api/admin/users/[userId]/instagram-verify - 인스타그램 인증 상태 변경
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    // ✅ 관리자 권한 확인
    const { data: adminUser } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (!adminUser?.is_admin) {
      return NextResponse.json(
        { error: '관리자 권한이 없습니다.' },
        { status: 403 }
      )
    }

    const { userId } = params
    const { status } = await request.json()

    if (!['verified', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: '유효하지 않은 상태입니다.' },
        { status: 400 }
      )
    }

    console.log(`🔄 인스타그램 인증 상태 변경: ${userId} -> ${status}`)

    // ✅ 인스타그램 인증 상태 업데이트
    const { data, error } = await supabaseAdmin
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
      console.error('❌ 인스타그램 인증 상태 업데이트 오류:', error)
      return NextResponse.json(
        { error: '상태 업데이트 중 오류가 발생했습니다.', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ 인스타그램 인증 상태 업데이트 성공:', data)

    return NextResponse.json({
      success: true,
      user: data,
    })

  } catch (error) {
    console.error('❌ 인스타그램 인증 오류:', error)
    return NextResponse.json(
      { error: '인증 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}