// app/api/influencers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    console.log('🔍 [Influencer API] Fetching profile:', id)

    // ✅ users 테이블에서 인플루언서 정보 조회 - 모든 필요한 필드 포함
    const { data: influencer, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        username,
        name,
        image,
        email,
        bio,
        user_type,
        category,
        follower_count,
        engagement_rate,
        instagram_data,
        instagram_username,
        instagram_handle,
        instagram_verification_status,
        profile_hashtags,
        activity_rate,
        activity_rate_private,
        broad_region,
        narrow_region,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .eq('user_type', 'INFLUENCER')
      .single()

    if (error) {
      console.error('❌ [Influencer API] Query error:', error)
      return NextResponse.json(
        { error: '인플루언서를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    if (!influencer) {
      console.error('❌ [Influencer API] Not found')
      return NextResponse.json(
        { error: '인플루언서를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    console.log('✅ [Influencer API] Profile loaded:', influencer.name)
    console.log('📊 [Influencer API] instagram_data:', influencer.instagram_data)
    console.log('📊 [Influencer API] follower_count:', influencer.follower_count)
    console.log('📊 [Influencer API] engagement_rate:', influencer.engagement_rate)

    // ✅ 응답 데이터 구성 - DB 필드 그대로 전달
    const response = {
      influencer: {
        // 기본 정보
        id: influencer.id,
        name: influencer.name || influencer.username,
        username: influencer.username,
        email: influencer.email,
        image: influencer.image || '/placeholder.svg',
        avatar: influencer.image || '/placeholder.svg', // 호환성
        bio: influencer.bio || '',
        introduction: influencer.bio || '소개가 없습니다.', // 호환성
        
        // ⭐ DB에서 가져온 실제 데이터
        category: influencer.category || '기타',
        follower_count: influencer.follower_count || 0,
        engagement_rate: influencer.engagement_rate || 0,
        instagram_data: influencer.instagram_data || {},
        instagram_username: influencer.instagram_username || '',
        instagram_handle: influencer.instagram_handle || '',
        instagram_verification_status: influencer.instagram_verification_status || 'idle',
        profile_hashtags: influencer.profile_hashtags || [],
        
        // 지역 정보
        broad_region: influencer.broad_region || '서울',
        narrow_region: influencer.narrow_region || '서울',
        region: influencer.narrow_region || influencer.broad_region || '서울', // 호환성
        
        // 활동 단가
        activity_rate: influencer.activity_rate || '협의 후 결정',
        activityPrice: influencer.activity_rate || '협의 후 결정', // 호환성
        activity_rate_private: influencer.activity_rate_private || false,
        activity_regions: [influencer.narrow_region || influencer.broad_region || '서울'], // 호환성
        activityRegion: [influencer.narrow_region || influencer.broad_region || '서울'], // 호환성
        
        // 인증 상태
        verified: influencer.instagram_verification_status === 'verified',
        
        // 해시태그 (호환성)
        hashtags: influencer.profile_hashtags || [],
        
        // 포트폴리오 이미지 (추후 추가 가능)
        portfolio_images: [],
        additionalPhotos: [], // 호환성
        
        // 메타 정보
        created_at: influencer.created_at,
        updated_at: influencer.updated_at,
      }
    }

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('❌ [Influencer API] Server error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다', details: error.message },
      { status: 500 }
    )
  }
}