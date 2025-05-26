import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { action } = await request.json();
    const requestId = params.id;

    console.log('[API] Processing partner request action:', {
      action,
      requestId,
    });

    // First check if the request exists
    const requestDoc = await adminDb.collection('partnerRequests').doc(requestId).get();
    if (!requestDoc.exists) {
      console.error('[API] Partner request not found:', requestId);
      return NextResponse.json({ error: 'Partner request not found' }, { status: 404 });
    }

    const requestData = requestDoc.data();
    if (!requestData) {
      console.error('[API] Invalid partner request data:', requestId);
      return NextResponse.json({ error: 'Invalid partner request data' }, { status: 400 });
    }

    if (action === 'accept') {
      console.log('[API] Accepting partner request:', {
        requestId,
        currentStatus: requestData.status,
        schoolName: requestData.schoolName
      });

      try {
        // Add to partners collection
        const partnerRef = await adminDb.collection('partners').add({
          schoolName: requestData.schoolName,
          website: requestData.website || null,
          district: requestData.district,
          address: requestData.address,
          contactName: requestData.contactName,
          email: requestData.email,
          gradeLevel: requestData.gradeLevel,
          studentCount: requestData.studentCount,
          notes: requestData.notes || '',
          schedule: requestData.schedule || '',
          addedAt: Timestamp.now(),
        });

        console.log('[API] Partner added successfully:', partnerRef.id);

        // Update request status
        await adminDb.collection('partnerRequests').doc(requestId).update({
          status: 'approved'
        });

        console.log('[API] Partner request status updated to approved');
      } catch (error) {
        console.error('[API] Error during accept process:', error);
        throw error; // Re-throw to be caught by outer try-catch
      }
    } else if (action === 'reject') {
      console.log('[API] Rejecting partner request:', {
        requestId,
        currentStatus: requestData.status
      });

      try {
        await adminDb.collection('partnerRequests').doc(requestId).update({
          status: 'rejected'
        });
        console.log('[API] Partner request status updated to rejected');
      } catch (error) {
        console.error('[API] Error during reject process:', error);
        throw error; // Re-throw to be caught by outer try-catch
      }
    } else {
      console.error('[API] Invalid action:', action);
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error updating partner request:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to update partner request' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id;
    console.log('[API] Deleting partner request:', requestId);

    // First get the request to check its status and data
    const requestDoc = await adminDb.collection('partnerRequests').doc(requestId).get();
    if (!requestDoc.exists) {
      return NextResponse.json({ error: 'Partner request not found' }, { status: 404 });
    }

    const requestData = requestDoc.data();
    if (!requestData) {
      return NextResponse.json({ error: 'Invalid partner request data' }, { status: 400 });
    }

    // If the request was approved, find and delete the corresponding partner
    if (requestData.status === 'approved') {
      // Query the partners collection to find the matching partner
      const partnersSnapshot = await adminDb.collection('partners')
        .where('schoolName', '==', requestData.schoolName)
        .where('email', '==', requestData.email)
        .get();

      // Delete all matching partners (should usually be just one)
      const deletePromises = partnersSnapshot.docs.map(doc => {
        console.log('[API] Deleting partner:', doc.id);
        return adminDb.collection('partners').doc(doc.id).delete();
      });

      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
        console.log('[API] Deleted corresponding partner(s) from partners collection');
      } else {
        console.log('[API] No matching partners found to delete');
      }
    }

    // Delete the partner request
    await adminDb.collection('partnerRequests').doc(requestId).delete();
    console.log('[API] Partner request deleted successfully');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error deleting partner request:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to delete partner request' },
      { status: 500 }
    );
  }
} 