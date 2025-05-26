const admin = require('firebase-admin');
const serviceAccount = require('../service_account.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// The UID of the user you want to make an admin
const uid = 'pY51TF6vtbMWbezbQ1ixGDw5ZP63'; // Your complete user ID

async function setAdmin() {
  try {
    // Set admin claim
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log('Successfully set admin claim');

    // Verify the claim was set
    const user = await admin.auth().getUser(uid);
    console.log('User custom claims:', user.customClaims);

    process.exit(0);
  } catch (error) {
    console.error('Error setting admin claim:', error);
    process.exit(1);
  }
}

setAdmin(); 