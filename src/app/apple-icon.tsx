
import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

// Image generation
export default function AppleIcon() {
  return new ImageResponse(
    (
       <div
        style={{
          background: '#0A0A0A', // Matches the app's dark background
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '36px', // Apple icons are often rounded
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="80" height="80">
          <rect x="10" y="35" width="20" height="30" rx="5" fill="#CCCCCC" />
          <rect x="70" y="35" width="20" height="30" rx="5" fill="#CCCCCC" />
          <rect x="30" y="45" width="40" height="10" fill="#CCCCCC" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
