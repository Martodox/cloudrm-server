'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {

      return queryInterface.bulkInsert('Remotes', [{
        pem: `-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEArEbuPXn3B8EcJDvLidgtVS9jmbdVbD+LLsa4TXxuDs22mOnD8Zcx
IaYYtcg7cAMpiHRYPwVSoWWzy7g7cdblhOX/DhXA8AXoYivaR2FRPrqiCqwUskBJ
iyy4f8OqGZ6r9vScfQ+JoLZH+vpW3x+TuPHrzXXOGiqULLzdGXutDvTHJcb+qE+D
EnSjcIo99QZuKLXyi5NiV00XvWpLY3t9Yx4q78j/2QeaHWzn7n4bO9uluHPU7+tp
vCsQsE6pjoxrJ9AqLH43vKsBVxd9gdTiQrva8DNYWrZkUA2qLshuni1WileD2s5L
dkbdoGTuXOG78MR+UCgp/JZAwxJaSzLziwIDAQAB
-----END RSA PUBLIC KEY-----`,
        device_id: 'fe80::1c84:8b01:45e0:4f5e',
        createdAt: new Date(),
        updatedAt: new Date()
      }], {});

  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Remote', null, {});
  }
};
