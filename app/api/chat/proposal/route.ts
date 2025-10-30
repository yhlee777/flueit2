// app/api/chat/proposal/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * 인플루언서가 광고주에게 제안서 보내기
 * POST /api/chat/proposal
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📤 [API] POST /api/chat/proposal')

    // 세션 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const { advertiserId, campaignId, proposalMessage } = body

    console.log('🔍 [API] Proposal:', { userId, advertiserId, campaignId })

    // 1. 인플루언서 프로필 조회
    const { data: influencer, error: influencerError } = await supabaseAdmin
      .from('users')
      .select('id, username, name, image, user_type')
      .eq('id', userId)
      .eq('user_type', 'INFLUENCER')
      .single()

    if (influencerError || !influencer) {
      return NextResponse.json({ error: '인플루언서 정보를 찾을 수 없습니다' }, { status: 404 })
    }

    // 2. 광고주 정보 조회
    const { data: advertiser, error: advertiserError } = await supabaseAdmin
      .from('users')
      .select('id, username, name, image')
      .eq('id', advertiserId)
      .single()

    if (advertiserError || !advertiser) {
      return NextResponse.json({ error: '광고주 정보를 찾을 수 없습니다' }, { status: 404 })
    }

    // 3. 캠페인 정보 조회
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('id, title, category, payment_amount, reward_type')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: '캠페인 정보를 찾을 수 없습니다' }, { status: 404 })
    }

    // 4. 기존 채팅 확인 (중복 방지)
    const { data: existingChat } = await supabaseAdmin
      .from('chats')
      .select('id')
      .eq('influencer_id', userId)
      .eq('advertiser_id', advertiserId)
      .eq('campaign_id', campaignId)
      .single()

    if (existingChat) {
      return NextResponse.json({ 
        error: '이미 제안서를 보냈습니다',
        chatId: existingChat.id 
      }, { status: 400 })
    }

    // 5. 채팅방 생성 (상태: pending)
    const { data: chat, error: chatError } = await supabaseAdmin
      .from('chats')
      .insert({
        influencer_id: userId,
        influencer_name: influencer.name || influencer.username,
        influencer_avatar: influencer.image,
        advertiser_id: advertiserId,
        advertiser_name: advertiser.name || advertiser.username,
        advertiser_avatar: advertiser.image,
        campaign_id: campaignId,
        campaign_title: campaign.title,
        status: 'pending',
        initiated_by: 'influencer',
        is_active_collaboration: false,
      })
      .select()
      .single()

    if (chatError) {
      console.error('❌ [API] Chat creation error:', chatError)
      return NextResponse.json({ error: '채팅방 생성 실패' }, { status: 500 })
    }

    console.log('✅ [API] Chat created:', chat.id)

    // 6. 시스템 메시지: 인플루언서 프로필 카드
    const { error: profileError } = await supabaseAdmin
      .from('messages')
      .insert({
        chat_id: chat.id,
        sender_id: userId,
        sender_type: 'influencer',
        content: '인플루언서 프로필',
        message_type: 'profile_card',
        metadata: {
          userId: influencer.id,
          username: influencer.username,
          name: influencer.name,
          avatar: influencer.image,
          // 추가 프로필 정보 (나중에 확장)
        },
        is_read: false,
      })

    if (profileError) {
      console.error('❌ [API] Profile card error:', profileError)
    }

    // 7. 제안서 메시지
    const { error: proposalError } = await supabaseAdmin
      .from('messages')
      .insert({
        chat_id: chat.id,
        sender_id: userId,
        sender_type: 'influencer',
        content: proposalMessage,
        message_type: 'proposal',
        is_read: false,
      })

    if (proposalError) {
      console.error('❌ [API] Proposal message error:', proposalError)
      return NextResponse.json({ error: '제안서 전송 실패' }, { status: 500 })
    }

    // 8. 채팅방 updated_at 갱신
    await supabaseAdmin
      .from('chats')
      .update({ 
        updated_at: new Date().toISOString(),
        last_message: proposalMessage.substring(0, 100)
      })
      .eq('id', chat.id)

    console.log('✅ [API] Proposal sent successfully')

    return NextResponse.json({
      success: true,
      chatId: chat.id,
      message: '제안서가 전송되었습니다'
    })

  } catch (error: any) {
    console.error('❌ [API] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}