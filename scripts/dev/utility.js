async function deleteUser(admin, uid) {
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
    admin.auth().deleteUser(uid),
    batch.commit(),
  ]).then(function () {
    console.log(`Successfully deleted user ${uid}`);
  })
  .catch(function (error) {
    console.log(`Error deleting user ${uid}:`, error);
  });;
}

module.exports = {
  deleteUser
};
