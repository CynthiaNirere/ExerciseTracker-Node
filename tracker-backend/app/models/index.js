import dbConfig from "../config/db.config.js";
import { Sequelize } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";

// Existing Models
import User from "./user.model.js";
import Session from "./session.model.js";
import Tutorial from "./tutorial.model.js";
import Lesson from "./lesson.model.js";

// NEW: Import Athlete Models
import Athlete from "./athlete.model.js";
import Coach from "./coach.model.js";
import AthleteCoachAssignment from "./athleteCoachAssignment.model.js";
import WorkoutAssignment from "./workoutAssignment.model.js";

// Initialize db object
const db = {
  Sequelize: Sequelize,
  sequelize: sequelize,
  user: User,
  session: Session,
  tutorial: Tutorial,
  lesson: Lesson,
  // NEW: Add athlete models
  athlete: Athlete,
  coach: Coach,
  athleteCoachAssignment: AthleteCoachAssignment,
  workoutAssignment: WorkoutAssignment,
};

// Existing relationships
db.user.hasMany(db.session, {
  foreignKey: "userId",
  sourceKey: "user_id",
});

db.session.belongsTo(db.user, {
  foreignKey: "userId",
  targetKey: "user_id",
});

// NEW: Define Athlete Relationships
// User -> Athlete (One-to-One)
db.user.hasOne(db.athlete, {
  foreignKey: "userId",
  sourceKey: "user_id",  // Changed from "id" to "user_id"
});

db.athlete.belongsTo(db.user, {
  foreignKey: "userId",
  targetKey: "user_id",  // Changed from "id" to "user_id"
});

// User -> Coach (One-to-One)
db.user.hasOne(db.coach, {
  foreignKey: "userId",
  sourceKey: "user_id",  // Changed from "id" to "user_id"
});

db.coach.belongsTo(db.user, {
  foreignKey: "userId",
  targetKey: "user_id",  // Changed from "id" to "user_id"
});

// Athlete -> AthleteCoachAssignment (One-to-Many)
db.athlete.hasMany(db.athleteCoachAssignment, {
  foreignKey: "athleteId",
});

db.athleteCoachAssignment.belongsTo(db.athlete, {
  foreignKey: "athleteId",
});

// Coach -> AthleteCoachAssignment (One-to-Many)
db.coach.hasMany(db.athleteCoachAssignment, {
  foreignKey: "coachId",
});

db.athleteCoachAssignment.belongsTo(db.coach, {
  foreignKey: "coachId",
});

// Athlete -> WorkoutAssignment (One-to-Many)
db.athlete.hasMany(db.workoutAssignment, {
  foreignKey: "athleteId",
});

db.workoutAssignment.belongsTo(db.athlete, {
  foreignKey: "athleteId",
});

// Coach -> WorkoutAssignment (One-to-Many)
db.coach.hasMany(db.workoutAssignment, {
  foreignKey: "coachId",
});

db.workoutAssignment.belongsTo(db.coach, {
  foreignKey: "coachId",
});

// Export db
export default db;