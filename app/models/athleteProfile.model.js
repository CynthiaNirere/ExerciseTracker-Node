import { DataTypes } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";

const AthleteProfile = sequelize.define(
  "AthleteProfile",
  {
    athleteId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: 'athlete_id',
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    coachId: {                    // ← ADD THIS
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'coach_id',
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    team: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    sportType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'sport_type'
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  },
  {
    tableName: "athlete_profiles",
    timestamps: false,
  }
);

export default AthleteProfile;