import { ImageResponse } from 'next/og';
import { BRAND_COLOR } from '@/lib/constants/site';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
          fontSize: 110,
        }}
      >
        B
      </div>
    ),
    size,
  );
}
