import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const snapshot = await adminDb.collection('partners').get();
    const partners = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json(partners);
  } catch (error) {
    console.error('[Admin API] Error fetching partners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const snapshot = await adminDb.collection('partners').get();
    
    // Delete all partners
    const deletePromises = snapshot.docs.map(doc => {
      console.log('[Admin API] Deleting partner:', doc.id);
      return adminDb.collection('partners').doc(doc.id).delete();
    });
    
    await Promise.all(deletePromises);
    console.log('[Admin API] All partners deleted successfully');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin API] Error deleting partners:', error);
    return NextResponse.json(
      { error: 'Failed to delete partners' },
      { status: 500 }
    );
  }
} 