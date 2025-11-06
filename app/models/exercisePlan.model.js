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
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'exercise_plans',
    timestamps: false,
    underscored: true
  });

// Remove the associate function - associations are now in index.js

export default ExercisePlan;