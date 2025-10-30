// app/api/chat/invite/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * 광고주가 인플루언서에게 채팅 시작
 * POST /api/chat/invite
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📤 [API] POST /api/chat/invite')

    // 세션 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const { influencerId, campaignId, message } = body

    console.log('🔍 [API] Invite:', { userId, influencerId, campaignId })

    // 1. 광고주 정보 조회
    const { data: advertiser, error: advertiserError } = await supabaseAdmin
      .from('users')
      .select('id, username, name, image, user_type')
      .eq('id', userId)
      .eq('user_type', 'ADVERTISER')
      .single()

    if (advertiserError || !advertiser) {
      return NextResponse.json({ error: '광고주 정보를 찾을 수 없습니다' }, { status: 404 })
    }

    // 2. 인플루언서 정보 조회
    const { data: influencer, error: influencerError } = await supabaseAdmin
      .from('users')
      .select('id, username, name, image')
      .eq('id', influencerId)
      .single()

    if (influencerError || !influencer) {
      return NextResponse.json({ error: '인플루언서 정보를 찾을 수 없습니다' }, { status: 404 })
    }

    // 3. 캠페인 정보 조회
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('id, title, category, payment_amount, reward_type, thumbnail')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: '캠페인 정보를 찾을 수 없습니다' }, { status: 404 })
    }

    // 4. 기존 채팅 확인 (중복 방지)
    const { data: existingChat } = await supabaseAdmin
      .from('chats')
      .select('id')
      .eq('influencer_id', influencerId)
      .eq('advertiser_id', userId)
      .eq('campaign_id', campaignId)
      .single()

    if (existingChat) {
      return NextResponse.json({ 
        error: '이미 채팅방이 존재합니다',
        chatId: existingChat.id 
      }, { status: 400 })
    }

    // 5. 채팅방 생성 (상태: 바로 active)
    const { data: chat, error: chatError } = await supabaseAdmin
      .from('chats')
      .insert({
        influencer_id: influencerId,
        influencer_name: influencer.name || influencer.username,
        influencer_avatar: influencer.image,
        advertiser_id: userId,
        advertiser_name: advertiser.name || advertiser.username,
        advertiser_avatar: advertiser.image,
        campaign_id: campaignId,
        campaign_title: campaign.title,
        status: 'active', // ✅ 바로 active!
        initiated_by: 'advertiser',
        is_active_collaboration: true,
      })
      .select()
      .single()

    if (chatError) {
      console.error('❌ [API] Chat creation error:', chatError)
      return NextResponse.json({ error: '채팅방 생성 실패' }, { status: 500 })
    }

    console.log('✅ [API] Chat created:', chat.id)

    // 6. 시스템 메시지: 캠페인 카드
    const { error: campaignError2 } = await supabaseAdmin
      .from('messages')
      .insert({
        chat_id: chat.id,
        sender_id: userId,
        sender_type: 'advertiser',
        content: '캠페인 제안',
        message_type: 'campaign_card',
        metadata: {
          campaignId: campaign.id,
          title: campaign.title,
          category: campaign.category,
          paymentAmount: campaign.payment_amount,
          rewardType: campaign.reward_type,
          thumbnail: campaign.thumbnail,
        },
        is_read: false,
      })

    if (campaignError2) {
      console.error('❌ [API] Campaign card error:', campaignError2)
    }

    // 7. 광고주의 첫 메시지 (선택사항)
    if (message && message.trim()) {
      const { error: messageError } = await supabaseAdmin
        .from('messages')
        .insert({
          chat_id: chat.id,
          sender_id: userId,
          sender_type: 'advertiser',
          content: message.trim(),
          message_type: 'text',
          is_read: false,
        })

      if (messageError) {
        console.error('❌ [API] Message error:', messageError)
      }
    }

    // 8. 채팅방 updated_at 갱신
    await supabaseAdmin
      .from('chats')
      .update({ 
        updated_at: new Date().toISOString(),
        last_message: message?.substring(0, 100) || '캠페인 제안'
      })
      .eq('id', chat.id)

    console.log('✅ [API] Invite sent successfully')

    return NextResponse.json({
      success: true,
      chatId: chat.id,
      message: '채팅이 시작되었습니다'
    })

  } catch (error: any) {
    console.error('❌ [API] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}