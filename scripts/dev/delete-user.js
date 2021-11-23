const admin = require('firebase-admin');
const serviceAccount = require('../../firebase-admin-dev.json');
const uid = process.argv.slice(2)?.[0];

if (!uid) {
  throw new Error('A UID must be passed in as an argument to the script');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://menu-matriarch-dev.firebaseio.com'
});

(async function() {
  const db = admin.firestore();
  const batch = db.batch();
  const collections = ['users', 'menus', 'dishes', 'tags'];

  for (let collection of collections) {
    const collectionSnapshot = await db
      .collection(collection)
      .where('uid', '==', uid)
      .get();
    collectionSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
  }

  await Promise.all([
    deleteUserAccount(uid),
    batch.commit(),
  ])
})();

function deleteUserAccount(uid) {
  admin.auth().deleteUser(uid)
    .then(function () {
      console.log('Successfully deleted user', uid);
    })
    .catch(function (error) {
      console.log('Error deleting user:', error);
    });
}
