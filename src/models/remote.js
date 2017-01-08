'use strict';
module.exports = function(sequelize, DataTypes) {
  var Remote = sequelize.define('Remote', {
    device_id: DataTypes.STRING,
    pem: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Remote;
};