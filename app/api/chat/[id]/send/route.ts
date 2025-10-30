// app/api/chat/[id]/send/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📤 [API] POST /api/chat/[id]/send - chatId:', params.id)

    // 세션 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('❌ [API] Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const chatId = parseInt(params.id)
    const userId = session.user.id
    const body = await request.json()

    console.log('🔍 [API] Send message:', { chatId, userId, content: body.content?.substring(0, 20) })

    // 채팅방 참여자 확인
    const { data: chat, error: chatError } = await supabaseAdmin
      .from('chats')
      .select('influencer_id, advertiser_id')
      .eq('id', chatId)
      .single()

    if (chatError || !chat) {
      console.error('❌ [API] Chat not found:', chatError)
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    // 권한 확인
    if (chat.influencer_id !== userId && chat.advertiser_id !== userId) {
      console.log('❌ [API] Forbidden')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // sender_type 결정
    const senderType = chat.influencer_id === userId ? 'influencer' : 'advertiser'

    // 메시지 생성
    const { data: message, error: messageError } = await supabaseAdmin
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: userId,
        sender_type: senderType,
        content: body.content,
        message_type: body.message_type || 'text',
        file_url: body.file_url,
        file_name: body.file_name,
        file_size: body.file_size,
        is_read: false,
      })
      .select()
      .single()

    if (messageError) {
      console.error('❌ [API] Message error:', messageError)
      return NextResponse.json({ error: messageError.message }, { status: 500 })
    }

    console.log('✅ [API] Message sent:', message.id)

    // 채팅방 updated_at 갱신
    await supabaseAdmin
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId)

    return NextResponse.json({ message })

  } catch (error: any) {
    console.error('❌ [API] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}