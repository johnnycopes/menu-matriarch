/**
 * Deletes user account from Firebase Authentication and ALL of their
 * associated data from Firestore
 */
async function deleteAccount(admin, uid) {
  await Promise.all([
    deleteUser(admin, uid),
    deleteData({ admin, uid, deleteUserData: true }),
  ]);
}

/**
 * Deletes user account from Firebase Authentication. Does not delete any
 * data from Firestore
 */
async function deleteUser(admin, uid) {
  await admin.auth().deleteUser(uid)
    .then(() => console.log(`Successfully deleted user ${uid}`))
    .catch((error) => console.log(`Error deleting user ${uid}:`, error));
}

/**
 * Deletes all user data from Firestore EXCEPT their document in the 'Users'
 * collection. Does not delete user account from Firebase Authentication
 */
async function deleteData({ admin, uid, deleteUserData }) {
  const userExists = await verifyUserExists(admin, uid);
  if (!userExists) {
    console.log(`User ${uid} not found`);
    return false;
  }
  const db = admin.firestore();
  const batch = db.batch();
  const collections = ['menus', 'meals', 'dishes', 'tags'];
  if (deleteUserData) {
    collections.push('users');
  }
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

  batch.commit()
    .then(() => console.log(`Successfully deleted data for user ${uid}`))
    .catch((error) => console.log(`Error deleting data for user ${uid}:`, error));
}

function verifyUserExists(admin, uid) {
  return admin.auth().getUser(uid)
    .then(() => true)
    .catch(() => false);
}

module.exports = {
  deleteAccount,
  deleteData,
};
