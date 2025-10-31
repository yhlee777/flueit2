// app/api/applications/update-status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('📝 [API] POST /api/applications/update-status')

    // 세션 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('❌ [API] Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { campaign_id, influencer_id, status } = body

    console.log('🔍 [API] Update application status:', { campaign_id, influencer_id, status })

    // 유효성 검사
    if (!campaign_id || !influencer_id || !status) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // status 값 검증
    const validStatuses = ['검토 중', '승인됨', '거절됨']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: '유효하지 않은 상태값입니다.' },
        { status: 400 }
      )
    }

    // application 찾기 및 업데이트
    const { data, error } = await supabaseAdmin
      .from('campaign_applications')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('campaign_id', campaign_id)
      .eq('influencer_id', influencer_id)
      .select()
      .single()

    if (error) {
      console.error('❌ [API] Update error:', error)
      return NextResponse.json(
        { error: '지원 내역 업데이트 실패: ' + error.message },
        { status: 500 }
      )
    }

    if (!data) {
      console.log('⚠️ [API] Application not found')
      return NextResponse.json(
        { error: '지원 내역을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    console.log('✅ [API] Application status updated:', data.id)

    return NextResponse.json({
      success: true,
      application: data,
      message: '지원 내역이 업데이트되었습니다.'
    })

  } catch (error: any) {
    console.error('❌ [API] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}