import { DataTypes } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";

const ExercisePlanItem = sequelize.define("ExercisePlanItem", {
    id: {  // CHANGED - add auto-increment ID
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'detail_id'
    },
    planId: {  // CHANGED to camelCase
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'plan_id',
      references: {
        model: 'exercise_plans',
        key: 'plan_id'
      }
    },
    exerciseId: {  // CHANGED to camelCase
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'exercise_id',
      references: {
        model: 'exercises',
        key: 'exercise_id'
      }
    },
    sets: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    reps: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    durationSeconds: {  // CHANGED name
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'duration_seconds'
    },
    restSeconds: {  // CHANGED to camelCase
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'rest_seconds'
    },
    orderIndex: {  // CHANGED name
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'order_index'
    },
    notes: {  // NEW FIELD
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'exercise_plan_details',  // CHANGED table name
    timestamps: false,
    underscored: false
  });

export default ExercisePlanItem;