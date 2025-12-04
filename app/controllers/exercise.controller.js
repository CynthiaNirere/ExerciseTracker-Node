import db from "../models/index.js";
const ExerciseResult = db.exerciseResult;
const Exercise = db.exercise;
const Goal = db.goal;
const ExercisePlan = db.exercisePlan;
const { Op } = db.Sequelize;

// ========================================
// EXERCISE MANAGEMENT (for getting exercise list)
// ========================================

// Get all exercises
export const getAllExercises = async (req, res) => {
  try {
    const exercises = await Exercise.findAll({
      order: [['name', 'ASC']]
    });
    
    const plainExercises = exercises.map(ex => ex.toJSON());
    
    res.send(plainExercises);
  } catch (err) {
    res.status(500).send({
      message: "Error retrieving exercises.",
      error: err.message
    });
  }
};

// Get single exercise by ID
export const getExerciseById = async (req, res) => {
  try {
    const id = req.params.id;
    const exercise = await Exercise.findByPk(id);
    
    if (!exercise) {
      return res.status(404).send({
        message: `Exercise not found with id=${id}`
      });
    }
    
    res.send(exercise);
  } catch (err) {
    res.status(500).send({
      message: "Error retrieving exercise."
    });
  }
};

// ========================================
// EXERCISE RESULTS MANAGEMENT
// ========================================

// Create and Save a new Exercise Result
export const create = async (req, res) => {
  try {
    if (!req.body.performedDate) {
      return res.status(400).send({ 
        message: "Performed date is required!" 
      });
    }

    if (!req.body.athleteId) {
      return res.status(400).send({ 
        message: "Athlete ID is required!" 
      });
    }

    const exerciseResult = await ExerciseResult.create({
      athleteId: req.body.athleteId,
      athletePlanId: req.body.athletePlanId || null,
      goalId: req.body.goalId || null,
      exerciseId: req.body.exerciseId || null,
      performedDate: req.body.performedDate,
      setsDone: req.body.setsDone || null,
      repsDone: req.body.repsDone || null,
      weightUsed: req.body.weightUsed || null,
      durationSeconds: req.body.durationSeconds || null,
      notes: req.body.notes || null,
    });

    res.status(201).send(exerciseResult);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Error creating exercise result.",
    });
  }
};

// Retrieve all Exercise Results
export const findAll = async (req, res) => {
  try {
    const exerciseResults = await ExerciseResult.findAll({ 
      order: [['performedDate', 'DESC']],
      include: [
        {
          model: Exercise,
          as: 'exercise',
          attributes: ['id', 'name', 'description', 'muscleGroup'],  
          required: false
        },
        {
          model: Goal,
          as: 'goal',
          attributes: ['id', 'title'],
          required: false
        }
      ]
    });
    res.send(exerciseResults);
  } catch (err) {
    res.status(500).send({ message: "Error retrieving exercise results." });
  }
};

// Find all Exercise Results by Athlete ID
export const findByAthlete = async (req, res) => {
  try {
    const athleteId = req.params.athleteId;
    
    const exerciseResults = await ExerciseResult.findAll({ 
      where: { athleteId: athleteId },
      include: [
        {
          model: Exercise,
          as: 'exercise',
          attributes: ['id', 'name', 'description', 'muscleGroup'], 
          required: false
        },
        {
          model: Goal,
          as: 'goal',
          attributes: ['id', 'title'],
          required: false
        },
        {
          model: db.athletePlan,
          as: 'athletePlan',
          attributes: ['id'],
          include: [{
            model: ExercisePlan,
            as: 'plan',
            attributes: ['id', 'name']
          }],
          required: false
        }
      ],
      order: [['performedDate', 'DESC']],
      raw: false
    });
    
    const results = exerciseResults.map(result => {
      const data = result.toJSON();
      return {
        ...data,
        exerciseName: data.exercise?.name || 'Unknown Exercise',
        goalTitle: data.goal?.title || null,
        planName: data.athletePlan?.plan?.name || null,
        source: data.goalId ? 'goal' : (data.athletePlanId ? 'plan' : 'manual')
      };
    });
    
    res.send(results);
  } catch (err) {
    res.status(500).send({ 
      message: "Error retrieving exercise results for athlete.",
      error: err.message
    });
  }
};

// Find one Exercise Result by ID
export const findOne = async (req, res) => {
  try {
    const id = req.params.id;
    const exerciseResult = await ExerciseResult.findByPk(id, {
      include: [
        {
          model: Exercise,
          as: 'exercise',
          attributes: ['id', 'name', 'description', 'muscleGroup']  
        },
        {
          model: Goal,
          as: 'goal',
          attributes: ['id', 'title'],
          required: false
        }
      ]
    });
    
    if (!exerciseResult) {
      return res.status(404).send({ 
        message: `Exercise result not found with id=${id}` 
      });
    }
    
    res.send(exerciseResult);
  } catch (err) {
    res.status(500).send({ message: "Error retrieving exercise result." });
  }
};

// Update an Exercise Result
export const update = async (req, res) => {
  try {
    const id = req.params.id;
    const [updated] = await ExerciseResult.update(req.body, { 
      where: { id: id } 
    });
    
    if (updated === 1) {
      res.send({ message: "Exercise result updated successfully." });
    } else {
      res.status(404).send({ 
        message: `Exercise result not found or no data changed.` 
      });
    }
  } catch (err) {
    res.status(500).send({ message: "Error updating exercise result." });
  }
};

// Delete an Exercise Result
export const remove = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await ExerciseResult.destroy({ where: { id: id } });
    
    if (deleted) {
      res.send({ message: "Exercise result deleted successfully." });
    } else {
      res.status(404).send({ message: `Exercise result not found.` });
    }
  } catch (err) {
    res.status(500).send({ message: "Error deleting exercise result." });
  }
};

// Get Exercise Statistics for an Athlete (FIXED TOTAL WORKOUTS COUNT)
export const getStatistics = async (req, res) => {
  try {
    const athleteId = req.params.athleteId;
    
    // Count unique workout dates using raw SQL to avoid column name issues
    const uniqueWorkoutDates = await db.sequelize.query(
      `SELECT DISTINCT performed_date FROM exercise_results WHERE athlete_id = ?`,
      {
        replacements: [athleteId],
        type: db.Sequelize.QueryTypes.SELECT
      }
    );

    const totalWorkouts = uniqueWorkoutDates.length;
    
    // Get all results for other statistics
    const exerciseResults = await ExerciseResult.findAll({
      where: { athleteId: athleteId }
    });

    const totalDuration = exerciseResults.reduce((sum, ex) => sum + (ex.durationSeconds || 0), 0);
    const totalWeight = exerciseResults.reduce((sum, ex) => sum + (parseFloat(ex.weightUsed) || 0), 0);

    res.send({
      totalWorkouts: totalWorkouts,
      totalExercises: exerciseResults.length,
      totalDurationMinutes: Math.round(totalDuration / 60),
      totalWeightLifted: totalWeight,
      avgDurationMinutes: totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts / 60) : 0
    });
  } catch (err) {
    res.status(500).send({ message: "Error fetching statistics.", error: err.message });
  }
};

// ========================================
// EXERCISE CRUD (Admin Management)
// ========================================

// Create a new exercise
export const createExercise = async (req, res) => {
  try {
    const exercise = await Exercise.create({
      name: req.body.name,
      description: req.body.description || null,
      muscleGroup: req.body.muscleGroups || req.body.muscleGroup || null,
      equipmentNeeded: req.body.equipment || req.body.equipmentNeeded || null,
      isStandard: req.body.isStandard || false,
      createdBy: req.user?.userId || 1
    });
    
    res.status(201).send(exercise);
  } catch (err) {
    res.status(500).send({
      message: "Error creating exercise.",
      error: err.message
    });
  }
};

// Update an exercise
export const updateExercise = async (req, res) => {
  try {
    const id = req.params.id;
    
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      muscleGroup: req.body.muscleGroups || req.body.muscleGroup,
      equipmentNeeded: req.body.equipment || req.body.equipmentNeeded,
      isStandard: req.body.isStandard
    };
    
    const [updated] = await Exercise.update(updateData, {
      where: { id: id }
    });
    
    if (updated === 1) {
      const exercise = await Exercise.findByPk(id);
      res.send(exercise);
    } else {
      res.status(404).send({
        message: `Exercise not found with id=${id}`
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error updating exercise."
    });
  }
};

// Delete an exercise
export const deleteExercise = async (req, res) => {
  try {
    const id = req.params.id;
    
    const exercise = await Exercise.findByPk(id);
    if (!exercise) {
      return res.status(404).send({ 
        message: `Exercise not found with id=${id}` 
      });
    }
    
    if (db.exercisePlanItem) {
      await db.exercisePlanItem.destroy({ 
        where: { exerciseId: id } 
      });
    }
    
    await ExerciseResult.destroy({ 
      where: { exerciseId: id } 
    });
    
    const deleted = await Exercise.destroy({ where: { id: id } });
    
    if (deleted) {
      return res.send({ message: "Exercise deleted successfully." });
    }
    
    return res.status(404).send({ 
      message: `Exercise not found with id=${id}` 
    });
    
  } catch (err) {
    res.status(500).send({ 
      message: err.message || "Error deleting exercise." 
    });
  }
};