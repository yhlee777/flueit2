// app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

// GET - 프로필 정보 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    // 사용자 프로필 조회
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (error) {
      console.error('❌ 프로필 조회 오류:', error)
      return NextResponse.json(
        { error: '프로필을 불러오는데 실패했습니다.' },
        { status: 500 }
      )
    }

    console.log('✅ 프로필 조회 성공:', session.user.id)

    return NextResponse.json({
      success: true,
      profile,
    })

  } catch (error) {
    console.error('❌ API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// PATCH - 프로필 정보 업데이트
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      // 공통
      name,
      username,
      image,
      image_position_x,
      image_position_y,
      image_scale,
      user_type,
      
      // 인플루언서
      category,
      instagram_username,
      bio,
      activity_rate,
      activity_rate_private,
      broad_region,
      narrow_region,
      career,
      profile_hashtags,
      
      // 광고주
      brand_category,
      store_type,
      brand_name,
      brand_link,
      business_number,
      offline_location,
      online_domain,
    } = body

    console.log('💾 프로필 저장 요청:', session.user.id)

    // 업데이트할 데이터 구성
    const updateData: any = {}

    // 공통 필드
    if (name !== undefined) updateData.name = name
    if (username !== undefined) updateData.username = username
    if (image !== undefined) updateData.image = image
    if (image_position_x !== undefined) updateData.image_position_x = image_position_x
    if (image_position_y !== undefined) updateData.image_position_y = image_position_y
    if (image_scale !== undefined) updateData.image_scale = image_scale
    if (user_type !== undefined) updateData.user_type = user_type

    // 인플루언서 필드
    if (category !== undefined) updateData.category = category
    if (instagram_username !== undefined) updateData.instagram_username = instagram_username
    if (bio !== undefined) updateData.bio = bio
    if (activity_rate !== undefined) updateData.activity_rate = activity_rate
    if (activity_rate_private !== undefined) updateData.activity_rate_private = activity_rate_private
    if (broad_region !== undefined) updateData.broad_region = broad_region
    if (narrow_region !== undefined) updateData.narrow_region = narrow_region
    if (career !== undefined) updateData.career = career
    if (profile_hashtags !== undefined) updateData.profile_hashtags = profile_hashtags

    // 광고주 필드
    if (brand_category !== undefined) updateData.brand_category = brand_category
    if (store_type !== undefined) updateData.store_type = store_type
    if (brand_name !== undefined) updateData.brand_name = brand_name
    if (brand_link !== undefined) updateData.brand_link = brand_link
    if (business_number !== undefined) updateData.business_number = business_number
    if (offline_location !== undefined) updateData.offline_location = offline_location
    if (online_domain !== undefined) updateData.online_domain = online_domain

    // 업데이트 시각
    updateData.updated_at = new Date().toISOString()

    // DB 업데이트
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error('❌ 프로필 저장 오류:', error)
      return NextResponse.json(
        { error: '프로필을 저장하는데 실패했습니다.' },
        { status: 500 }
      )
    }

    console.log('✅ 프로필 저장 성공:', session.user.id)

    return NextResponse.json({
      success: true,
      profile: data,
      message: '프로필이 저장되었습니다.',
    })

  } catch (error) {
    console.error('❌ API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}