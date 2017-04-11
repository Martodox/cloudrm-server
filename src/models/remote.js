export default function(sequelize, DataTypes) {
  var Remote = sequelize.define('Remote', {
    device_id: { type: DataTypes.STRING, unique: true },
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