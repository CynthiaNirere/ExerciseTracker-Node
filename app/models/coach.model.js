import { DataTypes } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";

const Coach = sequelize.define(
  "Coach",
  {
    coachId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'coach_id',
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    experienceYears: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: 'experience_years'
    },
    team: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    specialization: {  // NEW FIELD
      type: DataTypes.STRING(100),
      allowNull: true,
    }
  },
  {
    tableName: "coaches",
    timestamps: false,
  }
);

export default Coach;