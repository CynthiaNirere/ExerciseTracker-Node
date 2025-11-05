<<<<<<< HEAD
import db from "../models/index.js";

const AthleteProfile = db.athleteProfile;
const Goal = db.goal;
const ExerciseResult = db.exerciseResult;
const Exercise = db.exercise;
const User = db.user;

// ========================================
// PROFILE ROUTES
// ========================================

// Get athlete's profile
export const getProfile = async (req, res) => {
  try {
    const athleteId = req.user.userId;
    console.log("Fetching profile for athlete:", athleteId);
    
    const profile = await AthleteProfile.findOne({
      where: { athleteId: athleteId }
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};

// Update athlete's profile
export const updateProfile = async (req, res) => {
  try {
    const athleteId = req.user.userId;
    console.log("Updating profile for athlete:", athleteId);
    
    const [updated] = await AthleteProfile.update(req.body, {
      where: { athleteId: athleteId }
    });

    if (updated) {
      const updatedProfile = await AthleteProfile.findOne({
        where: { athleteId: athleteId }
      });
      return res.json(updatedProfile);
    }

    // If profile doesn't exist, create it
    const newProfile = await AthleteProfile.create({
      athleteId: athleteId,
      ...req.body
    });
    
    res.status(201).json(newProfile);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};

// ========================================
// GOALS ROUTES
// ========================================

// Get athlete's goals
export const getGoals = async (req, res) => {
  try {
    const athleteId = req.user.userId;
    console.log("Fetching goals for athlete:", athleteId);
    
    const goals = await Goal.findAll({
      where: { athleteId: athleteId },
      order: [['id', 'DESC']]  // Changed from createdAt to id
    });

    console.log("Found goals:", goals.length);
    res.json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({ message: "Error fetching goals", error: error.message });
  }
};

// Create new goal
export const createGoal = async (req, res) => {
  try {
    const athleteId = req.user.userId;
    console.log("Creating goal for athlete:", athleteId);
    
    const newGoal = await Goal.create({
      athleteId: athleteId,
      ...req.body
    });

    res.status(201).json(newGoal);
  } catch (error) {
    console.error("Error creating goal:", error);
    res.status(500).json({ message: "Error creating goal", error: error.message });
  }
};

// Update goal
export const updateGoal = async (req, res) => {
  try {
    const athleteId = req.user.userId;
    const goalId = req.params.id;
    console.log("Updating goal:", goalId, "for athlete:", athleteId);
    
    const [updated] = await Goal.update(req.body, {
      where: { 
        id: goalId,
        athleteId: athleteId
      }
    });

    if (updated) {
      const updatedGoal = await Goal.findByPk(goalId);
      return res.json(updatedGoal);
    }

    res.status(404).json({ message: "Goal not found" });
  } catch (error) {
    console.error("Error updating goal:", error);
    res.status(500).json({ message: "Error updating goal", error: error.message });
  }
};

// Delete goal
export const deleteGoal = async (req, res) => {
  try {
    const athleteId = req.user.userId;
    const goalId = req.params.id;
    console.log("Deleting goal:", goalId, "for athlete:", athleteId);
    
    const deleted = await Goal.destroy({
      where: { 
        id: goalId,
        athleteId: athleteId
      }
    });

    if (deleted) {
      return res.json({ message: "Goal deleted successfully" });
    }

    res.status(404).json({ message: "Goal not found" });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({ message: "Error deleting goal", error: error.message });
  }
};

// ========================================
// EXERCISE RESULTS ROUTES
// ========================================

// Get exercise results
export const getExerciseResults = async (req, res) => {
  try {
    const athleteId = req.user.userId;
    console.log("Fetching exercise results for athlete:", athleteId);
    
    const results = await ExerciseResult.findAll({
      include: [{
        model: Exercise,
        as: 'exercise',
        attributes: ['id', 'name', 'description', 'category']
      }],
      where: { athleteId: athleteId },
      order: [['performedDate', 'DESC']]
    });

    console.log("Found exercise results:", results.length);
    res.json(results);
  } catch (error) {
    console.error("Error fetching exercise results:", error);
    res.status(500).json({ 
      message: "Error fetching exercise results", 
      error: error.message,
      stack: error.stack
    });
  }
};

// Record exercise result
export const recordExerciseResult = async (req, res) => {
  try {
    const athleteId = req.user.userId;
    console.log("Recording exercise result for athlete:", athleteId);
    console.log("Request body:", req.body);
    
    const newResult = await ExerciseResult.create({
      athleteId: athleteId,
      ...req.body
    });

    console.log("Created exercise result:", newResult.id);
    res.status(201).json(newResult);
  } catch (error) {
    console.error("Error recording exercise result:", error);
    res.status(500).json({ 
      message: "Error recording exercise result", 
      error: error.message,
      stack: error.stack
    });
  }
};

// ========================================
// STATISTICS & PROGRESS ROUTES
// ========================================

// Get statistics
export const getStatistics = async (req, res) => {
  try {
    const athleteId = req.user.userId;
    console.log("Fetching statistics for athlete:", athleteId);
    
    const totalWorkouts = await ExerciseResult.count({
      where: { athleteId: athleteId }
    });

    const totalGoals = await Goal.count({
      where: { athleteId: athleteId }
    });

    const completedGoals = await Goal.count({
      where: { 
        athleteId: athleteId,
        status: 'completed'
      }
    });

    const stats = {
      totalWorkouts,
      totalGoals,
      completedGoals,
      completionRate: totalGoals > 0 ? (completedGoals / totalGoals * 100).toFixed(1) : 0
    };

    console.log("Statistics:", stats);
    res.json(stats);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ message: "Error fetching statistics", error: error.message });
  }
};

// Get progress data
export const getProgress = async (req, res) => {
  try {
    const athleteId = req.user.userId;
    console.log("Fetching progress for athlete:", athleteId);
    
    const goals = await Goal.findAll({
      where: { 
        athleteId: athleteId,
        status: 'in_progress'
      },
      order: [['id', 'DESC']]  // Changed from createdAt to id
    });

    console.log("Found in-progress goals:", goals.length);
    res.json(goals);
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ message: "Error fetching progress", error: error.message });
  }
};

export default exports;
