const admin = require('firebase-admin');
const serviceAccount = require('../../firebase-admin-dev.json');
const { deleteUserAccount } = require('./utility');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://menu-matriarch-dev.firebaseio.com'
});

function deleteAllUserAccounts(nextPageToken) {
  admin.auth().listUsers(100, nextPageToken)
    .then(function (listUsersResult) {
      listUsersResult.users.forEach(function (userRecord) {
        uid = userRecord.toJSON().uid;
        deleteUserAccount(admin, uid);
      });
      if (listUsersResult.pageToken) {
        deleteAllUserAccounts(listUsersResult.pageToken);
      }
    })
    .catch(function (error) {
      console.log('Error listing users:', error);
    });
}

deleteAllUserAccounts();
