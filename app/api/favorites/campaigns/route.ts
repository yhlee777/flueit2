// app/api/favorites/campaigns/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/favorites/campaigns - 사용자의 찜한 캠페인 목록 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    console.log('🔍 찜한 캠페인 목록 조회:', session.user.id)

    // DB에서 사용자의 찜한 캠페인 목록 조회
    const { data, error } = await supabaseAdmin
      .from('favorite_campaigns')
      .select('campaign_id')
      .eq('user_id', session.user.id)

    if (error) {
      console.error('❌ 찜한 캠페인 조회 오류:', error)
      return NextResponse.json(
        { error: '찜한 캠페인을 불러오는데 실패했습니다.' },
        { status: 500 }
      )
    }

    const campaignIds = data.map(item => item.campaign_id)
    console.log('✅ 찜한 캠페인 목록:', campaignIds)

    return NextResponse.json({
      success: true,
      campaignIds: campaignIds,
    })
  } catch (error) {
    console.error('❌ 찜한 캠페인 조회 오류:', error)
    return NextResponse.json(
      { error: '찜한 캠페인 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/favorites/campaigns - 캠페인 찜하기
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { campaignId } = body

    if (!campaignId) {
      return NextResponse.json(
        { error: '캠페인 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    console.log('💗 캠페인 찜하기:', { userId: session.user.id, campaignId })

    // 이미 찜했는지 확인
    const { data: existing } = await supabaseAdmin
      .from('favorite_campaigns')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('campaign_id', campaignId)
      .single()

    if (existing) {
      return NextResponse.json({
        success: true,
        message: '이미 찜한 캠페인입니다.',
        alreadyFavorited: true,
      })
    }

    // DB에 찜 추가
    const { data, error } = await supabaseAdmin
      .from('favorite_campaigns')
      .insert({
        user_id: session.user.id,
        campaign_id: campaignId,
      })
      .select()
      .single()

    if (error) {
      console.error('❌ 캠페인 찜 추가 오류:', error)
      return NextResponse.json(
        { error: '캠페인 찜에 실패했습니다.' },
        { status: 500 }
      )
    }

    console.log('✅ 캠페인 찜 성공:', data)

    return NextResponse.json({
      success: true,
      message: '캠페인을 찜했습니다.',
      favorite: data,
    })
  } catch (error) {
    console.error('❌ 캠페인 찜 오류:', error)
    return NextResponse.json(
      { error: '캠페인 찜 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/favorites/campaigns - 캠페인 찜 해제
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')

    if (!campaignId) {
      return NextResponse.json(
        { error: '캠페인 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    console.log('💔 캠페인 찜 해제:', { userId: session.user.id, campaignId })

    // DB에서 찜 삭제
    const { error } = await supabaseAdmin
      .from('favorite_campaigns')
      .delete()
      .eq('user_id', session.user.id)
      .eq('campaign_id', campaignId)

    if (error) {
      console.error('❌ 캠페인 찜 해제 오류:', error)
      return NextResponse.json(
        { error: '캠페인 찜 해제에 실패했습니다.' },
        { status: 500 }
      )
    }

    console.log('✅ 캠페인 찜 해제 성공')

    return NextResponse.json({
      success: true,
      message: '캠페인 찜을 해제했습니다.',
    })
  } catch (error) {
    console.error('❌ 캠페인 찜 해제 오류:', error)
    return NextResponse.json(
      { error: '캠페인 찜 해제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}