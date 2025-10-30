// app/api/chat/list/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('📥 [API] GET /api/chat/list')

    // 세션 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('❌ [API] Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const userType = (session.user as any).userType

    console.log('🔍 [API] Loading chats for:', { userId, userType })

    // userType에 따라 쿼리 분기
    const column = userType === 'INFLUENCER' ? 'influencer_id' : 'advertiser_id'
    const archiveColumn = userType === 'INFLUENCER' 
      ? 'is_archived_by_influencer' 
      : 'is_archived_by_advertiser'

    // 채팅 목록 조회
    const { data: chats, error } = await supabaseAdmin
      .from('chats')
      .select('*')
      .eq(column, userId)
      .eq(archiveColumn, false)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('❌ [API] Chats error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ [API] Chats loaded:', chats?.length || 0)

    // 각 채팅의 안 읽은 메시지 개수 조회
    const chatsWithUnread = await Promise.all(
      (chats || []).map(async (chat) => {
        const { count } = await supabaseAdmin
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_id', chat.id)
          .eq('is_read', false)
          .neq('sender_id', userId)

        return {
          ...chat,
          unread_count: count || 0,
        }
      })
    )

    return NextResponse.json({ chats: chatsWithUnread })

  } catch (error: any) {
    console.error('❌ [API] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}