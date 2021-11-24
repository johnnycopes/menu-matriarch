const admin = require('firebase-admin');
const serviceAccount = require('../../firebase-admin-dev.json');
const uid = process.argv.slice(2)?.[0];
const { deleteUserAccount } = require('./utility');

if (!uid) {
  throw new Error('A UID must be passed in as an argument to the script');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

(async function() {
  const db = admin.firestore();
  const batch = db.batch();
  const collections = ['users', 'menus', 'dishes', 'tags'];

  const snapshots = await Promise.all(
    collections.map(collection => {
      return db.collection(collection)
        .where('uid', '==', uid)
        .get();
    })
  );
  snapshots.forEach(snapshot => {
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
  });

  await Promise.all([
    deleteUserAccount(admin, uid),
    batch.commit(),
  ]);
})();
