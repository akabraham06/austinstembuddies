import { NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase-admin';
import { Event } from '@/lib/firebase-types';

export async function GET() {
  try {
    const snapshot = await adminDb.collection('events').orderBy('date', 'desc').get();
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { image, ...eventData } = data;

    // Handle image upload if provided
    let imageUrl = '';
    if (image) {
      const bucket = adminStorage.bucket();
      const fileName = `events/${Date.now()}-${image.name}`;
      const file = bucket.file(fileName);
      await file.save(Buffer.from(image.data, 'base64'));
      
      // Make the file public and get its public URL
      await file.makePublic();
      imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    }

    const docRef = await adminDb.collection('events').add({
      ...eventData,
      image: imageUrl,
      date: new Date(eventData.date)
    });

    return NextResponse.json({ id: docRef.id, image: imageUrl });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, image, ...data } = await request.json();
    
    // Handle image update if provided
    if (image) {
      const bucket = adminStorage.bucket();
      const fileName = `events/${Date.now()}-${image.name}`;
      const file = bucket.file(fileName);
      await file.save(Buffer.from(image.data, 'base64'));
      
      // Make the file public and get its public URL
      await file.makePublic();
      data.image = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      // Delete old image if it exists
      if (data.oldImageUrl) {
        try {
          const oldFileName = data.oldImageUrl.split('/').pop();
          const oldFile = bucket.file(`events/${oldFileName}`);
          await oldFile.delete();
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
    }

    // Ensure date is properly formatted
    if (data.date) {
      data.date = new Date(data.date);
    }

    await adminDb.collection('events').doc(id).update(data);
    return NextResponse.json({ success: true, image: data.image });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id, imageUrl } = await request.json();
    
    // Delete image from storage if exists
    if (imageUrl) {
      const bucket = adminStorage.bucket();
      try {
        const fileName = imageUrl.split('/').pop();
        const file = bucket.file(`events/${fileName}`);
        await file.delete();
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    await adminDb.collection('events').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
} 