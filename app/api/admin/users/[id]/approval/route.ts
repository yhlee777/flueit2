import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

// PATCH /api/admin/users/[id]/approval - 사용자 승인/거절
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

    const { id: userId } = params
    const body = await request.json()
    const { status, rejection_reason } = body

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: '올바른 상태값을 입력해주세요. (approved/rejected)' },
        { status: 400 }
      )
    }

    console.log('🔍 사용자 승인/거절:', { userId, status })

    // ✅ 사용자 승인 상태 업데이트
    const updateData: any = {
      approval_status: status,
      approved_at: status === 'approved' ? new Date().toISOString() : null,
      approved_by: status === 'approved' ? session.user.id : null,
      updated_at: new Date().toISOString(),
    }

    if (status === 'rejected' && rejection_reason) {
      updateData.rejection_reason = rejection_reason
    }

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('❌ 승인 상태 업데이트 오류:', error)
      return NextResponse.json(
        { error: '승인 처리 중 오류가 발생했습니다.', details: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ 사용자 ${status === 'approved' ? '승인' : '거절'} 완료:`, userId)

    // TODO: 이메일 알림 전송 (선택사항)
    // if (updatedUser.email) {
    //   await sendApprovalEmail(updatedUser.email, status)
    // }

    return NextResponse.json({
      success: true,
      message: status === 'approved' ? '사용자가 승인되었습니다.' : '사용자가 거절되었습니다.',
      user: updatedUser,
    })

  } catch (error) {
    console.error('❌ 승인 처리 오류:', error)
    return NextResponse.json(
      { error: '승인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}