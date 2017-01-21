export default function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    password: DataTypes.STRING,
    username: DataTypes.STRING,
    email: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        User.hasOne(models.Session, {foreignKey: 'id'})
      }
    }
  });
  return User;
};