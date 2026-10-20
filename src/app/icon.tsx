import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#dc2626', // Le rouge de notre charte (red-600)
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px',
          color: 'white',
          fontWeight: 800,
          fontSize: '16px',
          fontFamily: 'sans-serif',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      >
        A
      </div>
    ),
    { ...size }
  );
}