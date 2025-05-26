import { NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase-admin';
import { HeroImage } from '@/lib/firebase-types';

export async function GET() {
  try {
    const snapshot = await adminDb.collection('heroImages').orderBy('order').get();
    const images = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching hero images:', error);
    return NextResponse.json({ error: 'Failed to fetch hero images' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { image } = data;

    // Handle image upload
    let imageUrl = '';
    if (image) {
      const bucket = adminStorage.bucket();
      const fileName = `hero/${Date.now()}-${image.name}`;
      const file = bucket.file(fileName);
      await file.save(Buffer.from(image.data, 'base64'));
      
      // Make the file public and get its public URL
      await file.makePublic();
      imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    }

    const docRef = await adminDb.collection('heroImages').add({
      url: imageUrl,
      order: (await adminDb.collection('heroImages').count().get()).data().count,
      active: true
    });

    return NextResponse.json({ id: docRef.id, url: imageUrl });
  } catch (error) {
    console.error('Error creating hero image:', error);
    return NextResponse.json({ error: 'Failed to create hero image' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, active } = await request.json();
    
    await adminDb.collection('heroImages').doc(id).update({ active });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating hero image:', error);
    return NextResponse.json({ error: 'Failed to update hero image' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id, imageUrl } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    // Delete from Firestore first
    await adminDb.collection('heroImages').doc(id).delete();

    // Delete from Storage if URL exists and looks like a Firebase Storage URL
    if (imageUrl && imageUrl.includes('storage.googleapis.com')) {
      try {
        const bucket = adminStorage.bucket();
        const fileName = imageUrl.split('/hero/').pop(); // Get everything after /hero/
        if (fileName) {
          const file = bucket.file(`hero/${fileName}`);
          await file.delete();
        }
      } catch (error) {
        console.error('Error deleting image file:', error);
        // Continue even if file deletion fails
      }
    }

    // Update order of remaining images
    const snapshot = await adminDb.collection('heroImages').orderBy('order').get();
    const batch = adminDb.batch();
    snapshot.docs.forEach((doc, index) => {
      batch.update(doc.ref, { order: index });
    });
    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting hero image:', error);
    return NextResponse.json({ error: 'Failed to delete hero image' }, { status: 500 });
  }
} 