// app/api/chat/find/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'  // ✅ supabaseAdmin 사용

export async function POST(request: NextRequest) {
  try {
    console.log('📨 [API] /api/chat/find 호출됨')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      console.log('❌ [API] 로그인 필요')
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { advertiserId, campaignId } = body
    const influencerId = session.user.id

    console.log('🔍 [API] 채팅 검색:', {
      influencerId,
      advertiserId,
      campaignId
    })

    if (!advertiserId || !campaignId) {
      console.log('❌ [API] 필수 파라미터 누락')
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // 1. 기존 채팅방 찾기 (✅ supabaseAdmin 사용)
    const { data: existingChat, error: searchError } = await supabaseAdmin
      .from('chats')
      .select('id')
      .eq('influencer_id', influencerId)
      .eq('advertiser_id', advertiserId)
      .eq('campaign_id', campaignId)
      .maybeSingle()

    if (searchError) {
      console.error('❌ [API] 채팅 검색 오류:', searchError)
      return NextResponse.json(
        { error: '채팅을 찾는 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // 2. 기존 채팅방이 있으면 해당 ID 반환
    if (existingChat) {
      console.log('✅ [API] 기존 채팅방 발견:', existingChat.id)
      return NextResponse.json({
        success: true,
        chatId: existingChat.id,
        isNew: false
      })
    }

    // 3. 인플루언서 정보 조회 (✅ 이름과 아바타)
    const { data: influencer, error: influencerError } = await supabaseAdmin
      .from('users')
      .select('username, name, image')
      .eq('id', influencerId)
      .single()

    if (influencerError || !influencer) {
      console.error('❌ [API] 인플루언서 정보 조회 오류:', influencerError)
      return NextResponse.json(
        { error: '인플루언서 정보를 찾을 수 없습니다.' },
        { status: 500 }
      )
    }

    // 4. 광고주 정보 조회 (✅ 이름과 아바타)
    const { data: advertiser, error: advertiserError } = await supabaseAdmin
      .from('users')
      .select('username, name, image')
      .eq('id', advertiserId)
      .single()

    if (advertiserError || !advertiser) {
      console.error('❌ [API] 광고주 정보 조회 오류:', advertiserError)
      return NextResponse.json(
        { error: '광고주 정보를 찾을 수 없습니다.' },
        { status: 500 }
      )
    }

    // 5. 캠페인 정보 가져오기 (제목 필요)
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('title')
      .eq('id', campaignId)
      .single()

    if (campaignError) {
      console.error('❌ [API] 캠페인 정보 조회 오류:', campaignError)
    }

    // 6. 새 채팅방 생성 (✅ supabaseAdmin 사용 - RLS 우회)
    console.log('🆕 [API] 새 채팅방 생성 시도')
    
    const { data: newChat, error: createError } = await supabaseAdmin
      .from('chats')
      .insert({
        influencer_id: influencerId,
        influencer_name: influencer.name || influencer.username,
        influencer_avatar: influencer.image,
        advertiser_id: advertiserId,
        advertiser_name: advertiser.name || advertiser.username,
        advertiser_avatar: advertiser.image,
        campaign_id: campaignId,
        campaign_title: campaign?.title || '캠페인',
        status: 'active',
        initiated_by: 'influencer',
        is_active_collaboration: false,
        last_message_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (createError) {
      console.error('❌ [API] 채팅방 생성 오류:', createError)
      return NextResponse.json(
        { error: '채팅방 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    console.log('✅ [API] 새 채팅방 생성 완료:', newChat.id)

    return NextResponse.json({
      success: true,
      chatId: newChat.id,
      isNew: true
    })

  } catch (error) {
    console.error('❌ [API] /api/chat/find 오류:', error)
    return NextResponse.json(
      { error: '오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}