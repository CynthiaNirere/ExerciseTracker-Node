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
      model: 'athlete_profiles',
      key: 'athlete_id'
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
  assignedDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'assigned_date'
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'active'
  }
}, {
  tableName: 'athlete_plans',
  timestamps: false,
  underscored: false
});

export default AthletePlan;