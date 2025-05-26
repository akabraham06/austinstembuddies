import { NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase-admin';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Officer ID is required' }, { status: 400 });
    }

    // Verify the officer exists
    const officerDoc = await adminDb.collection('officers').doc(id).get();
    if (!officerDoc.exists) {
      return NextResponse.json({ error: 'Officer not found' }, { status: 404 });
    }

    const data = await request.json();
    const { image, ...officerData } = data;
    
    // Handle image update if provided
    if (image) {
      try {
        const bucket = adminStorage.bucket();
        const fileName = `officers/${Date.now()}-${image.name}`;
        const file = bucket.file(fileName);
        await file.save(Buffer.from(image.data, 'base64'));
        
        // Make the file public and get its public URL
        await file.makePublic();
        officerData.image = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        // Delete old image if it exists
        if (data.oldImageUrl) {
          try {
            const oldFileName = data.oldImageUrl.split('/').pop();
            if (oldFileName) {
              const oldFile = bucket.file(`officers/${oldFileName}`);
              await oldFile.delete();
            }
          } catch (error) {
            console.error('Error deleting old image:', error);
            // Continue with update even if old image deletion fails
          }
        }
      } catch (error) {
        console.error('Error uploading new image:', error);
        return NextResponse.json({ error: 'Failed to upload new image' }, { status: 500 });
      }
    }

    try {
      await adminDb.collection('officers').doc(id).update(officerData);
      return NextResponse.json({ success: true, image: officerData.image });
    } catch (error) {
      console.error('Error updating officer document:', error);
      return NextResponse.json({ error: 'Failed to update officer record' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing update request:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to process update request'
    }, { status: 500 });
  }
} 