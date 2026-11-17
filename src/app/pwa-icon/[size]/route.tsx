import { ImageResponse } from 'next/og';
import { BRAND_COLOR } from '@/lib/constants/site';

/** manifest.ts의 icons 배열이 참조하는 PWA 홈 화면 아이콘 (192/512만 지원). */
const VALID_SIZES = [192, 512];

export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const dimension = Number(size);

  if (!VALID_SIZES.includes(dimension)) {
    return new Response('Not Found', { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: BRAND_COLOR,
          color: 'white',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontWeight: 700,
          fontSize: dimension * 0.55,
        }}
      >
        B
      </div>
    ),
    { width: dimension, height: dimension },
  );
}
