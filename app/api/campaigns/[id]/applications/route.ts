// app/api/campaigns/[id]/applications/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/campaigns/[id]/applications - 캠페인 신청자 목록 조회
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

    const { id: campaignId } = params

    // 캠페인 소유자 확인
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('user_id')
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

    // 신청자 목록 조회 (인플루언서 프로필 포함)
    const { data: applications, error } = await supabaseAdmin
      .from('campaign_applications')
      .select(`
        *,
        influencer:users!influencer_id (
          id,
          username,
          email,
          profile_image
        )
      `)
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ 신청자 조회 오류:', error)
      return NextResponse.json(
        { error: '신청자 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    console.log(`✅ 캠페인 ${campaignId} 신청자 ${applications?.length || 0}명 조회`)

    return NextResponse.json({
      success: true,
      applications: applications || [],
      total: applications?.length || 0,
    })
  } catch (error) {
    console.error('❌ 신청자 조회 오류:', error)
    return NextResponse.json(
      { error: '신청자 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns/[id]/applications - 캠페인 지원하기
export async function POST(
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

    const { id: campaignId } = params
    const body = await request.json()

    console.log('🔍 캠페인 지원 시도:', { campaignId, userId: session.user.id })

    // 캠페인 존재 확인
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('id, status, user_id, applicants')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: '캠페인을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 자기 캠페인에 지원 불가
    if (campaign.user_id === session.user.id) {
      return NextResponse.json(
        { error: '본인의 캠페인에는 지원할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 캠페인 상태 확인
    if (campaign.status !== '구인 진행 중') {
      return NextResponse.json(
        { error: '지원할 수 없는 캠페인입니다.' },
        { status: 400 }
      )
    }

    // 중복 지원 확인
    const { data: existingApplication } = await supabaseAdmin
      .from('campaign_applications')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('influencer_id', session.user.id)
      .single()

    if (existingApplication) {
      return NextResponse.json(
        { error: '이미 지원한 캠페인입니다.' },
        { status: 400 }
      )
    }

    // 지원 등록
    const { data: application, error: insertError } = await supabaseAdmin
      .from('campaign_applications')
      .insert({
        campaign_id: campaignId,
        influencer_id: session.user.id,
        status: '검토 중',
        message: body.message || '',
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ 지원 등록 오류:', insertError)
      return NextResponse.json(
        { error: '지원 등록 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // 캠페인의 applicants 카운트 증가
    await supabaseAdmin
      .from('campaigns')
      .update({ applicants: (campaign.applicants || 0) + 1 })
      .eq('id', campaignId)

    console.log('✅ 캠페인 지원 성공:', application.id)

    return NextResponse.json({
      success: true,
      message: '캠페인에 지원되었습니다.',
      application,
    })
  } catch (error) {
    console.error('❌ 캠페인 지원 오류:', error)
    return NextResponse.json(
      { error: '캠페인 지원 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}