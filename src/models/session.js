import uuid from 'node-uuid';

export default function(sequelize, DataTypes) {
  var Session = sequelize.define('Session', {
    user_id: { type: DataTypes.INTEGER, unique: false },
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