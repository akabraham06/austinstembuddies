import { NextRequest } from 'next/server';
import { adminAuth } from './firebase-admin';

export interface AuthUser {
  uid: string;
  email: string | undefined;
  isAdmin: boolean;
}

export async function verifyAuth(request: NextRequest): Promise<AuthUser> {
  const token = request.headers.get('X-Auth-Token');
  if (!token) {
    throw new Error('No authentication token provided');
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Check for admin role in multiple possible locations
    const isAdmin = 
      decodedToken.admin === true || // Check direct admin flag
      decodedToken.role === 'admin' || // Check role field
      (decodedToken.claims && decodedToken.claims.admin === true) || // Check claims object
      (decodedToken.customClaims && decodedToken.customClaims.admin === true); // Check customClaims
    
    console.log('Token verification result:', {
      uid: decodedToken.uid,
      email: decodedToken.email,
      isAdmin,
      claims: decodedToken.claims,
      customClaims: decodedToken.customClaims,
      role: decodedToken.role,
      admin: decodedToken.admin
    });

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      isAdmin
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid or expired token');
  }
} 