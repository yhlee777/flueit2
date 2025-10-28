// app/api/campaigns/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/campaigns/[id] - 캠페인 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // 캠페인 조회
    const { data: campaign, error } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !campaign) {
      return NextResponse.json(
        { error: '캠페인을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // ✅ 조회수 증가 (비동기로 처리, void 연산자 사용)
    // 조회수 증가 (비동기로 처리, await 없이)
const incrementViews = async () => {
  try {
    await supabaseAdmin
      .from('campaigns')
      .update({ views: (campaign.views || 0) + 1 })
      .eq('id', id)
    console.log(`✅ 캠페인 ${id} 조회수 증가`)
  } catch (err) {
    console.error('❌ 조회수 증가 오류:', err)
  }
}
incrementViews() // await 없이 호출 - 백그라운드에서 실행

    // 신청자 정보 조회 (선택사항)
    const { data: applications } = await supabaseAdmin
      .from('campaign_applications')
      .select('id, influencer_id, status, message, created_at')
      .eq('campaign_id', id)
      .order('created_at', { ascending: false })

    console.log(`✅ 캠페인 ${id} 조회 성공`)

    return NextResponse.json({
      success: true,
      campaign: {
        ...campaign,
        views: (campaign.views || 0) + 1, // 증가된 조회수 반영
      },
      applications: applications || [],
    })
  } catch (error) {
    console.error('❌ 캠페인 조회 오류:', error)
    return NextResponse.json(
      { error: '캠페인 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH /api/campaigns/[id] - 캠페인 수정
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

    console.log('🔍 캠페인 수정 시도:', { id, updates: Object.keys(body) })

    // 캠페인 소유자 확인
    const { data: campaign, error: fetchError } = await supabaseAdmin
      .from('campaigns')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !campaign) {
      return NextResponse.json(
        { error: '캠페인을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (campaign.user_id !== session.user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    // ✅ 수정 데이터 준비 (camelCase와 snake_case 둘 다 지원)
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    // 기본 정보
    if (body.title !== undefined) updateData.title = body.title
    if (body.category !== undefined) updateData.category = body.category
    if (body.status !== undefined) updateData.status = body.status
    
    // 모집 정보
    if (body.recruitType !== undefined) updateData.recruit_type = body.recruitType
    if (body.recruit_type !== undefined) updateData.recruit_type = body.recruit_type
    if (body.recruitCount !== undefined) updateData.recruit_count = body.recruitCount
    if (body.recruit_count !== undefined) updateData.recruit_count = body.recruit_count
    
    // 방문 유형
    if (body.visitType !== undefined) updateData.visit_type = body.visitType
    if (body.visit_type !== undefined) updateData.visit_type = body.visit_type
    
    // 리워드 정보
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
    
    // 협상 옵션
    if (body.isDealPossible !== undefined) updateData.is_deal_possible = body.isDealPossible
    if (body.is_deal_possible !== undefined) updateData.is_deal_possible = body.is_deal_possible
    if (body.negotiationOption !== undefined) updateData.negotiation_option = body.negotiationOption
    if (body.negotiation_option !== undefined) updateData.negotiation_option = body.negotiation_option
    
    // 콘텐츠 정보
    if (body.contentType !== undefined) updateData.content_type = body.contentType
    if (body.content_type !== undefined) updateData.content_type = body.content_type
    if (body.videoDuration !== undefined) updateData.video_duration = body.videoDuration
    if (body.video_duration !== undefined) updateData.video_duration = body.video_duration
    if (body.requiredContent !== undefined) updateData.required_content = body.requiredContent
    if (body.required_content !== undefined) updateData.required_content = body.required_content
    if (body.requiredScenes !== undefined) updateData.required_scenes = body.requiredScenes
    if (body.required_scenes !== undefined) updateData.required_scenes = body.required_scenes
    
    // 메타 정보
    if (body.hashtags !== undefined) updateData.hashtags = body.hashtags
    if (body.linkUrl !== undefined) updateData.link_url = body.linkUrl
    if (body.link_url !== undefined) updateData.link_url = body.link_url
    if (body.additionalMemo !== undefined) updateData.additional_memo = body.additionalMemo
    if (body.additional_memo !== undefined) updateData.additional_memo = body.additional_memo
    if (body.uploadedPhotos !== undefined) updateData.uploaded_photos = body.uploadedPhotos
    if (body.uploaded_photos !== undefined) updateData.uploaded_photos = body.uploaded_photos
    if (body.thumbnail !== undefined) updateData.thumbnail = body.thumbnail

    console.log('📤 DB 업데이트 데이터:', updateData)

    // 캠페인 수정
    const { data: updatedCampaign, error: updateError } = await supabaseAdmin
      .from('campaigns')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ 캠페인 수정 오류:', updateError)
      return NextResponse.json(
        { error: '캠페인 수정에 실패했습니다.', details: updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ 캠페인 수정 성공:', id)

    return NextResponse.json({
      success: true,
      message: '캠페인이 수정되었습니다.',
      campaign: updatedCampaign,
    })
  } catch (error) {
    console.error('❌ 캠페인 수정 오류:', error)
    return NextResponse.json(
      { error: '캠페인 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// DELETE /api/campaigns/[id] - 캠페인 삭제
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

    console.log('🔍 캠페인 삭제 시도:', id)

    // 캠페인 소유자 확인
    const { data: campaign, error: fetchError } = await supabaseAdmin
      .from('campaigns')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !campaign) {
      return NextResponse.json(
        { error: '캠페인을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (campaign.user_id !== session.user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 관련 신청 정보도 함께 삭제 (CASCADE가 설정되어 있지 않은 경우)
    await supabaseAdmin
      .from('campaign_applications')
      .delete()
      .eq('campaign_id', id)

    // 캠페인 삭제
    const { error: deleteError } = await supabaseAdmin
      .from('campaigns')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('❌ 캠페인 삭제 오류:', deleteError)
      return NextResponse.json(
        { error: '캠페인 삭제에 실패했습니다.', details: deleteError.message },
        { status: 500 }
      )
    }

    console.log('✅ 캠페인 삭제 성공:', id)

    return NextResponse.json({
      success: true,
      message: '캠페인이 삭제되었습니다.',
    })
  } catch (error) {
    console.error('❌ 캠페인 삭제 오류:', error)
    return NextResponse.json(
      { error: '캠페인 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PUT /api/campaigns/[id]/status - 캠페인 상태 변경 전용
export async function PUT(
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
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json(
        { error: '상태 값이 필요합니다.' },
        { status: 400 }
      )
    }

    // 유효한 상태 값 확인
    const validStatuses = ['구인 진행 중', '구인 마감', '비공개 글']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: '유효하지 않은 상태 값입니다.' },
        { status: 400 }
      )
    }

    // 캠페인 소유자 확인
    const { data: campaign, error: fetchError } = await supabaseAdmin
      .from('campaigns')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError || !campaign) {
      return NextResponse.json(
        { error: '캠페인을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (campaign.user_id !== session.user.id) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      )
    }

    // 상태 업데이트
    const { data: updatedCampaign, error: updateError } = await supabaseAdmin
      .from('campaigns')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ 상태 변경 오류:', updateError)
      return NextResponse.json(
        { error: '상태 변경에 실패했습니다.' },
        { status: 500 }
      )
    }

    console.log(`✅ 캠페인 ${id} 상태 변경: ${status}`)

    return NextResponse.json({
      success: true,
      message: '캠페인 상태가 변경되었습니다.',
      campaign: updatedCampaign,
    })
  } catch (error) {
    console.error('❌ 상태 변경 오류:', error)
    return NextResponse.json(
      { error: '상태 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}