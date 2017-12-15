export default function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    password: DataTypes.STRING,
    username: DataTypes.STRING,
    email: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        User.hasOne(models.Session, {
          foreignKey: 'id'
        });
        User.belongsToMany(models.Remote, {
            through: models.UserRemote,
            foreignKey: 'user_id'
        })

      }
    }
  });
  return User;
};