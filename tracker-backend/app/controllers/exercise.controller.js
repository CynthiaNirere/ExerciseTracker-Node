import db from "../models/index.js";
const ExerciseResult = db.exerciseResult;
const Exercise = db.exercise;
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
    
    // Convert Sequelize instances to plain objects
    const plainExercises = exercises.map(ex => ex.toJSON());
    
    console.log(`Found ${plainExercises.length} exercises`);
    console.log('First exercise:', plainExercises[0]);
    
    res.send(plainExercises);
  } catch (err) {
    console.error("Error fetching exercises:", err);
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
    console.error("Error fetching exercise:", err);
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
    console.error("Error creating exercise result:", err);
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
          required: false
        }
      ]
    });
    res.send(exerciseResults);
  } catch (err) {
    console.error("Error finding all exercise results:", err);
    res.status(500).send({ message: "Error retrieving exercise results." });
  }
};

// Find all Exercise Results by Athlete ID
export const findByAthlete = async (req, res) => {
  try {
    const athleteId = req.params.athleteId;
    
    console.log("Finding exercise results for athlete:", athleteId);
    
    // Get all exercise results for the athlete
    const exerciseResults = await ExerciseResult.findAll({ 
      where: { athleteId: athleteId },
      include: [
        {
          model: Exercise,
          as: 'exercise',
          attributes: ['id', 'name', 'description', 'muscleGroup'],
          required: false
        }
      ],
      order: [['performedDate', 'DESC']],
      raw: false
    });

    console.log(`Found ${exerciseResults.length} exercise results for athlete ${athleteId}`);
    
    // Map to a clean JSON response
    const results = exerciseResults.map(result => {
      const data = result.toJSON();
      return {
        ...data,
        exerciseName: data.exercise?.name || 'Unknown Exercise'
      };
    });
    
    res.send(results);
  } catch (err) {
    console.error("Error finding exercise results by athlete:", err);
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
          as: 'exercise'
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
    console.error("Error finding exercise result:", err);
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
    console.error("Error updating exercise result:", err);
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
    console.error("Error deleting exercise result:", err);
    res.status(500).send({ message: "Error deleting exercise result." });
  }
};

// Get Exercise Statistics for an Athlete
export const getStatistics = async (req, res) => {
  try {
    const athleteId = req.params.athleteId;
    
    const exerciseResults = await ExerciseResult.findAll({
      where: { athleteId: athleteId }
    });

    const totalWorkouts = exerciseResults.length;
    const totalDuration = exerciseResults.reduce((sum, ex) => sum + (ex.durationSeconds || 0), 0);
    const totalWeight = exerciseResults.reduce((sum, ex) => sum + (parseFloat(ex.weightUsed) || 0), 0);

    res.send({
      totalWorkouts,
      totalDurationMinutes: Math.round(totalDuration / 60),
      totalWeightLifted: totalWeight,
      avgDurationMinutes: totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts / 60) : 0
    });
  } catch (err) {
    console.error("Error fetching statistics:", err);
    res.status(500).send({ message: "Error fetching statistics." });
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
      category: req.body.category || null,
      description: req.body.description || null,
      instructions: req.body.instructions || null,
      difficulty: req.body.difficulty || null,
      muscleGroup: req.body.muscleGroups || req.body.muscleGroup || null,
      equipmentNeeded: req.body.equipment || req.body.equipmentNeeded || null,
      createdBy: req.user?.userId || 1
    });
    
    res.status(201).send(exercise);
  } catch (err) {
    console.error("Error creating exercise:", err);
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
    
    console.log('Updating exercise ID:', id);
    console.log('Update data:', req.body);
    
    const updateData = {
      name: req.body.name,
      category: req.body.category,
      description: req.body.description,
      instructions: req.body.instructions,
      difficulty: req.body.difficulty,
      muscleGroup: req.body.muscleGroups || req.body.muscleGroup,
      equipmentNeeded: req.body.equipment || req.body.equipmentNeeded
    };
    
    const [updated] = await Exercise.update(updateData, {
      where: { id: id }
    });
    
    if (updated === 1) {
      const exercise = await Exercise.findByPk(id, { raw: true });
      
      // Map the response to camelCase
      const mappedExercise = {
        id: exercise.exercise_id,
        name: exercise.name,
        category: exercise.category,
        description: exercise.description,
        instructions: exercise.instructions,
        difficulty: exercise.difficulty,
        muscleGroup: exercise.muscle_group,
        equipmentNeeded: exercise.equipment_needed,
        createdBy: exercise.created_by,
        createdAt: exercise.created_at
      };
      
      res.send(mappedExercise);
    } else {
      res.status(404).send({
        message: `Exercise not found with id=${id}`
      });
    }
  } catch (err) {
    console.error("Error updating exercise:", err);
    res.status(500).send({
      message: "Error updating exercise."
    });
  }
};

// Delete an exercise
export const deleteExercise = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Check if exercise exists first
    const exercise = await Exercise.findByPk(id);
    if (!exercise) {
      return res.status(404).send({ 
        message: `Exercise not found with id=${id}` 
      });
    }
    
    console.log(`Deleting exercise ${id} and all related records...`);
    
    // Delete related records first (foreign key constraints)
    // 1. Delete from exercise_plan_items (if you have this model)
    if (db.exercisePlanItem) {
      await db.exercisePlanItem.destroy({ 
        where: { exercise_id: id } 
      });
      console.log('Deleted exercise plan items');
    }
    
    // 2. Delete from exercise_results
    await ExerciseResult.destroy({ 
      where: { exerciseId: id } 
    });
    console.log('Deleted exercise results');
    
    // 3. Now delete the exercise
    const deleted = await Exercise.destroy({ where: { id: id } });
    
    if (deleted) {
      console.log('Exercise deleted successfully');
      return res.send({ message: "Exercise deleted successfully." });
    }
    
    return res.status(404).send({ 
      message: `Exercise not found with id=${id}` 
    });
    
  } catch (err) {
    console.error('Error deleting exercise:', err);
    console.error('Error message:', err.message);
    res.status(500).send({ 
      message: err.message || "Error deleting exercise." 
    });
  }
};