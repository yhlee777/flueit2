import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/reviews/[id] - 특정 리뷰 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    console.log('🔍 리뷰 상세 조회:', id)

    const { data: review, error } = await supabaseAdmin
      .from('reviews')
      .select(`
        *,
        reviewer:users!reviews_reviewer_id_fkey(id, name, username, image),
        influencer:users!reviews_influencer_id_fkey(id, name, username, image),
        campaign:campaigns(id, title)
      `)
      .eq('id', id)
      .single()

    if (error || !review) {
      return NextResponse.json(
        { error: '리뷰를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    console.log('✅ 리뷰 조회 성공:', review.id)

    return NextResponse.json({
      success: true,
      review,
    })

  } catch (error) {
    console.error('❌ 리뷰 조회 오류:', error)
    return NextResponse.json(
      { error: '리뷰 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH /api/reviews/[id] - 리뷰 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()

    console.log('🔍 리뷰 수정 시도:', { reviewId: id, userId: session.user.id })

    // 리뷰 소유자 확인
    const { data: review, error: fetchError } = await supabaseAdmin
      .from('reviews')
      .select('reviewer_id, influencer_id')
      .eq('id', id)
      .single()

    if (fetchError || !review) {
      return NextResponse.json(
        { error: '리뷰를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (review.reviewer_id !== session.user.id) {
      return NextResponse.json(
        { error: '리뷰 수정 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 수정 데이터 준비
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (body.rating !== undefined) {
      if (body.rating < 1 || body.rating > 5) {
        return NextResponse.json(
          { error: '평점은 1~5 사이여야 합니다.' },
          { status: 400 }
        )
      }
      updateData.rating = body.rating
    }
    if (body.content !== undefined) updateData.content = body.content
    if (body.tags !== undefined) updateData.tags = body.tags

    // ✅ 리뷰 수정
    const { data: updatedReview, error: updateError } = await supabaseAdmin
      .from('reviews')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ 리뷰 수정 오류:', updateError)
      return NextResponse.json(
        { error: '리뷰 수정 중 오류가 발생했습니다.', details: updateError.message },
        { status: 500 }
      )
    }

    // ✅ 평점이 변경된 경우 평균 평점 재계산
    if (body.rating !== undefined) {
      const { data: allReviews } = await supabaseAdmin
        .from('reviews')
        .select('rating')
        .eq('influencer_id', review.influencer_id)

      if (allReviews && allReviews.length > 0) {
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        
        await supabaseAdmin
          .from('users')
          .update({ 
            average_rating: avgRating,
            updated_at: new Date().toISOString(),
          })
          .eq('id', review.influencer_id)
      }
    }

    console.log('✅ 리뷰 수정 성공:', id)

    return NextResponse.json({
      success: true,
      message: '리뷰가 수정되었습니다.',
      review: updatedReview,
    })

  } catch (error) {
    console.error('❌ 리뷰 수정 오류:', error)
    return NextResponse.json(
      { error: '리뷰 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/reviews/[id] - 리뷰 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { id } = params

    console.log('🔍 리뷰 삭제 시도:', { reviewId: id, userId: session.user.id })

    // 리뷰 소유자 확인
    const { data: review, error: fetchError } = await supabaseAdmin
      .from('reviews')
      .select('reviewer_id, influencer_id')
      .eq('id', id)
      .single()

    if (fetchError || !review) {
      return NextResponse.json(
        { error: '리뷰를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (review.reviewer_id !== session.user.id) {
      return NextResponse.json(
        { error: '리뷰 삭제 권한이 없습니다.' },
        { status: 403 }
      )
    }

    // ✅ 리뷰 삭제
    const { error: deleteError } = await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('❌ 리뷰 삭제 오류:', deleteError)
      return NextResponse.json(
        { error: '리뷰 삭제 중 오류가 발생했습니다.', details: deleteError.message },
        { status: 500 }
      )
    }

    // ✅ 평균 평점 재계산
    const { data: allReviews } = await supabaseAdmin
      .from('reviews')
      .select('rating')
      .eq('influencer_id', review.influencer_id)

    const avgRating = allReviews && allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0

    await supabaseAdmin
      .from('users')
      .update({ 
        average_rating: avgRating,
        total_reviews: allReviews?.length || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', review.influencer_id)

    console.log('✅ 리뷰 삭제 성공:', id)

    return NextResponse.json({
      success: true,
      message: '리뷰가 삭제되었습니다.',
    })

  } catch (error) {
    console.error('❌ 리뷰 삭제 오류:', error)
    return NextResponse.json(
      { error: '리뷰 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}