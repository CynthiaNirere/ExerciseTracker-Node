const exerciseModel = (sequelize, Sequelize) => {
  const Exercise = sequelize.define("exercises", {
    exercise_id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
    },
    muscle_group: {
      type: Sequelize.STRING,
    },
    equipment_needed: {
      type: Sequelize.STRING,
    },
    created_by: {
      type: Sequelize.INTEGER,
    },
    created_at: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  }, {
    timestamps: false,
    tableName: 'exercises'
  });
  
  return Exercise;
};

export default exerciseModel;