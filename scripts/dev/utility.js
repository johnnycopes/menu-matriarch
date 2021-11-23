function deleteUserAccount(admin, uid) {
  admin.auth().deleteUser(uid)
    .then(function () {
      console.log('Successfully deleted user', uid);
    })
    .catch(function (error) {
      console.log('Error deleting user:', error);
    });
}

module.exports = {
  deleteUserAccount
};
