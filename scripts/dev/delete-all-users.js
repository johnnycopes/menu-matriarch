const admin = require('firebase-admin');
const serviceAccount = require('../../firebase-admin-dev.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://menu-matriarch-dev.firebaseio.com'
});

function deleteUser(uid) {
  admin.auth().deleteUser(uid)
    .then(function () {
      console.log('Successfully deleted user', uid);
    })
    .catch(function (error) {
      console.log('Error deleting user:', error);
    });
}

function deleteAllUsers(nextPageToken) {
  admin.auth().listUsers(100, nextPageToken)
    .then(function (listUsersResult) {
      listUsersResult.users.forEach(function (userRecord) {
        uid = userRecord.toJSON().uid;
        deleteUser(uid);
      });
      if (listUsersResult.pageToken) {
        deleteAllUsers(listUsersResult.pageToken);
      }
    })
    .catch(function (error) {
      console.log('Error listing users:', error);
    });
}

deleteAllUsers();
