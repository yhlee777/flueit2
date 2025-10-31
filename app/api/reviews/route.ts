import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const influencerId = searchParams.get('influencerId')

    if (!influencerId) {
      return NextResponse.json({ error: 'influencerId is required' }, { status: 400 })
    }

    console.log('🔍 [Reviews] Fetching for influencer:', influencerId)

    // ✅ 올바른 컬럼명 사용
    const { data: reviews, error } = await supabaseAdmin
      .from('reviews')
      .select(`
        id,
        rating,
        content,
        is_public,
        created_at,
        advertiser:users!reviews_advertiser_id_fkey(
          id,
          username,
          name,
          image
        ),
        campaign:campaigns!reviews_campaign_id_fkey(
          id,
          title
        )
      `)
      .eq('influencer_id', influencerId)
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ [Reviews] Query error:', error)
      return NextResponse.json({ 
        reviews: [],
        error: error.message 
      }, { status: 200 })
    }

    console.log(`✅ [Reviews] Found ${reviews?.length || 0} reviews`)

    return NextResponse.json({ 
      reviews: reviews || [],
      count: reviews?.length || 0
    })

  } catch (error: any) {
    console.error('❌ [Reviews] Server error:', error)
    return NextResponse.json({ 
      reviews: [],
      error: error.message 
    }, { status: 200 })
  }
}

// POST - 리뷰 작성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaign_id, influencer_id, advertiser_id, rating, content, is_public = true } = body

    // 유효성 검사
    if (!campaign_id || !influencer_id || !advertiser_id || !rating) {
      return NextResponse.json(
        { error: 'campaign_id, influencer_id, advertiser_id, rating are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    const { data: review, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        campaign_id,
        influencer_id,
        advertiser_id,
        rating,
        content: content || null,
        is_public
      })
      .select()
      .single()

    if (error) {
      console.error('❌ [Reviews] Insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ [Reviews] Review created:', review.id)

    return NextResponse.json({ 
      review,
      message: '리뷰가 작성되었습니다'
    })

  } catch (error: any) {
    console.error('❌ [Reviews] Server error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}