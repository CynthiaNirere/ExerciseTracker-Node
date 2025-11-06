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

<<<<<<< HEAD
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
=======
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
>>>>>>> cn-addcoachAthletebranch
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

<<<<<<< HEAD
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

=======
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
>>>>>>> cn-addcoachAthletebranch
export default db;