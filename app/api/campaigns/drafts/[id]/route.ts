import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/campaigns/drafts/[id] - 특정 임시저장 조회
export async function GET(
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

    const { data: draft, error } = await supabaseAdmin
      .from('campaign_drafts')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !draft) {
      return NextResponse.json(
        { error: '임시저장을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 본인 확인
    if (draft.user_id !== session.user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      draft,
    })

  } catch (error) {
    console.error('❌ 임시저장 조회 오류:', error)
    return NextResponse.json(
      { error: '임시저장 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH /api/campaigns/drafts/[id] - 임시저장 수정
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

    // 소유자 확인
    const { data: draft, error: fetchError } = await supabaseAdmin
      .from('campaign_drafts')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !draft) {
      return NextResponse.json(
        { error: '임시저장을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (draft.user_id !== session.user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 수정 데이터 준비
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    // 필드 업데이트
    if (body.title !== undefined) updateData.title = body.title
    if (body.category !== undefined) updateData.category = body.category
    if (body.recruitType !== undefined) updateData.recruit_type = body.recruitType
    if (body.recruit_type !== undefined) updateData.recruit_type = body.recruit_type
    if (body.recruitCount !== undefined) updateData.recruit_count = body.recruitCount
    if (body.recruit_count !== undefined) updateData.recruit_count = body.recruit_count
    if (body.visitType !== undefined) updateData.visit_type = body.visitType
    if (body.visit_type !== undefined) updateData.visit_type = body.visit_type
    if (body.rewardType !== undefined) updateData.reward_type = body.rewardType
    if (body.reward_type !== undefined) updateData.reward_type = body.reward_type
    if (body.paymentAmount !== undefined) updateData.payment_amount = body.paymentAmount
    if (body.payment_amount !== undefined) updateData.payment_amount = body.payment_amount
    if (body.productName !== undefined) updateData.product_name = body.productName
    if (body.product_name !== undefined) updateData.product_name = body.product_name
    if (body.otherReward !== undefined) updateData.other_reward = body.otherReward
    if (body.other_reward !== undefined) updateData.other_reward = body.other_reward
    if (body.additionalRewardInfo !== undefined) updateData.additional_reward_info = body.additionalRewardInfo
    if (body.additional_reward_info !== undefined) updateData.additional_reward_info = body.additional_reward_info
    if (body.isDealPossible !== undefined) updateData.is_deal_possible = body.isDealPossible
    if (body.is_deal_possible !== undefined) updateData.is_deal_possible = body.is_deal_possible
    if (body.negotiationOption !== undefined) updateData.negotiation_option = body.negotiationOption
    if (body.negotiation_option !== undefined) updateData.negotiation_option = body.negotiation_option
    if (body.contentType !== undefined) updateData.content_type = body.contentType
    if (body.content_type !== undefined) updateData.content_type = body.content_type
    if (body.videoDuration !== undefined) updateData.video_duration = body.videoDuration
    if (body.video_duration !== undefined) updateData.video_duration = body.video_duration
    if (body.requiredContent !== undefined) updateData.required_content = body.requiredContent
    if (body.required_content !== undefined) updateData.required_content = body.required_content
    if (body.requiredScenes !== undefined) updateData.required_scenes = body.requiredScenes
    if (body.required_scenes !== undefined) updateData.required_scenes = body.required_scenes
    if (body.hashtags !== undefined) updateData.hashtags = body.hashtags
    if (body.linkUrl !== undefined) updateData.link_url = body.linkUrl
    if (body.link_url !== undefined) updateData.link_url = body.link_url
    if (body.additionalMemo !== undefined) updateData.additional_memo = body.additionalMemo
    if (body.additional_memo !== undefined) updateData.additional_memo = body.additional_memo
    if (body.uploadedPhotos !== undefined) updateData.uploaded_photos = body.uploadedPhotos
    if (body.uploaded_photos !== undefined) updateData.uploaded_photos = body.uploaded_photos
    if (body.images !== undefined) updateData.uploaded_photos = body.images
    if (body.thumbnail !== undefined) updateData.thumbnail = body.thumbnail

    // 임시저장 수정
    const { data: updatedDraft, error: updateError } = await supabaseAdmin
      .from('campaign_drafts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ 임시저장 수정 오류:', updateError)
      return NextResponse.json(
        { error: '임시저장 수정에 실패했습니다.', details: updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ 임시저장 수정 성공:', id)

    return NextResponse.json({
      success: true,
      message: '임시저장이 수정되었습니다.',
      draft: updatedDraft,
    })

  } catch (error) {
    console.error('❌ 임시저장 수정 오류:', error)
    return NextResponse.json(
      { error: '임시저장 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/campaigns/drafts/[id] - 임시저장 삭제
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

    // 소유자 확인
    const { data: draft, error: fetchError } = await supabaseAdmin
      .from('campaign_drafts')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !draft) {
      return NextResponse.json(
        { error: '임시저장을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (draft.user_id !== session.user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 임시저장 삭제
    const { error: deleteError } = await supabaseAdmin
      .from('campaign_drafts')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('❌ 임시저장 삭제 오류:', deleteError)
      return NextResponse.json(
        { error: '임시저장 삭제에 실패했습니다.', details: deleteError.message },
        { status: 500 }
      )
    }

    console.log('✅ 임시저장 삭제 성공:', id)

    return NextResponse.json({
      success: true,
      message: '임시저장이 삭제되었습니다.',
    })

  } catch (error) {
    console.error('❌ 임시저장 삭제 오류:', error)
    return NextResponse.json(
      { error: '임시저장 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}