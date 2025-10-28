// app/api/campaigns/[id]/applications/[applicationId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

// PATCH /api/campaigns/[id]/applications/[applicationId] - 신청 상태 변경
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; applicationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { id: campaignId, applicationId } = params
    const { status } = await request.json()

    console.log('🔍 신청 상태 변경 시도:', { campaignId, applicationId, status })

    if (!status) {
      return NextResponse.json(
        { error: '상태 값이 필요합니다.' },
        { status: 400 }
      )
    }

    // 유효한 상태 값 확인
    const validStatuses = ['검토 중', '승인', '거절', '협업 확정']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: '유효하지 않은 상태 값입니다.' },
        { status: 400 }
      )
    }

    // 캠페인 소유자 확인
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('user_id, confirmed_applicants')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: '캠페인을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (campaign.user_id !== session.user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 신청 존재 확인
    const { data: application, error: appError } = await supabaseAdmin
      .from('campaign_applications')
      .select('status')
      .eq('id', applicationId)
      .eq('campaign_id', campaignId)
      .single()

    if (appError || !application) {
      return NextResponse.json(
        { error: '신청 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const previousStatus = application.status

    // 신청 상태 업데이트
    const { data: updatedApplication, error: updateError } = await supabaseAdmin
      .from('campaign_applications')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ 신청 상태 변경 오류:', updateError)
      return NextResponse.json(
        { error: '신청 상태 변경에 실패했습니다.' },
        { status: 500 }
      )
    }

    // confirmed_applicants 카운트 업데이트
    let confirmedCount = campaign.confirmed_applicants || 0

    // 이전 상태가 '협업 확정'이 아니었는데 지금 '협업 확정'으로 변경 → +1
    if (previousStatus !== '협업 확정' && status === '협업 확정') {
      confirmedCount += 1
    }
    // 이전 상태가 '협업 확정'이었는데 다른 상태로 변경 → -1
    else if (previousStatus === '협업 확정' && status !== '협업 확정') {
      confirmedCount = Math.max(0, confirmedCount - 1)
    }

    await supabaseAdmin
      .from('campaigns')
      .update({ confirmed_applicants: confirmedCount })
      .eq('id', campaignId)

    console.log(`✅ 신청 ${applicationId} 상태 변경: ${previousStatus} → ${status}`)

    return NextResponse.json({
      success: true,
      message: '신청 상태가 변경되었습니다.',
      application: updatedApplication,
    })
  } catch (error) {
    console.error('❌ 신청 상태 변경 오류:', error)
    return NextResponse.json(
      { error: '신청 상태 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/campaigns/[id]/applications/[applicationId] - 신청 취소
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; applicationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { id: campaignId, applicationId } = params

    console.log('🔍 신청 취소 시도:', { campaignId, applicationId })

    // 신청 정보 조회
    const { data: application, error: fetchError } = await supabaseAdmin
      .from('campaign_applications')
      .select('influencer_id, status')
      .eq('id', applicationId)
      .eq('campaign_id', campaignId)
      .single()

    if (fetchError || !application) {
      return NextResponse.json(
        { error: '신청 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 본인의 신청만 취소 가능
    if (application.influencer_id !== session.user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 신청 삭제
    const { error: deleteError } = await supabaseAdmin
      .from('campaign_applications')
      .delete()
      .eq('id', applicationId)

    if (deleteError) {
      console.error('❌ 신청 취소 오류:', deleteError)
      return NextResponse.json(
        { error: '신청 취소에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 캠페인의 applicants 카운트 감소
    const { data: campaign } = await supabaseAdmin
      .from('campaigns')
      .select('applicants, confirmed_applicants')
      .eq('id', campaignId)
      .single()

    if (campaign) {
      const updates: any = {
        applicants: Math.max(0, (campaign.applicants || 0) - 1)
      }

      // 확정 상태였다면 confirmed_applicants도 감소
      if (application.status === '협업 확정') {
        updates.confirmed_applicants = Math.max(0, (campaign.confirmed_applicants || 0) - 1)
      }

      await supabaseAdmin
        .from('campaigns')
        .update(updates)
        .eq('id', campaignId)
    }

    console.log('✅ 신청 취소 성공:', applicationId)

    return NextResponse.json({
      success: true,
      message: '신청이 취소되었습니다.',
    })
  } catch (error) {
    console.error('❌ 신청 취소 오류:', error)
    return NextResponse.json(
      { error: '신청 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}