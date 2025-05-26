import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-helpers';
import { setUserAsAdmin } from '@/lib/admin-utils';

const headers = {
  'Content-Type': 'application/json'
};

export async function POST(request: Request) {
  try {
    // First verify the requester is an admin
    const user = await verifyAuth(request as any);
    if (!user.isAdmin) {
      return new NextResponse(
        JSON.stringify({ error: 'Only existing admins can set admin claims' }),
        { status: 403, headers }
      );
    }

    // Get the target user ID from the request body
    const { targetUid } = await request.json();
    if (!targetUid) {
      return new NextResponse(
        JSON.stringify({ error: 'Target user ID is required' }),
        { status: 400, headers }
      );
    }

    // Set the admin claim
    await setUserAsAdmin(targetUid);

    return new NextResponse(
      JSON.stringify({ success: true, message: 'Admin claim set successfully' }),
      { headers }
    );
  } catch (error) {
    console.error('Error in set-admin route:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to set admin claim',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers }
    );
  }
} 