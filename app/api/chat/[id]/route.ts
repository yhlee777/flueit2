// app/api/chat/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📥 [API] GET /api/chat/[id] - chatId:', params.id)

    // 세션 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('❌ [API] Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const chatId = parseInt(params.id)
    const userId = session.user.id

    console.log('🔍 [API] Loading chat:', { chatId, userId })

    // 1. 채팅방 정보 가져오기 (✅ supabaseAdmin 사용)
    const { data: chat, error: chatError } = await supabaseAdmin
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single()

    if (chatError) {
      console.error('❌ [API] Chat error:', chatError)
      return NextResponse.json({ error: chatError.message }, { status: 500 })
    }

    // 권한 확인 - 본인이 참여한 채팅방인지 확인
    if (chat.influencer_id !== userId && chat.advertiser_id !== userId) {
      console.log('❌ [API] Forbidden - not a participant')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('✅ [API] Chat loaded:', chat.id)

    // 2. 메시지 목록 가져오기 (✅ supabaseAdmin 사용)
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('❌ [API] Messages error:', messagesError)
      return NextResponse.json({ error: messagesError.message }, { status: 500 })
    }

    console.log('✅ [API] Messages loaded:', messages?.length || 0)

    return NextResponse.json({
      chat,
      messages: messages || []
    })

  } catch (error: any) {
    console.error('❌ [API] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}