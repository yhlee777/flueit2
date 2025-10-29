// app/api/applications/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/applications - 내 지원 내역 조회 (인플루언서용)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const influencerId = searchParams.get('influencer_id') || session.user.id

    // 권한 확인 - 본인 것만 조회 가능
    if (influencerId !== session.user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    console.log('🔍 지원 내역 조회:', { influencerId })

    // 지원 내역 조회 (캠페인 정보 포함)
    const { data: applications, error } = await supabaseAdmin
      .from('campaign_applications')
      .select(`
        *,
        campaign:campaigns (
          id,
          title,
          category,
          status,
          user_id,
          thumbnail,
          payment_amount,
          reward_type,
          product_name
        )
      `)
      .eq('influencer_id', influencerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ 지원 내역 조회 오류:', error)
      return NextResponse.json(
        { error: '지원 내역 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    console.log(`✅ 지원 내역 ${applications?.length || 0}개 조회 성공`)

    // 데이터 포맷팅
    const formattedApplications = applications?.map((app: any) => {
      // 시간 계산
      const createdAt = new Date(app.created_at)
      const now = new Date()
      const diffMs = now.getTime() - createdAt.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)
      
      let appliedTime = ''
      if (diffHours < 1) {
        appliedTime = '방금 전'
      } else if (diffHours < 24) {
        appliedTime = `${diffHours}시간 전`
      } else {
        appliedTime = `${diffDays}일 전`
      }

      // 캠페인 상태 색상
      let campaignStatusColor = 'bg-[#7b68ee]'
      if (app.campaign?.status === '구인 마감') {
        campaignStatusColor = 'bg-gray-500'
      }

      // 지원 상태 한글 변환
      let applicationStatus = '지원 완료'
      if (app.status === 'rejected') {
        applicationStatus = '다음기회에'
      } else if (app.status === 'accepted') {
        applicationStatus = '승인됨'
      } else if (app.status === 'cancelled') {
        applicationStatus = '취소됨'
      }

      return {
        id: app.id,
        campaignId: app.campaign_id,
        applicationStatus,
        campaignStatus: app.campaign?.status || '알 수 없음',
        campaignStatusColor,
        title: app.campaign?.title || '삭제된 캠페인',
        advertiser: '광고주', // TODO: 광고주 정보 추가
        appliedTime,
        message: app.message,
        status: app.status,
        createdAt: app.created_at,
      }
    }) || []

    return NextResponse.json({
      success: true,
      applications: formattedApplications,
      total: formattedApplications.length,
    })

  } catch (error) {
    console.error('❌ 지원 내역 조회 오류:', error)
    return NextResponse.json(
      { error: '지원 내역 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}