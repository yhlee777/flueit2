import { NextRequest, NextResponse } from 'next/server';

// 이 API는 관리자가 인플루언서의 인스타그램 인증을 승인할 때 사용됩니다
export async function PATCH(request: NextRequest) {
  try {
    const { userId, status } = await request.json();

    if (!userId || !status) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    if (!['verified', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: '유효하지 않은 상태값입니다.' },
        { status: 400 }
      );
    }

    // TODO: 실제 데이터베이스 업데이트
    // 예시:
    // await db.users.update({
    //   where: { id: userId },
    //   data: {
    //     instagramVerificationStatus: status,
    //     instagramVerifiedAt: status === 'verified' ? new Date() : null,
    //   }
    // });

    return NextResponse.json({
      success: true,
      message: status === 'verified' ? '인증이 승인되었습니다.' : '인증이 거절되었습니다.',
    });

  } catch (error) {
    console.error('Update verification status error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 인플루언서의 인증 상태를 조회하는 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId가 필요합니다.' },
        { status: 400 }
      );
    }

    // TODO: 실제 데이터베이스에서 조회
    // 예시:
    // const user = await db.users.findUnique({
    //   where: { id: userId },
    //   select: {
    //     instagramVerificationStatus: true,
    //     instagramData: true,
    //   }
    // });

    // Mock data
    const mockData = {
      status: 'pending',
      instagramData: null,
    };

    return NextResponse.json(mockData);

  } catch (error) {
    console.error('Get verification status error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}