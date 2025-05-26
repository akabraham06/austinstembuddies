import { db, storage } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDoc, writeBatch, getDocs, query, orderBy, setDoc, Firestore, DocumentReference } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ResumeChunk, ResumeChunkMetadata } from './firebase-types';

export interface MemberApplication {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  eid: string;
  major: string;
  grade: string;
  gpa: number;
  whyJoin: string;
  experience?: string;
  resumeUrl?: string;
  resumeData?: string | null;
  status: 'pending' | 'accepted' | 'archived' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  resumeStorageType: 'chunked' | null;
  resumeChunks: string[];
  resumeMetadata: ResumeChunkMetadata | null;
}

export interface NewMember {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  eid: string;
  major: string;
  grade: string;
  points: {
    service: number;
    social: number;
    fundraising: number;
    total: number;
  };
  status: 'active' | 'inactive';
  joinedAt: Date;
}

// Maximum file size (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

// Maximum chunk size (slightly less than 1MB to account for metadata)
const CHUNK_SIZE = 750000;

export async function storeResumeInChunks(resumeData: string, applicationId: string): Promise<void> {
  console.log('Starting resume storage process...', { applicationId });
  try {
    // First verify the application exists and check its current state
    const applicationRef = doc(db, 'member-applications', applicationId);
    const applicationSnap = await getDoc(applicationRef);
    
    if (!applicationSnap.exists()) {
      throw new Error('Application not found');
    }
    
    const currentData = applicationSnap.data();
    console.log('Current application state:', {
      hasResumeStorageType: !!currentData.resumeStorageType,
      currentStorageType: currentData.resumeStorageType,
      hasMetadata: !!currentData.resumeMetadata
    });

    // Convert binary string to base64
    let base64Data;
    try {
      base64Data = btoa(resumeData);
      console.log('Converted binary to base64', { 
        originalLength: resumeData.length,
        base64Length: base64Data.length 
      });
    } catch (error) {
      console.error('Error converting to base64:', error);
      throw new Error('Failed to process resume data');
    }
    
    const chunks = [];
    for (let i = 0; i < base64Data.length; i += CHUNK_SIZE) {
      chunks.push(base64Data.slice(i, i + CHUNK_SIZE));
    }
    console.log('Split data into chunks', { numberOfChunks: chunks.length });

    // Store chunks in subcollection
    const resumeDataRef = collection(db, 'member-applications', applicationId, 'resume-data');
    console.log('Created resume-data subcollection reference');
    
    // Store each chunk with retries
    for (let i = 0; i < chunks.length; i++) {
      let retries = 3;
      while (retries > 0) {
        try {
          await setDoc(doc(resumeDataRef, `chunk_${i}`), {
            data: chunks[i],
            index: i
          });
          console.log(`Stored chunk ${i + 1} of ${chunks.length}`);
          break;
        } catch (error) {
          retries--;
          if (retries === 0) {
            console.error(`Failed to store chunk ${i} after 3 attempts:`, error);
            throw new Error('Failed to store resume chunks');
          }
          console.warn(`Retrying chunk ${i} storage, ${retries} attempts remaining`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
        }
      }
    }

    // Store metadata
    const metadata: ResumeChunkMetadata = {
      totalChunks: chunks.length,
      totalSize: base64Data.length,
      createdAt: new Date(),
      fileName: 'resume.pdf',
      fileType: 'application/pdf'
    };
    
    try {
      await setDoc(doc(resumeDataRef, 'metadata'), metadata);
      console.log('Stored resume metadata', metadata);
    } catch (error) {
      console.error('Failed to store metadata:', error);
      throw new Error('Failed to store resume metadata');
    }

    // Update main document to indicate resume is stored
    const updateData = {
      resumeStorageType: 'chunked' as const,
      resumeMetadata: metadata,
      resumeChunks: chunks.map((_, i) => `chunk_${i}`),
      updatedAt: new Date()
    };
    
    try {
      await updateDoc(applicationRef, updateData);
      console.log('Updated application with resume data:', updateData);

      // Verify the update worked
      const updatedSnap = await getDoc(applicationRef);
      const updatedData = updatedSnap.data();
      if (!updatedData) {
        throw new Error('Failed to verify application update - document data is null');
      }
      
      console.log('Verified application update:', {
        resumeStorageType: updatedData.resumeStorageType,
        hasMetadata: !!updatedData.resumeMetadata,
        chunksCount: updatedData.resumeChunks?.length
      });
    } catch (error) {
      console.error('Failed to update application document:', error);
      throw new Error('Failed to update application with resume data');
    }

    console.log('Resume storage completed successfully');
  } catch (error) {
    console.error('Error storing resume chunks:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

export async function submitMemberApplication(formData: FormData): Promise<string> {
  try {
    // Log the form data for debugging
    console.log('Form data received:', {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      eid: formData.get('eid'),
      major: formData.get('major'),
      grade: formData.get('grade'),
      gpa: formData.get('gpa'),
      whyJoin: formData.get('whyJoin'),
      experience: formData.get('experience')
    });

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'eid', 'major', 'grade', 'gpa', 'whyJoin'];
    for (const field of requiredFields) {
      if (!formData.get(field)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Get resume file if provided
    const resumeFile = formData.get('resume') as File;
    
    // Validate resume file if provided
    if (resumeFile && resumeFile.name) {
      if (!resumeFile.type.includes('pdf')) {
        throw new Error('Please upload a PDF file');
      }
      
      if (resumeFile.size > MAX_FILE_SIZE) {
        throw new Error('Resume file size must be less than 2MB');
      }
    }

    // Create a minimal application document first
    const now = new Date();
    const application = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      eid: formData.get('eid') as string,
      major: formData.get('major') as string,
      grade: formData.get('grade') as string,
      gpa: parseFloat(formData.get('gpa') as string),
      whyJoin: formData.get('whyJoin') as string,
      experience: formData.get('experience') as string || '',
      status: 'pending' as const,
      createdAt: now,
      updatedAt: now,
      resumeStorageType: null,
      resumeChunks: [],
      resumeMetadata: null
    };

    // Debug log the application data
    console.log('Application data to be sent:', {
      ...application,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt
    });

    console.log('Attempting to create application document...');

    // Get a reference to the collection
    const memberApplicationsRef = collection(db, 'member-applications');
    console.log('Collection reference created');

    // Create the document
    const docRef = await addDoc(memberApplicationsRef, application);
    console.log('Successfully created application with ID:', docRef.id);

    // Process resume if provided
    if (resumeFile && resumeFile.name) {
      console.log('Reading resume file...');
      const reader = new FileReader();
      
      try {
        await new Promise<void>((resolve, reject) => {
          reader.onload = async () => {
            try {
              if (typeof reader.result !== 'string') {
                throw new Error('Failed to read resume file');
              }
              await storeResumeInChunks(reader.result, docRef.id);
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = () => reject(new Error('Failed to read resume file'));
          reader.readAsBinaryString(resumeFile);
        });
        
        console.log('Resume upload completed successfully');
      } catch (error) {
        console.error('Error uploading resume:', error);
        // If resume upload fails, delete the application document
        await deleteDoc(docRef);
        throw new Error('Failed to upload resume. Please try again.');
      }
    } else {
      console.log('No resume provided, skipping resume upload');
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating application document:', error);
    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        console.error('Permission error details:', {
          collection: 'member-applications',
          operation: 'create',
          timestamp: new Date().toISOString()
        });
      }
      throw error;
    }
    throw new Error('Failed to submit application');
  }
}

export async function acceptMemberApplication(applicationId: string): Promise<void> {
  try {
    // Get the application data
    const applicationRef = doc(db, 'member-applications', applicationId);
    const applicationSnap = await getDoc(applicationRef);
    
    if (!applicationSnap.exists()) {
      throw new Error('Application not found');
    }

    const application = applicationSnap.data() as MemberApplication;

    // Create new member document
    const newMember: NewMember = {
      firstName: application.firstName,
      lastName: application.lastName,
      email: application.email,
      phone: application.phone,
      eid: application.eid,
      major: application.major,
      grade: application.grade,
      points: {
        service: 0,
        social: 0,
        fundraising: 0,
        total: 0,
      },
      status: 'active',
      joinedAt: new Date(),
    };

    // Add to members collection
    await addDoc(collection(db, 'members'), newMember);

    // Update application status
    await updateDoc(applicationRef, {
      status: 'accepted',
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error accepting application:', error);
    throw new Error('Failed to accept application');
  }
}

export async function archiveMemberApplication(applicationId: string): Promise<void> {
  try {
    const applicationRef = doc(db, 'member-applications', applicationId);
    await updateDoc(applicationRef, {
      status: 'archived',
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error archiving application:', error);
    throw new Error('Failed to archive application');
  }
}

export async function deleteMemberApplication(applicationId: string): Promise<void> {
  try {
    const applicationRef = doc(db, 'member-applications', applicationId);
    const applicationSnap = await getDoc(applicationRef);
    
    if (!applicationSnap.exists()) {
      throw new Error('Application not found');
    }

    const application = applicationSnap.data() as MemberApplication;

    // Delete resume from storage if it exists
    if (application.resumeUrl) {
      const resumeRef = ref(storage, application.resumeUrl);
      await deleteDoc(doc(db, 'member-applications', applicationId));
    }

    // Delete application document
    await deleteDoc(applicationRef);
  } catch (error) {
    console.error('Error deleting application:', error);
    throw new Error('Failed to delete application');
  }
}

export async function getResumeData(applicationId: string, token: string): Promise<{ url: string; filename: string }> {
  console.log('Starting resume retrieval process...', { applicationId });
  try {
    const applicationRef = doc(db, 'member-applications', applicationId);
    const applicationSnap = await getDoc(applicationRef);
    
    if (!applicationSnap.exists()) {
      console.error('Application document not found:', applicationId);
      throw new Error('Application not found');
    }
    console.log('Found application document');

    const application = applicationSnap.data();
    // Log the entire application data to see what fields are actually present
    console.log('Full application data:', {
      ...application,
      createdAt: application.createdAt?.toDate?.(),
      updatedAt: application.updatedAt?.toDate?.()
    });
    
    console.log('Resume-specific fields:', { 
      resumeStorageType: application.resumeStorageType,
      hasMetadata: !!application.resumeMetadata,
      hasChunks: Array.isArray(application.resumeChunks) && application.resumeChunks.length > 0,
      status: application.status 
    });

    if (!application.resumeStorageType) {
      console.error('Resume storage type is null or undefined');
      throw new Error('No resume found for this application');
    }

    if (application.resumeStorageType !== 'chunked') {
      console.error('Invalid resume storage type:', application.resumeStorageType);
      throw new Error('No resume found for this application');
    }

    // Get metadata
    const metadataRef = doc(db, 'member-applications', applicationId, 'resume-data', 'metadata');
    const metadataSnap = await getDoc(metadataRef);
    
    if (!metadataSnap.exists()) {
      console.error('Resume metadata document not found');
      throw new Error('Resume metadata not found');
    }
    console.log('Found resume metadata');

    const metadata = metadataSnap.data() as ResumeChunkMetadata;
    console.log('Resume metadata:', metadata);

    // Get all chunks
    const resumeDataRef = collection(db, 'member-applications', applicationId, 'resume-data');
    const chunksQuery = query(resumeDataRef, orderBy('index'));
    const chunksSnap = await getDocs(chunksQuery);
    
    const totalChunks = chunksSnap.docs.filter(doc => doc.id !== 'metadata').length;
    console.log('Retrieved chunks from Firestore', { 
      totalDocs: chunksSnap.docs.length,
      totalChunks,
      expectedChunks: metadata.totalChunks 
    });

    if (totalChunks !== metadata.totalChunks) {
      console.error('Chunk count mismatch:', {
        found: totalChunks,
        expected: metadata.totalChunks
      });
      throw new Error('Resume data is incomplete');
    }
    
    // Filter out metadata document and sort chunks
    const base64Data = chunksSnap.docs
      .filter(doc => doc.id !== 'metadata')
      .sort((a, b) => a.data().index - b.data().index)
      .map(doc => doc.data().data)
      .join('');
    
    console.log('Reconstructed base64 data', { 
      length: base64Data.length,
      expectedLength: metadata.totalSize 
    });

    if (base64Data.length !== metadata.totalSize) {
      console.error('Base64 data size mismatch:', {
        actual: base64Data.length,
        expected: metadata.totalSize
      });
      throw new Error('Resume data is corrupted');
    }

    // Convert base64 to binary
    const binaryData = atob(base64Data);
    console.log('Converted base64 to binary', { length: binaryData.length });

    // Create blob and URL
    const blob = new Blob([new Uint8Array([...binaryData].map(char => char.charCodeAt(0)))], {
      type: metadata.fileType || 'application/pdf'
    });
    const url = URL.createObjectURL(blob);
    console.log('Created blob URL for PDF');

    return {
      url,
      filename: metadata.fileName || 'resume.pdf'
    };
  } catch (error) {
    console.error('Error retrieving resume:', error);
    throw error;
  }
} 