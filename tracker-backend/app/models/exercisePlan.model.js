import { DataTypes } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";

const ExercisePlan = sequelize.define("ExercisePlan", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'plan_id'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'plan_name'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'created_by'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'exercise_plans',
    timestamps: false,
    underscored: true
  });

ExercisePlan.associate = function(models) {
  ExercisePlan.belongsToMany(models.exercise, {
    through: 'exercise_plan_items',
    foreignKey: 'plan_id',
    otherKey: 'exercise_id',
    as: 'exercises'
  });
};

export default ExercisePlan;