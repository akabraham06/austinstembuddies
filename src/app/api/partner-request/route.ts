import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET() {
  try {
    const snapshot = await adminDb.collection('partnerRequests')
      .orderBy('createdAt', 'desc')
      .get();

    const requests = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(requests);
  } catch (error) {
    console.error('[API] Error fetching partner requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partner requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['schoolName', 'district', 'address', 'contactName', 'position', 'email', 'gradeLevel', 'studentCount', 'schedule'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Add additional fields
    const partnerRequest = {
      ...data,
      status: 'pending',
      createdAt: Timestamp.now(),
    };

    // Add to Firestore
    const docRef = await adminDb.collection('partnerRequests').add(partnerRequest);

    return NextResponse.json({
      id: docRef.id,
      ...partnerRequest
    });
  } catch (error) {
    console.error('[API] Error creating partner request:', error);
    return NextResponse.json(
      { error: 'Failed to create partner request' },
      { status: 500 }
    );
  }
} 