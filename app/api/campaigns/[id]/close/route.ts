// app/api/campaigns/[id]/close/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('📥 [API] POST /api/campaigns/[id]/close - campaignId:', params.id)

    // 세션 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('❌ [API] Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaignId = params.id
    const userId = session.user.id

    console.log('🔍 [API] Closing campaign:', { campaignId, userId })

    // 1. 캠페인 존재 확인
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      console.error('❌ [API] Campaign not found:', campaignError)
      return NextResponse.json({ error: '캠페인을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 2. 권한 확인 (캠페인 소유자만 마감 가능)
    if (campaign.user_id !== userId) {
      console.log('❌ [API] Forbidden - not owner')
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
    }

    // 3. 캠페인 상태를 "구인 마감"으로 변경
    const { error: updateError } = await supabaseAdmin
      .from('campaigns')
      .update({ 
        status: '구인 마감',
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)

    if (updateError) {
      console.error('❌ [API] Update error:', updateError)
      return NextResponse.json({ error: '캠페인 마감 실패' }, { status: 500 })
    }

    console.log('✅ [API] Campaign closed successfully')

    return NextResponse.json({
      success: true,
      message: '캠페인이 마감되었습니다.'
    })

  } catch (error: any) {
    console.error('❌ [API] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}