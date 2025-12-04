import { DataTypes } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";

const AthletePlan = sequelize.define("AthletePlan", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'athlete_plan_id'
  },
  athleteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'athlete_id',
    references: {
      model: 'users',  
      key: 'user_id'
    }
  },
  planId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'plan_id',
    references: {
      model: 'exercise_plans',
      key: 'plan_id'
    }
  },
  assignedBy: {  
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'assigned_by',
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  assignedDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'assigned_date'
  },
  startDate: { 
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'start_date'
  },
  endDate: {  
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'end_date'
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'paused', 'cancelled'),
    allowNull: true,
    defaultValue: 'active'
  },
  createdAt: {  
    type: DataTypes.DATE,
    allowNull: true,
    field: 'created_at'
  }
}, {
  tableName: 'athlete_plans',
  timestamps: false,
  underscored: false
});

export default AthletePlan;