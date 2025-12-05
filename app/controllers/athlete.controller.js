import db from "../models/index.js";

const AthleteProfile = db.athleteProfile;
const Goal = db.goal;
const ExerciseResult = db.exerciseResult;
const Exercise = db.exercise;
const User = db.user;
const AthletePlan = db.athletePlan;
const ExercisePlan = db.exercisePlan;
const ExercisePlanItem = db.exercisePlanItem;
const { Op } = db.Sequelize;

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

export const updateProfile = async (req, res) => {
  try {
    const athleteId = req.user.userId;
    console.log("Updating profile for athlete:", athleteId);
    console.log("Request body:", req.body);
    
    const existingProfile = await AthleteProfile.findOne({
      where: { athleteId: athleteId }
    });

    if (existingProfile) {
      console.log("✅ Profile exists, updating...");
      await AthleteProfile.update(req.body, {
        where: { athleteId: athleteId }
      });
      
      const updatedProfile = await AthleteProfile.findOne({
        where: { athleteId: athleteId }
      });
      
      return res.json(updatedProfile);
    } else {
      console.log("✅ Profile doesn't exist, creating...");
      const newProfile = await AthleteProfile.create({
        athleteId: athleteId,
        ...req.body
      });
      
      return res.status(201).json(newProfile);
    }
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res.status(500).json({ 
      message: "Error updating profile", 
      error: error.message,
      stack: error.stack
    });
  }
};

// Get athlete's goals
export const getGoals = async (req, res) => {
  try {
    const athleteId = req.user.userId;
    console.log("Fetching goals for athlete:", athleteId);
    
    const goals = await Goal.findAll({
      where: { athleteId: athleteId },
      include: [
        {
          model: Exercise,
          as: 'exercise',
          attributes: ['id', 'name', 'muscleGroup']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fName', 'lName']
        }
      ],
      order: [['startDate', 'DESC']] 
    });

    console.log("Found goals:", goals.length);
    res.json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({ message: "Error fetching goals", error: error.message });
  }
};

// ✨ NEW: Get exercises from assigned plans for goal creation
export const getAssignedPlanExercises = async (req, res) => {
  try {
    const athleteId = req.user.userId;
    console.log("📋 Fetching assigned plan exercises for athlete:", athleteId);
    
    // Get athlete's assigned plans
    const assignedPlans = await AthletePlan.findAll({
      where: { 
        athleteId: athleteId,
        status: 'active'
      },
      include: [{
        model: ExercisePlan,
        as: 'plan',
        include: [{
          model: Exercise,
          as: 'exercises',
          through: {
            attributes: ['sets', 'reps', 'durationSeconds']
          }
        }]
      }]
    });

    console.log(`✅ Found ${assignedPlans.length} assigned plans`);

    // Format the response with plan context
    const exercisesWithPlanInfo = [];
    
    for (const assignment of assignedPlans) {
      if (assignment.plan && assignment.plan.exercises) {
        for (const exercise of assignment.plan.exercises) {
          exercisesWithPlanInfo.push({
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            muscleGroup: exercise.muscleGroup,
            planId: assignment.plan.id,
            planName: assignment.plan.name,
            recommendedSets: exercise.ExercisePlanItem?.sets,
            recommendedReps: exercise.ExercisePlanItem?.reps,
            recommendedDuration: exercise.ExercisePlanItem?.durationSeconds
          });
        }
      }
    }

    // Remove duplicates (if exercise appears in multiple plans)
    const uniqueExercises = Array.from(
      new Map(exercisesWithPlanInfo.map(e => [e.exerciseId, e])).values()
    );

    console.log(`✅ Returning ${uniqueExercises.length} unique exercises`);
    res.json(uniqueExercises);
    
  } catch (error) {
    console.error("❌ Error fetching assigned plan exercises:", error);
    res.status(500).json({ 
      message: "Error fetching exercises", 
      error: error.message 
    });
  }
};

// Create new goal
export const createGoal = async (req, res) => {
  try {
    const athleteId = req.user.userId;
    console.log("Creating goal for athlete:", athleteId);
    
    const newGoal = await Goal.create({
      athleteId: athleteId,
      createdBy: athleteId, // Athlete creates their own goal
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

// Get exercise results
export const getExerciseResults = async (req, res) => {
  try {
    const athleteId = req.user.userId;
    console.log("Fetching exercise results for athlete:", athleteId);
    
    const results = await ExerciseResult.findAll({
      include: [{
        model: Exercise,
        as: 'exercise',
        attributes: ['id', 'name', 'description', 'muscleGroup']  
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

// ✨ UPDATED: Record exercise result with automatic goal progress update
export const recordExerciseResult = async (req, res) => {
  try {
    const athleteId = req.user.userId;
    console.log("📝 Recording exercise result for athlete:", athleteId);
    console.log("Request body:", req.body);
    
    // Create the exercise result
    const newResult = await ExerciseResult.create({
      athleteId: athleteId,
      ...req.body
    });

    console.log("✅ Created exercise result:", newResult.id);

    // ========================================
    // ✨ Automatic Goal Progress Update
    // ========================================
    try {
      const exerciseId = req.body.exerciseId;
      
      if (exerciseId) {
        console.log("🎯 Checking for related goals...");
        
        // Find all active goals for this athlete and exercise
        const relatedGoals = await Goal.findAll({
          where: {
            athleteId: athleteId,
            exerciseId: exerciseId,
            status: { [Op.in]: ['active', 'in_progress'] }
          }
        });

        console.log(`📊 Found ${relatedGoals.length} related goals`);

        for (const goal of relatedGoals) {
          let currentValue = 0;
          const targetValue = parseFloat(goal.targetValue);

          // Determine what metric to track based on unit
          if (goal.unit === 'lbs' || goal.unit === 'kg') {
            // Weight-based goal - find max weight
            const maxWeight = await ExerciseResult.max('weight', {
              where: { athleteId, exerciseId }
            });
            currentValue = maxWeight || 0;
            
          } else if (goal.unit === 'reps' || goal.unit === 'count') {
            // Reps-based goal - find max reps in single set
            const maxReps = await ExerciseResult.max('reps', {
              where: { athleteId, exerciseId }
            });
            currentValue = maxReps || 0;
            
          } else if (goal.unit === 'miles' || goal.unit === 'km') {
            // Distance-based goal - sum total distance
            const totalDistance = await ExerciseResult.sum('durationSeconds', {
              where: { athleteId, exerciseId }
            });
            currentValue = totalDistance || 0;
            
          } else if (goal.unit === 'minutes' || goal.unit === 'seconds') {
            // Duration-based goal - find max duration
            const maxDuration = await ExerciseResult.max('durationSeconds', {
              where: { athleteId, exerciseId }
            });
            currentValue = maxDuration || 0;
            
          } else {
            // Default: use reps
            const maxReps = await ExerciseResult.max('reps', {
              where: { athleteId, exerciseId }
            });
            currentValue = maxReps || 0;
          }

          // Update goal's current value
          await goal.update({
            currentValue: currentValue
          });

          console.log(`📈 Updated goal "${goal.title}": ${currentValue}/${targetValue} ${goal.unit}`);

          // Check if goal is achieved
          if (currentValue >= targetValue) {
            await goal.update({
              status: 'completed',
              updatedAt: new Date()
            });
            console.log(`🎉 Goal "${goal.title}" ACHIEVED!`);
          } else {
            // Calculate progress percentage
            const progress = ((currentValue / targetValue) * 100).toFixed(1);
            console.log(`📊 Goal progress: ${progress}%`);
          }
        }
      }

    } catch (goalError) {
      console.error("⚠️ Error updating goals:", goalError.message);
      // Don't fail the whole request if goal update fails
    }
    // ========================================

    console.log("✅ Exercise result recorded successfully");
    res.status(201).json(newResult);
    
  } catch (error) {
    console.error("❌ Error recording exercise result:", error);
    res.status(500).json({ 
      message: "Error recording exercise result", 
      error: error.message,
      stack: error.stack
    });
  }
};

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
        status: { [Op.in]: ['active', 'in_progress'] }
      },
      include: [{
        model: Exercise,
        as: 'exercise',
        attributes: ['id', 'name', 'muscleGroup']
      }],
      order: [['startDate', 'DESC']] 
    });

    console.log("Found active goals:", goals.length);
    res.json(goals);
  } catch (error) {
    console.error("Error fetching progress:", error);
    res.status(500).json({ message: "Error fetching progress", error: error.message });
  }
};