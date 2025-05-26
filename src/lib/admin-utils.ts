import { adminAuth } from './firebase-admin';

export async function setUserAsAdmin(uid: string) {
  try {
    await adminAuth.setCustomUserClaims(uid, { admin: true });
    console.log(`Successfully set admin claim for user ${uid}`);
    
    // Force token refresh
    const user = await adminAuth.getUser(uid);
    if (user.email) {
      console.log(`User ${user.email} is now an admin`);
    }
    
    return true;
  } catch (error) {
    console.error('Error setting admin claim:', error);
    throw error;
  }
}

export async function removeUserAsAdmin(uid: string) {
  try {
    await adminAuth.setCustomUserClaims(uid, { admin: false });
    console.log(`Successfully removed admin claim for user ${uid}`);
    return true;
  } catch (error) {
    console.error('Error removing admin claim:', error);
    throw error;
  }
}

export async function checkUserIsAdmin(uid: string): Promise<boolean> {
  try {
    const user = await adminAuth.getUser(uid);
    const customClaims = user.customClaims || {};
    return customClaims.admin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
} 