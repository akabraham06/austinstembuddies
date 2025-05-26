import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get('collection');
    
    if (!collection) {
      return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    const snapshot = await db.collection(collection).get();
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { collection, data } = await request.json();
    
    if (!collection || !data) {
      return NextResponse.json({ error: 'Collection name and data are required' }, { status: 400 });
    }

    const docRef = await db.collection(collection).add({
      ...data,
      createdAt: new Date()
    });

    return NextResponse.json({ id: docRef.id });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { collection, id, data } = await request.json();
    
    if (!collection || !id || !data) {
      return NextResponse.json({ error: 'Collection name, document ID, and data are required' }, { status: 400 });
    }

    await db.collection(collection).doc(id).update(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get('collection');
    const id = searchParams.get('id');
    
    if (!collection || !id) {
      return NextResponse.json({ error: 'Collection name and document ID are required' }, { status: 400 });
    }

    await db.collection(collection).doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
} 