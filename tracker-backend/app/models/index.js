import { Sequelize } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";

// Import models
import User from "./user.model.js";
import Session from "./session.model.js";
import AthleteProfile from "./athleteProfile.model.js";
import Exercise from "./exercise.model.js";
import ExerciseResult from "./exerciseResult.model.js";
import Goal from "./goal.model.js";
import ExercisePlan from "./exercisePlan.model.js";
import ExercisePlanItem from "./exercisePlanItem.model.js";

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Register models
db.user = User;
db.session = Session;
db.athleteProfile = AthleteProfile;
db.exercise = Exercise;
db.exerciseResult = ExerciseResult;
db.goal = Goal;
db.exercisePlan = ExercisePlan;
db.exercisePlanItem = ExercisePlanItem;

// ========================================
// Define associations
// ========================================

// User ↔ AthleteProfile (One-to-One)
User.hasOne(AthleteProfile, {
  foreignKey: 'athlete_id',
  as: 'athleteProfile'
});
AthleteProfile.belongsTo(User, {
  foreignKey: 'athlete_id',
  as: 'user'
});

// User ↔ Goals (One-to-Many)
User.hasMany(Goal, {
  foreignKey: 'athlete_id',
  as: 'goals'
});
Goal.belongsTo(User, {
  foreignKey: 'athlete_id',
  as: 'athlete'
});

// Exercise ↔ ExerciseResults (One-to-Many)
Exercise.hasMany(ExerciseResult, {
  foreignKey: 'exercise_id',
  as: 'results'
});
ExerciseResult.belongsTo(Exercise, {
  foreignKey: 'exercise_id',
  as: 'exercise'
});

// User ↔ ExerciseResults (One-to-Many)
User.hasMany(ExerciseResult, {
  foreignKey: 'athlete_id',
  as: 'exerciseResults'
});
ExerciseResult.belongsTo(User, {
  foreignKey: 'athlete_id',
  as: 'athlete'
});

// User ↔ Exercise (Creator)
User.hasMany(Exercise, {
  foreignKey: 'created_by',
  as: 'createdExercises'
});
Exercise.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

// ========================================
// ✓ NEW: ExercisePlan Associations
// ========================================

// User ↔ ExercisePlan (One-to-Many) - A user can create many plans
User.hasMany(ExercisePlan, {
  foreignKey: 'created_by',
  as: 'createdPlans'
});
ExercisePlan.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

// ExercisePlan ↔ Exercise (Many-to-Many through ExercisePlanItem)
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

// Direct associations for ExercisePlanItem (if you need to query it directly)
ExercisePlanItem.belongsTo(ExercisePlan, {
  foreignKey: 'plan_id',
  as: 'plan'
});

ExercisePlanItem.belongsTo(Exercise, {
  foreignKey: 'exercise_id',
  as: 'exercise'
});

ExercisePlan.hasMany(ExercisePlanItem, {
  foreignKey: 'plan_id',
  as: 'planItems'
});

Exercise.hasMany(ExercisePlanItem, {
  foreignKey: 'exercise_id',
  as: 'planItems'
});

export default db;