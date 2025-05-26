import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Set CORS and JSON headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // Handle OPTIONS request for CORS
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { headers });
  }

  // Only check /api/cms routes
  if (!request.nextUrl.pathname.startsWith('/api/cms')) {
    return NextResponse.next();
  }

  // Check for Authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new NextResponse(
      JSON.stringify({ error: 'Missing or invalid authorization header' }),
      { status: 401, headers }
    );
  }

  // Add the token to a header that our API routes can use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('X-Auth-Token', authHeader.split('Bearer ')[1]);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Configure which routes are handled by this middleware
export const config = {
  matcher: [
    '/api/cms/:path*',  // Protect all CMS API routes
  ]
}; 