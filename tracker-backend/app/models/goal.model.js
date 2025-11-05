export default (sequelize, Sequelize) => {
  const Goal = sequelize.define("goals", {
    goal_id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      field: 'user_id'
    },
    exercise: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    goal_type: {
      type: Sequelize.ENUM('weight', 'reps', 'time', 'distance'),
      allowNull: false,
      field: 'goal_type'
    },
    current_value: {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'current_value'
    },
    target_value: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      field: 'target_value'
    },
    deadline: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM('active', 'completed', 'abandoned'),
      defaultValue: 'active',
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
      field: 'created_at'
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
      field: 'updated_at'
    }
  }, {
    timestamps: false,
    tableName: 'goals'
  });

  return Goal;
};