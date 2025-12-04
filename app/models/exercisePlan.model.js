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
  isStandard: {  
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    field: 'is_standard'
  },
  createdBy: { 
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'created_by'
  },
  createdAt: {  
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'updated_at'
  }
}, {
  tableName: 'exercise_plans',
  timestamps: false,
  underscored: false
});

export default ExercisePlan;