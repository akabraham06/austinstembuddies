import { NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/lib/firebase-admin';
import { Officer } from '@/lib/firebase-types';
import { verifyAuth } from '@/lib/auth-helpers';
import { headers } from 'next/headers';

// Add headers to ensure JSON response
const responseHeaders = {
  'Content-Type': 'application/json'
};

export async function GET(request: Request) {
  try {
    // Verify authentication
    const user = await verifyAuth(request as any);

    const snapshot = await adminDb.collection('officers').orderBy('order').get();
    const officers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return new NextResponse(JSON.stringify(officers), { headers: responseHeaders });
  } catch (error) {
    console.error('GET /api/cms/officers error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to fetch officers',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: responseHeaders }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Verify authentication and admin status
    const user = await verifyAuth(request as any);
    if (!user.isAdmin) {
      return new NextResponse(
        JSON.stringify({ error: 'Insufficient permissions. Admin role required.' }),
        { status: 403, headers: responseHeaders }
      );
    }

    const data = await request.json();
    const { image, name, position, bio, ...officerData } = data;

    if (!name || !position || !bio) {
      return new NextResponse(
        JSON.stringify({ error: 'Name, position, and bio are required fields' }),
        { status: 400, headers: responseHeaders }
      );
    }

    let imageUrl = '';
    if (image) {
      try {
        if (!image.name || !image.data) {
          return new NextResponse(
            JSON.stringify({ error: 'Invalid image format. Expected {name, data}' }),
            { status: 400, headers: responseHeaders }
          );
        }

        const bucket = adminStorage.bucket();
        const fileName = `officers/${Date.now()}-${image.name}`;
        const file = bucket.file(fileName);
        await file.save(Buffer.from(image.data, 'base64'));
        await file.makePublic();
        imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      } catch (error) {
        console.error('Error uploading image:', error);
        return new NextResponse(
          JSON.stringify({ error: 'Failed to upload image' }),
          { status: 500, headers: responseHeaders }
        );
      }
    }

    try {
      const docRef = await adminDb.collection('officers').add({
        name,
        position,
        bio,
        image: imageUrl,
        order: (await adminDb.collection('officers').count().get()).data().count,
        ...officerData
      });

      return new NextResponse(
        JSON.stringify({ id: docRef.id, image: imageUrl }),
        { headers: responseHeaders }
      );
    } catch (error) {
      if (imageUrl) {
        try {
          const bucket = adminStorage.bucket();
          const fileName = imageUrl.split('/').pop();
          const file = bucket.file(`officers/${fileName}`);
          await file.delete();
        } catch (cleanupError) {
          console.error('Error cleaning up image:', cleanupError);
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('POST /api/cms/officers error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to create officer',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: responseHeaders }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, image, name, position, bio, ...data } = await request.json();
    
    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: 'Officer ID is required' }), 
        { status: 400, headers: responseHeaders }
      );
    }

    // Validate required fields
    if (!name || !position || !bio) {
      return new NextResponse(
        JSON.stringify({ error: 'Name, position, and bio are required fields' }), 
        { status: 400, headers: responseHeaders }
      );
    }

    // Verify officer exists
    const officerDoc = await adminDb.collection('officers').doc(id).get();
    if (!officerDoc.exists) {
      return new NextResponse(
        JSON.stringify({ error: 'Officer not found' }), 
        { status: 404, headers: responseHeaders }
      );
    }

    const updateData = {
      name,
      position,
      bio,
      ...data
    };
    
    // Handle image update if provided
    if (image) {
      try {
        if (!image.name || !image.data) {
          return new NextResponse(
            JSON.stringify({ error: 'Invalid image format. Expected {name, data}' }), 
            { status: 400, headers: responseHeaders }
          );
        }

        const bucket = adminStorage.bucket();
        const fileName = `officers/${Date.now()}-${image.name}`;
        const file = bucket.file(fileName);
        await file.save(Buffer.from(image.data, 'base64'));
        
        // Make the file public and get its public URL
        await file.makePublic();
        updateData.image = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

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
        console.error('PUT /api/cms/officers: Error uploading new image:', error);
        return new NextResponse(
          JSON.stringify({ error: 'Failed to upload new image. Please try again.' }), 
          { status: 500, headers: responseHeaders }
        );
      }
    }

    try {
      await adminDb.collection('officers').doc(id).update(updateData);
      return new NextResponse(
        JSON.stringify({ success: true, image: updateData.image }), 
        { headers: responseHeaders }
      );
    } catch (error) {
      console.error('PUT /api/cms/officers: Error updating document:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to update officer record in database' }), 
        { status: 500, headers: responseHeaders }
      );
    }
  } catch (error) {
    console.error('PUT /api/cms/officers: Error processing request:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Invalid request format or missing data' }), 
      { status: 400, headers: responseHeaders }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id, imageUrl } = await request.json();
    
    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: 'Officer ID is required' }), 
        { status: 400, headers: responseHeaders }
      );
    }

    // Delete image from storage if exists
    if (imageUrl) {
      try {
        const bucket = adminStorage.bucket();
        const fileName = imageUrl.split('/').pop();
        if (fileName) {
          const file = bucket.file(`officers/${fileName}`);
          await file.delete();
        }
      } catch (error) {
        console.error('DELETE /api/cms/officers: Error deleting image:', error);
        // Continue with document deletion even if image deletion fails
      }
    }

    try {
      await adminDb.collection('officers').doc(id).delete();

      // Update order of remaining officers
      const snapshot = await adminDb.collection('officers').orderBy('order').get();
      const batch = adminDb.batch();
      snapshot.docs.forEach((doc, index) => {
        batch.update(doc.ref, { order: index });
      });
      await batch.commit();

      return new NextResponse(
        JSON.stringify({ success: true }), 
        { headers: responseHeaders }
      );
    } catch (error) {
      console.error('DELETE /api/cms/officers: Error deleting document:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to delete officer record' }), 
        { status: 500, headers: responseHeaders }
      );
    }
  } catch (error) {
    console.error('DELETE /api/cms/officers: Error processing request:', error);
    return new NextResponse(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to process delete request' }), 
      { status: 500, headers: responseHeaders }
    );
  }
}