import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const groom = searchParams.get('groom') || 'Văn Minh';
  const bride = searchParams.get('bride') || 'Minh An';
  const date = searchParams.get('date') || '23.05.2026';
  const venue = searchParams.get('venue') || 'LoveStory Wedding & Events';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF7F2',
          backgroundImage: 'radial-gradient(circle at 25px 25px, #E8DFC8 2%, transparent 0%)',
          backgroundSize: '50px 50px',
          border: '16px solid #9c5a1a',
          padding: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '48px 64px',
            boxShadow: '0 20px 40px rgba(156, 90, 26, 0.15)',
            border: '2px solid #E8DFC8',
          }}
        >
          <span
            style={{
              fontSize: '20px',
              textTransform: 'uppercase',
              letterSpacing: '8px',
              color: '#9c5a1a',
              marginBottom: '16px',
              fontWeight: 700,
            }}
          >
            💍 WEDDING INVITATION
          </span>

          <h1
            style={{
              fontSize: '64px',
              fontWeight: 700,
              color: '#2C2222',
              margin: '0',
              textAlign: 'center',
            }}
          >
            {groom} <span style={{ color: '#E05D5D', fontStyle: 'italic', margin: '0 16px' }}>&amp;</span> {bride}
          </h1>

          <div
            style={{
              width: '120px',
              height: '3px',
              backgroundColor: '#9c5a1a',
              margin: '24px 0',
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              fontSize: '28px',
              color: '#5C5248',
              fontWeight: 600,
            }}
          >
            <span>{date}</span>
            <span>•</span>
            <span>{venue}</span>
          </div>

          <span
            style={{
              marginTop: '20px',
              fontSize: '16px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#9c5a1a',
            }}
          >
            Trân trọng kính mời quý khách tới chung vui
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
