import { ImageResponse } from 'next/og';
import { BRAND_COLOR } from '@/lib/constants/site';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
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
          fontSize: 20,
        }}
      >
        B
      </div>
    ),
    size,
  );
}
