// app/api/careers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('📥 [API] POST /api/careers')

    // 세션 확인
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('❌ [API] Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const { influencer_id, campaign_id, campaign_title, category } = body

    console.log('📝 [API] Adding career record:', { 
      influencer_id, 
      campaign_id, 
      campaign_title, 
      category 
    })

    // 1. 검증
    if (!influencer_id || !campaign_id || !campaign_title) {
      return NextResponse.json({ 
        error: '필수 정보가 누락되었습니다.' 
      }, { status: 400 })
    }

    // 2. 중복 체크 (같은 인플루언서 + 캠페인 조합)
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('careers')
      .select('id')
      .eq('influencer_id', influencer_id)
      .eq('campaign_id', campaign_id)
      .single()

    if (existing) {
      console.log('⚠️ [API] Career record already exists')
      return NextResponse.json({ 
        success: true,
        message: '이미 경력이 등록되어 있습니다.',
        career_id: existing.id
      })
    }

    // 3. 경력 레코드 생성
    const { data: career, error: insertError } = await supabaseAdmin
      .from('careers')
      .insert({
        influencer_id,
        campaign_id,
        project_name: campaign_title,
        category: category || '기타',
        type: '포스팅',
        verified: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ [API] Insert error:', insertError)
      return NextResponse.json({ 
        error: '경력 추가 실패: ' + insertError.message 
      }, { status: 500 })
    }

    console.log('✅ [API] Career added:', career.id)

    return NextResponse.json({
      success: true,
      message: '경력이 추가되었습니다.',
      career
    })

  } catch (error: any) {
    console.error('❌ [API] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ✅ 인플루언서의 경력 목록 조회
export async function GET(request: NextRequest) {
  try {
    console.log('📥 [API] GET /api/careers')

    const { searchParams } = new URL(request.url)
    const influencerId = searchParams.get('influencer_id')

    if (!influencerId) {
      return NextResponse.json({ 
        error: 'influencer_id가 필요합니다.' 
      }, { status: 400 })
    }

    // 경력 목록 조회
    const { data: careers, error } = await supabaseAdmin
      .from('careers')
      .select('*')
      .eq('influencer_id', influencerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ [API] Query error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ [API] Careers found:', careers?.length || 0)

    return NextResponse.json({
      careers: careers || []
    })

  } catch (error: any) {
    console.error('❌ [API] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}