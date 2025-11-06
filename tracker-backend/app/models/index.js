import User from "./user.model.js";
import AthleteProfile from "./athleteProfile.model.js";
import Coach from "./coach.model.js"; // ← ADD THIS
import Exercise from "./exercise.model.js";
import ExerciseResult from "./exerciseResult.model.js";
import Goal from "./goal.model.js";
import ExercisePlan from "./exercisePlan.model.js";
import ExercisePlanItem from "./exercisePlanItem.model.js";
import Session from "./session.model.js";
import sequelize from "../config/sequelizeInstance.js";
import { Sequelize } from "sequelize";

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models
db.user = User;
db.athleteProfile = AthleteProfile;
db.coach = Coach; // ← ADD THIS
db.exercise = Exercise;
db.exerciseResult = ExerciseResult;
db.goal = Goal;
db.exercisePlan = ExercisePlan;
db.exercisePlanItem = ExercisePlanItem;
db.session = Session;

// ========================================
// Associations
// ========================================

// User <-> AthleteProfile (One-to-One)
User.hasOne(AthleteProfile, {
  foreignKey: 'athlete_id',
  as: 'athleteProfile'
});
AthleteProfile.belongsTo(User, {
  foreignKey: 'athlete_id',
  as: 'user'
});

// User <-> Coach (One-to-One) ← ADD THIS
User.hasOne(Coach, {
  foreignKey: 'coach_id',
  as: 'coachProfile'
});
Coach.belongsTo(User, {
  foreignKey: 'coach_id',
  as: 'user'
});

// User <-> Goal (One-to-Many)
User.hasMany(Goal, {
  foreignKey: 'athlete_id',
  as: 'goals'
});
Goal.belongsTo(User, {
  foreignKey: 'athlete_id',
  as: 'athlete'
});

// User <-> ExerciseResult (One-to-Many)
User.hasMany(ExerciseResult, {
  foreignKey: 'athlete_id',
  as: 'exerciseResults'
});
ExerciseResult.belongsTo(User, {
  foreignKey: 'athlete_id',
  as: 'athlete'
});

// Exercise <-> ExerciseResult (One-to-Many)
Exercise.hasMany(ExerciseResult, {
  foreignKey: 'exercise_id',
  as: 'results'
});
ExerciseResult.belongsTo(Exercise, {
  foreignKey: 'exercise_id',
  as: 'exercise'
});

// ExercisePlan <-> Exercise (Many-to-Many through ExercisePlanItem)
ExercisePlan.belongsToMany(Exercise, {
  through: ExercisePlanItem,
  foreignKey: 'plan_id',
  otherKey: 'exercise_id',
  as: 'exercises'
});
Exercise.belongsToMany(ExercisePlan, {
  through: ExercisePlanItem,
  foreignKey: 'exercise_id',
  otherKey: 'plan_id',
  as: 'plans'
});

export default db;