import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/reviews - 리뷰 작성
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { influencerId, campaignId, rating, content, tags } = body

    if (!influencerId || !campaignId || !rating || !content) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: '평점은 1~5 사이여야 합니다.' },
        { status: 400 }
      )
    }

    console.log('🔍 리뷰 작성 시도:', { 
      reviewerId: session.user.id, 
      influencerId, 
      campaignId 
    })

    // 캠페인 존재 및 권한 확인
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('user_id, status')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: '캠페인을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 캠페인 작성자만 리뷰 가능
    if (campaign.user_id !== session.user.id) {
      return NextResponse.json(
        { error: '리뷰 작성 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 중복 리뷰 확인
    const { data: existingReview } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('reviewer_id', session.user.id)
      .eq('influencer_id', influencerId)
      .single()

    if (existingReview) {
      return NextResponse.json(
        { error: '이미 리뷰를 작성했습니다.' },
        { status: 400 }
      )
    }

    // ✅ 리뷰 생성
    const { data: review, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        campaign_id: campaignId,
        reviewer_id: session.user.id,
        influencer_id: influencerId,
        rating,
        content,
        tags: tags || [],
      })
      .select()
      .single()

    if (error) {
      console.error('❌ 리뷰 작성 오류:', error)
      return NextResponse.json(
        { error: '리뷰 작성 중 오류가 발생했습니다.', details: error.message },
        { status: 500 }
      )
    }

    // ✅ 인플루언서의 평균 평점 업데이트
    const { data: allReviews } = await supabaseAdmin
      .from('reviews')
      .select('rating')
      .eq('influencer_id', influencerId)

    if (allReviews && allReviews.length > 0) {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      
      await supabaseAdmin
        .from('users')
        .update({ 
          average_rating: avgRating,
          total_reviews: allReviews.length,
          updated_at: new Date().toISOString(),
        })
        .eq('id', influencerId)
    }

    console.log('✅ 리뷰 작성 성공:', review.id)

    return NextResponse.json({
      success: true,
      message: '리뷰가 작성되었습니다.',
      review,
    }, { status: 201 })

  } catch (error) {
    console.error('❌ 리뷰 작성 오류:', error)
    return NextResponse.json(
      { error: '리뷰 작성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// GET /api/reviews - 리뷰 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const influencerId = searchParams.get('influencer_id') || searchParams.get('influencerId')
    const campaignId = searchParams.get('campaign_id') || searchParams.get('campaignId')
    const reviewerId = searchParams.get('reviewer_id') || searchParams.get('reviewerId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!influencerId && !campaignId && !reviewerId) {
      return NextResponse.json(
        { error: 'influencerId, campaignId 또는 reviewerId가 필요합니다.' },
        { status: 400 }
      )
    }

    console.log('🔍 리뷰 조회:', { influencerId, campaignId, reviewerId })

    // 쿼리 빌더
    let query = supabaseAdmin
      .from('reviews')
      .select(`
        *,
        reviewer:users!reviews_reviewer_id_fkey(id, name, username, image),
        campaign:campaigns(id, title)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // 필터 적용
    if (influencerId) {
      query = query.eq('influencer_id', influencerId)
    }
    if (campaignId) {
      query = query.eq('campaign_id', campaignId)
    }
    if (reviewerId) {
      query = query.eq('reviewer_id', reviewerId)
    }

    const { data: reviews, error, count } = await query

    if (error) {
      console.error('❌ 리뷰 조회 오류:', error)
      return NextResponse.json(
        { error: '리뷰 조회 중 오류가 발생했습니다.', details: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ 리뷰 ${reviews?.length || 0}개 조회 성공`)

    return NextResponse.json({
      success: true,
      reviews: reviews || [],
      total: count || reviews?.length || 0,
    })

  } catch (error) {
    console.error('❌ 리뷰 조회 오류:', error)
    return NextResponse.json(
      { error: '리뷰 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}