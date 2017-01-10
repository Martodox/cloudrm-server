import uuid from 'node-uuid';

export default function(sequelize, DataTypes) {
  var Session = sequelize.define('Session', {
    user_id: DataTypes.INTEGER,
    token: {
      type: DataTypes.STRING,
      defaultValue: () => {
        return uuid.v4();
      }
    }
  }, {
    classMethods: {
      associate: function(models) {
        Session.belongsTo(models.User, {foreignKey: 'user_id'});
      }
    }
  });
  return Session;
};