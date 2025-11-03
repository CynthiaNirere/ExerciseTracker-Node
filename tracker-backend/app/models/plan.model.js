const planModel = (sequelize, Sequelize) => {
  const Plan = sequelize.define("plans", {
    plan_id: {
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
    duration: {
      type: Sequelize.STRING,
    },
    assigned_athlete_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
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
    tableName: 'plans'
  });
  
  return Plan;
};

export default planModel;