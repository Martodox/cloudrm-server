export default function(sequelize, DataTypes) {
  var UserRemote = sequelize.define('UserRemote', {
    remote_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER
  }, {
    timestamps: false,
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return UserRemote;
};