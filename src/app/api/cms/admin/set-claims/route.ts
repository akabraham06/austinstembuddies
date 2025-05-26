import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { uid, isAdmin } = await request.json();

    if (!uid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Set custom claims
    await adminAuth.setCustomUserClaims(uid, { admin: isAdmin });

    // Force token refresh
    try {
      await adminAuth.revokeRefreshTokens(uid);
    } catch (error) {
      console.error('Error revoking refresh tokens:', error);
      // Continue even if token revocation fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting admin claims:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to set admin claims'
    }, { status: 500 });
  }
} 