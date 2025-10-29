import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/reviews/stats/[influencerId] - 인플루언서 리뷰 통계
export async function GET(
  request: NextRequest,
  { params }: { params: { influencerId: string } }
) {
  try {
    const { influencerId } = params

    console.log('🔍 리뷰 통계 조회:', influencerId)

    // 모든 리뷰 조회
    const { data: reviews, error } = await supabaseAdmin
      .from('reviews')
      .select('rating, tags')
      .eq('influencer_id', influencerId)

    if (error) {
      console.error('❌ 리뷰 통계 조회 오류:', error)
      return NextResponse.json(
        { error: '리뷰 통계 조회 중 오류가 발생했습니다.', details: error.message },
        { status: 500 }
      )
    }

    const totalReviews = reviews?.length || 0

    if (totalReviews === 0) {
      return NextResponse.json({
        success: true,
        stats: {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
          },
          topTags: [],
        },
      })
    }

    // 평균 평점 계산
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews

    // 평점 분포 계산
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    }

    // 태그 집계
    const tagCounts: Record<string, number> = {}
    reviews.forEach(review => {
      if (review.tags && Array.isArray(review.tags)) {
        review.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }
    })

    // 상위 태그 추출
    const topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    console.log('✅ 리뷰 통계 조회 성공')

    return NextResponse.json({
      success: true,
      stats: {
        totalReviews,
        averageRating: Number(averageRating.toFixed(1)),
        ratingDistribution,
        topTags,
      },
    })

  } catch (error) {
    console.error('❌ 리뷰 통계 조회 오류:', error)
    return NextResponse.json(
      { error: '리뷰 통계 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}