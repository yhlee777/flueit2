// app/api/admin/users/[id]/instagram-verification/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    // 관리자 권한 확인
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

    const body = await request.json()
    const { status, rejection_reason } = body

    if (!['verified', 'idle'].includes(status)) {
      return NextResponse.json(
        { error: '유효하지 않은 상태입니다.' },
        { status: 400 }
      )
    }

    console.log('🔄 인스타그램 인증 상태 변경:', params.id, '->', status)

    // 인증 상태 업데이트
    const updateData: any = {
      instagram_verification_status: status,
    }

    // 거절 시 사유 저장 및 인증 초기화
    if (status === 'idle' && rejection_reason) {
      updateData.instagram_verification_rejection_reason = rejection_reason
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('❌ 인증 상태 업데이트 오류:', error)
      return NextResponse.json(
        { error: '인증 상태를 업데이트하는데 실패했습니다.' },
        { status: 500 }
      )
    }

    console.log('✅ 인증 상태 업데이트 성공:', data.instagram_verification_status)

    // TODO: 이메일 알림 발송 (선택)

    return NextResponse.json({
      success: true,
      user: data,
      message: status === 'verified' 
        ? '인스타그램 인증이 승인되었습니다.' 
        : '인스타그램 인증이 거절되었습니다.',
    })

  } catch (error) {
    console.error('❌ API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}