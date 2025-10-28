import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/profile/influencer - 인플루언서 프로필 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { data: profile, error } = await supabaseAdmin
      .from('influencer_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('프로필 조회 오류:', error)
      return NextResponse.json(
        { error: '프로필 조회에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile: profile || null,
    })
  } catch (error) {
    console.error('프로필 조회 오류:', error)
    return NextResponse.json(
      { error: '프로필 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST /api/profile/influencer - 인플루언서 프로필 생성
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
    const {
      category,
      bio,
      profileImage,
      instagramId,
      instagramVerified,
      followersCount,
      engagementRate,
      activityRate,
      broadRegion,
      narrowRegion,
      career,
      hashtags,
      portfolioFiles,
      proposalText,
    } = body

    // 이미 프로필이 있는지 확인
    const { data: existingProfile } = await supabaseAdmin
      .from('influencer_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { error: '이미 프로필이 존재합니다. PATCH 메서드를 사용해주세요.' },
        { status: 400 }
      )
    }

    // 프로필 생성
    const { data: profile, error } = await supabaseAdmin
      .from('influencer_profiles')
      .insert({
        user_id: session.user.id,
        category,
        bio,
        profile_image: profileImage,
        instagram_id: instagramId,
        instagram_verified: instagramVerified || false,
        followers_count: followersCount,
        engagement_rate: engagementRate,
        activity_rate: activityRate,
        broad_region: broadRegion,
        narrow_region: narrowRegion,
        career,
        hashtags: hashtags || [],
        portfolio_files: portfolioFiles || [],
        proposal_text: proposalText,
      })
      .select()
      .single()

    if (error) {
      console.error('프로필 생성 오류:', error)
      return NextResponse.json(
        { error: '프로필 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '프로필이 생성되었습니다.',
      profile,
    }, { status: 201 })

  } catch (error) {
    console.error('프로필 생성 오류:', error)
    return NextResponse.json(
      { error: '프로필 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH /api/profile/influencer - 인플루언서 프로필 수정
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // 수정할 데이터 준비
    const updateData: any = {
      ...body,
      updated_at: new Date().toISOString(),
    }

    // camelCase를 snake_case로 변환
    if (body.profileImage) updateData.profile_image = body.profileImage
    if (body.instagramId) updateData.instagram_id = body.instagramId
    if (body.instagramVerified !== undefined) updateData.instagram_verified = body.instagramVerified
    if (body.followersCount !== undefined) updateData.followers_count = body.followersCount
    if (body.engagementRate !== undefined) updateData.engagement_rate = body.engagementRate
    if (body.activityRate) updateData.activity_rate = body.activityRate
    if (body.broadRegion) updateData.broad_region = body.broadRegion
    if (body.narrowRegion) updateData.narrow_region = body.narrowRegion
    if (body.portfolioFiles) updateData.portfolio_files = body.portfolioFiles
    if (body.proposalText) updateData.proposal_text = body.proposalText

    // 프로필 존재 여부 확인
    const { data: existingProfile } = await supabaseAdmin
      .from('influencer_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    let profile
    let error

    if (existingProfile) {
      // 기존 프로필 수정
      const result = await supabaseAdmin
        .from('influencer_profiles')
        .update(updateData)
        .eq('user_id', session.user.id)
        .select()
        .single()
      
      profile = result.data
      error = result.error
    } else {
      // 프로필 생성 (upsert)
      const result = await supabaseAdmin
        .from('influencer_profiles')
        .insert({
          user_id: session.user.id,
          ...updateData,
        })
        .select()
        .single()
      
      profile = result.data
      error = result.error
    }

    if (error) {
      console.error('프로필 저장 오류:', error)
      return NextResponse.json(
        { error: '프로필 저장에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '프로필이 저장되었습니다.',
      profile,
    })
  } catch (error) {
    console.error('프로필 저장 오류:', error)
    return NextResponse.json(
      { error: '프로필 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}