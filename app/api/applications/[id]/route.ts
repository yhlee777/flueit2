// app/api/applications/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

// DELETE /api/applications/[id] - 지원 취소
export async function DELETE(
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

    const { id: applicationId } = params

    console.log('🔍 지원 취소 시도:', { applicationId, userId: session.user.id })

    // 지원 내역 확인
    const { data: application, error: fetchError } = await supabaseAdmin
      .from('campaign_applications')
      .select('*, campaign:campaigns(applicants)')
      .eq('id', applicationId)
      .single()

    if (fetchError || !application) {
      return NextResponse.json(
        { error: '지원 내역을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 권한 확인 - 본인만 취소 가능
    if (application.influencer_id !== session.user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 이미 취소됨
    if (application.status === 'cancelled') {
      return NextResponse.json(
        { error: '이미 취소된 지원입니다.' },
        { status: 400 }
      )
    }

    // 지원 취소 (삭제가 아닌 상태 변경)
    const { error: updateError } = await supabaseAdmin
      .from('campaign_applications')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)

    if (updateError) {
      console.error('❌ 지원 취소 오류:', updateError)
      return NextResponse.json(
        { error: '지원 취소 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // 캠페인의 applicants 카운트 감소
    const currentApplicants = application.campaign?.applicants || 0
    if (currentApplicants > 0) {
      await supabaseAdmin
        .from('campaigns')
        .update({ 
          applicants: currentApplicants - 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', application.campaign_id)
    }

    console.log('✅ 지원 취소 성공:', applicationId)

    return NextResponse.json({
      success: true,
      message: '지원이 취소되었습니다.',
    })

  } catch (error) {
    console.error('❌ 지원 취소 오류:', error)
    return NextResponse.json(
      { error: '지원 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// GET /api/applications/[id] - 지원 상세 조회
export async function GET(
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

    const { id: applicationId } = params

    const { data: application, error } = await supabaseAdmin
      .from('campaign_applications')
      .select(`
        *,
        campaign:campaigns (*),
        influencer:users!influencer_id (id, username, email, name, image)
      `)
      .eq('id', applicationId)
      .single()

    if (error || !application) {
      return NextResponse.json(
        { error: '지원 내역을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 권한 확인 - 본인 또는 캠페인 소유자만 조회 가능
    const isOwner = application.influencer_id === session.user.id
    const isCampaignOwner = application.campaign?.user_id === session.user.id

    if (!isOwner && !isCampaignOwner) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      application,
    })

  } catch (error) {
    console.error('❌ 지원 내역 조회 오류:', error)
    return NextResponse.json(
      { error: '지원 내역 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}