// app/api/chat/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * 채팅 상태 변경 (수락/거절)
 * PATCH /api/chat/[id]/status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔄 [API] PATCH /api/chat/[id]/status - chatId:', params.id)

    // 세션 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const chatId = parseInt(params.id)
    const userId = session.user.id
    const body = await request.json()
    const { status } = body // 'active' or 'rejected'

    console.log('🔍 [API] Status change:', { chatId, userId, newStatus: status })

    if (!['active', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // 1. 채팅방 조회
    const { data: chat, error: chatError } = await supabaseAdmin
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single()

    if (chatError || !chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    // 2. 권한 확인
    // 인플루언서가 시작한 경우: 광고주만 수락/거절 가능
    // 광고주가 시작한 경우: 상태 변경 불필요 (바로 active)
    if (chat.initiated_by === 'influencer') {
      // 광고주만 수락/거절 가능
      if (chat.advertiser_id !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    } else {
      // 광고주가 시작한 경우 상태 변경 불필요
      return NextResponse.json({ error: 'Cannot change status' }, { status: 400 })
    }

    // 3. 상태 업데이트
    const { error: updateError } = await supabaseAdmin
      .from('chats')
      .update({
        status: status,
        is_active_collaboration: status === 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', chatId)

    if (updateError) {
      console.error('❌ [API] Update error:', updateError)
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    // 4. 시스템 메시지 추가
    const systemMessage = status === 'active' 
      ? '✅ 광고주가 제안을 수락했습니다. 채팅을 시작하세요!'
      : '❌ 광고주가 제안을 거절했습니다.'

    await supabaseAdmin
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: userId,
        sender_type: 'system',
        content: systemMessage,
        message_type: 'system',
        is_read: false,
      })

    console.log('✅ [API] Status updated:', status)

    return NextResponse.json({
      success: true,
      status: status,
      message: status === 'active' ? '제안을 수락했습니다' : '제안을 거절했습니다'
    })

  } catch (error: any) {
    console.error('❌ [API] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}