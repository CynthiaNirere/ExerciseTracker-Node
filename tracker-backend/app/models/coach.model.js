<<<<<<< HEAD
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
      field: 'experience_years'
    },
    team: {
      type: DataTypes.STRING(100),
      allowNull: true,
    }
  },
  {
    tableName: "coaches",
    timestamps: false,
  }
);
=======
import Sequelize from "sequelize";
import SequelizeInstance from "../config/sequelizeInstance.js";

const Coach = SequelizeInstance.define("coach", {
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  specialty: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  bio: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  certifications: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
});
>>>>>>> cn-addcoachAthletebranch

export default Coach;