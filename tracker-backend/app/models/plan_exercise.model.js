const planExerciseModel = (sequelize, Sequelize) => {
  const PlanExercise = sequelize.define("plan_exercises", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    plan_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    exercise_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    sets: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    reps: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    order: {
      type: Sequelize.INTEGER,
      allowNull: true,
    }
  }, {
    timestamps: false,
    tableName: 'plan_exercises'
  });
  
  return PlanExercise;
};

export default planExerciseModel;