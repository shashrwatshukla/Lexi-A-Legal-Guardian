const admin = require('firebase-admin');
const serviceAccount = require('C:\\Users\\shash\\Downloads\\imlegalguardian-firebase-adminsdk-fbsvc-056a0b1fee.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uid = 'test-user-123';

admin.auth().createCustomToken(uid)
  .then((customToken) => {
    console.log('Generated custom token:', customToken);
    console.log('Copy this token and paste it into your .env.local file.');
    console.log('Remember to restart your dev server after updating the file!');
  })
  .catch((error) => {
    console.error('Error creating custom token:', error);
  });
