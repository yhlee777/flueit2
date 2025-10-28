import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/profile/advertiser - 광고주 프로필 조회
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
      .from('advertiser_profiles')
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

// POST /api/profile/advertiser - 광고주 프로필 생성
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
      businessNumber,
      brandCategory,
      storeType,
      brandName,
      brandLink,
      offlineLocation,
      broadRegion,
      narrowRegion,
    } = body

    // 이미 프로필이 있는지 확인
    const { data: existingProfile } = await supabaseAdmin
      .from('advertiser_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { error: '이미 프로필이 존재합니다. PATCH 메서드를 사용해주세요.' },
        { status: 400 }
      )
    }

    // 사업자번호 중복 확인 (선택사항)
    if (businessNumber) {
      const { data: duplicateBusiness } = await supabaseAdmin
        .from('advertiser_profiles')
        .select('id')
        .eq('business_number', businessNumber)
        .single()

      if (duplicateBusiness) {
        return NextResponse.json(
          { error: '이미 등록된 사업자번호입니다.' },
          { status: 400 }
        )
      }
    }

    // 프로필 생성
    const { data: profile, error } = await supabaseAdmin
      .from('advertiser_profiles')
      .insert({
        user_id: session.user.id,
        business_number: businessNumber,
        brand_category: brandCategory,
        store_type: storeType,
        brand_name: brandName,
        brand_link: brandLink,
        offline_location: offlineLocation,
        broad_region: broadRegion,
        narrow_region: narrowRegion,
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

// PATCH /api/profile/advertiser - 광고주 프로필 수정
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
    if (body.businessNumber) updateData.business_number = body.businessNumber
    if (body.brandCategory) updateData.brand_category = body.brandCategory
    if (body.storeType) updateData.store_type = body.storeType
    if (body.brandName) updateData.brand_name = body.brandName
    if (body.brandLink) updateData.brand_link = body.brandLink
    if (body.offlineLocation) updateData.offline_location = body.offlineLocation
    if (body.broadRegion) updateData.broad_region = body.broadRegion
    if (body.narrowRegion) updateData.narrow_region = body.narrowRegion

    // 사업자번호 중복 확인 (변경하려는 경우)
    if (body.businessNumber) {
      const { data: duplicateBusiness } = await supabaseAdmin
        .from('advertiser_profiles')
        .select('id, user_id')
        .eq('business_number', body.businessNumber)
        .single()

      if (duplicateBusiness && duplicateBusiness.user_id !== session.user.id) {
        return NextResponse.json(
          { error: '이미 등록된 사업자번호입니다.' },
          { status: 400 }
        )
      }
    }

    // 프로필 존재 여부 확인
    const { data: existingProfile } = await supabaseAdmin
      .from('advertiser_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    let profile
    let error

    if (existingProfile) {
      // 기존 프로필 수정
      const result = await supabaseAdmin
        .from('advertiser_profiles')
        .update(updateData)
        .eq('user_id', session.user.id)
        .select()
        .single()
      
      profile = result.data
      error = result.error
    } else {
      // 프로필 생성 (upsert)
      const result = await supabaseAdmin
        .from('advertiser_profiles')
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