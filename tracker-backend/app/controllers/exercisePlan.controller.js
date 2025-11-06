import db from "../models/index.js";
const ExercisePlan = db.exercisePlan;
const Exercise = db.exercise;
const ExercisePlanItem = db.exercisePlanItem;
const { Op } = db.Sequelize;

// ========================================
// Create and Save a new Exercise Plan
// ========================================
export const create = async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).send({ message: "Plan name is required!" });
    }
    
    console.log("📥 POST /exercise-plans - Creating plan:", req.body.name);
    
    // Create the plan
    const plan = await ExercisePlan.create({
      name: req.body.name,
      description: req.body.description || null,
      duration: req.body.duration || null,
      difficulty: req.body.difficulty || 'Intermediate',
      created_by: req.user?.userId || null,
    });

    // Add exercises with details if provided
    if (req.body.exercises && req.body.exercises.length > 0) {
      const exerciseItems = req.body.exercises.map((item, index) => ({
        plan_id: plan.id,
        exercise_id: typeof item === 'object' ? item.exercise_id : item, // Support both formats
        sets: item.sets || 3,
        reps: item.reps || '10',
        weight: item.weight || 0,
        duration: item.duration_seconds || null,
        rest_seconds: item.rest_seconds || 60,
        order: item.order !== undefined ? item.order : index
      }));
      
      await ExercisePlanItem.bulkCreate(exerciseItems);
    }

    // Fetch the complete plan with exercises
    const newPlan = await ExercisePlan.findByPk(plan.id, {
      include: [{
        model: Exercise,
        as: 'exercises',
        through: {
          attributes: ['sets', 'reps', 'weight', 'duration', 'rest_seconds', 'order']
        }
      }]
    });

    console.log("✅ Plan created successfully:", newPlan.id);
    
    // Format response for frontend
    const formattedPlan = {
      id: newPlan.id,
      name: newPlan.name,
      description: newPlan.description,
      duration: newPlan.duration,
      difficulty: newPlan.difficulty,
      assignedAthletes: 0, // TODO: Calculate from assignments
      exercises: newPlan.exercises ? newPlan.exercises.length : 0,
      exerciseList: newPlan.exercises || [],
      created_at: newPlan.created_at
    };

    res.status(201).send(formattedPlan);
  } catch (err) {
    console.error('❌ Error creating exercise plan:', err);
    res.status(500).send({
      message: err.message || "Error creating exercise plan."
    });
  }
};

// ========================================
// Retrieve all Exercise Plans
// ========================================
export const findAll = async (req, res) => {
  try {
    console.log("📥 GET /exercise-plans");
    
    const plans = await ExercisePlan.findAll({
      include: [{
        model: Exercise,
        as: 'exercises',
        through: {
          attributes: ['sets', 'reps', 'weight', 'duration', 'rest_seconds', 'order']
        },
        attributes: ['id', 'name', 'muscleGroup', 'category', 'difficulty']
      }],
      order: [['created_at', 'DESC']]
    });
    
    console.log(`✅ Found ${plans.length} plans`);
    
    // Format response for frontend (like teammate's controller)
    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      duration: plan.duration,
      difficulty: plan.difficulty,
      assignedAthletes: 0, // TODO: Calculate from assignments
      exercises: plan.exercises ? plan.exercises.length : 0,
      exerciseList: plan.exercises || [],
      created_at: plan.created_at
    }));
    
    res.send(formattedPlans);
  } catch (err) {
    console.error('❌ Error retrieving exercise plans:', err);
    res.status(500).send({ 
      message: err.message || "Error retrieving exercise plans." 
    });
  }
};

// ========================================
// Find one Exercise Plan by ID
// ========================================
export const findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    console.log("📥 GET /exercise-plans/:id", id);
    
    const plan = await ExercisePlan.findByPk(id, {
      include: [{
        model: Exercise,
        as: 'exercises',
        through: {
          attributes: ['sets', 'reps', 'weight', 'duration', 'rest_seconds', 'order']
        },
        attributes: ['id', 'name', 'muscleGroup', 'category', 'difficulty', 'description']
      }]
    });
    
    if (!plan) {
      return res.status(404).send({ 
        message: `Exercise plan not found with id=${id}` 
      });
    }
    
    console.log('✅ Plan found:', plan.id);
    
    // Format response
    const formattedPlan = {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      duration: plan.duration,
      difficulty: plan.difficulty,
      assignedAthletes: 0, // TODO: Calculate from assignments
      exercises: plan.exercises ? plan.exercises.length : 0,
      exerciseList: plan.exercises || [],
      created_at: plan.created_at
    };
    
    res.send(formattedPlan);
  } catch (err) {
    console.error('❌ Error retrieving exercise plan:', err);
    res.status(500).send({ 
      message: `Error retrieving exercise plan with id=${req.params.id}` 
    });
  }
};

// ========================================
// Update an Exercise Plan
// ========================================
export const update = async (req, res) => {
  try {
    const id = req.params.id;
    
    console.log("📥 PUT /exercise-plans/:id", id);
    
    const existingPlan = await ExercisePlan.findByPk(id);
    
    if (!existingPlan) {
      return res.status(404).send({
        message: `Cannot update Exercise Plan with id=${id}. Plan not found!`
      });
    }
    
    // Update plan basic info
    await ExercisePlan.update({
      name: req.body.name,
      description: req.body.description,
      duration: req.body.duration,
      difficulty: req.body.difficulty
    }, {
      where: { id: id }
    });
    
    // Update exercises if provided
    if (req.body.exercises !== undefined) {
      // Delete existing exercise items
      await ExercisePlanItem.destroy({
        where: { plan_id: id }
      });
      
      // Add new exercise items
      if (req.body.exercises.length > 0) {
        const exerciseItems = req.body.exercises.map((item, index) => ({
          plan_id: id,
          exercise_id: typeof item === 'object' ? item.exercise_id : item,
          sets: item.sets || 3,
          reps: item.reps || '10',
          weight: item.weight || 0,
          duration: item.duration_seconds || null,
          rest_seconds: item.rest_seconds || 60,
          order: item.order !== undefined ? item.order : index
        }));
        
        await ExercisePlanItem.bulkCreate(exerciseItems);
      }
    }
    
    // Fetch updated plan with exercises
    const updatedPlan = await ExercisePlan.findByPk(id, {
      include: [{
        model: Exercise,
        as: 'exercises',
        through: {
          attributes: ['sets', 'reps', 'weight', 'duration', 'rest_seconds', 'order']
        }
      }]
    });
    
    console.log("✅ Plan updated successfully");
    
    // Format response
    const formattedPlan = {
      id: updatedPlan.id,
      name: updatedPlan.name,
      description: updatedPlan.description,
      duration: updatedPlan.duration,
      difficulty: updatedPlan.difficulty,
      assignedAthletes: 0,
      exercises: updatedPlan.exercises ? updatedPlan.exercises.length : 0,
      exerciseList: updatedPlan.exercises || [],
      created_at: updatedPlan.created_at
    };
    
    res.send(formattedPlan);
  } catch (err) {
    console.error('❌ Error updating exercise plan:', err);
    res.status(500).send({
      message: `Error updating Exercise Plan with id=${req.params.id}`
    });
  }
};

// ========================================
// Delete an Exercise Plan
// ========================================
export const remove = async (req, res) => {
  try {
    const id = req.params.id;
    
    console.log("📥 DELETE /exercise-plans/:id", id);
    
    // Delete exercise items first
    await ExercisePlanItem.destroy({
      where: { plan_id: id }
    });
    
    // Delete the plan
    const deleted = await ExercisePlan.destroy({
      where: { id: id }
    });
    
    if (deleted) {
      console.log("✅ Plan deleted successfully");
      return res.send({ 
        message: "Exercise Plan was deleted successfully!" 
      });
    }
    
    res.status(404).send({
      message: `Cannot delete Exercise Plan with id=${id}. Plan not found!`
    });
  } catch (err) {
    console.error('❌ Error deleting exercise plan:', err);
    res.status(500).send({
      message: `Could not delete Exercise Plan with id=${id}`,
      error: err.message
    });
  }
};

// ========================================
// Find plans by difficulty
// ========================================
export const findByDifficulty = async (req, res) => {
  try {
    const difficulty = req.params.difficulty;
    
    console.log("📥 GET /exercise-plans/difficulty/:difficulty", difficulty);
    
    const plans = await ExercisePlan.findAll({
      where: { difficulty: difficulty },
      include: [{
        model: Exercise,
        as: 'exercises',
        through: {
          attributes: ['sets', 'reps', 'weight', 'duration', 'rest_seconds', 'order']
        },
        attributes: ['id', 'name', 'muscle_group', 'category']
      }]
    });
    
    console.log(`✅ Found ${plans.length} plans with difficulty: ${difficulty}`);
    
    // Format response
    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      duration: plan.duration,
      difficulty: plan.difficulty,
      assignedAthletes: 0,
      exercises: plan.exercises ? plan.exercises.length : 0,
      exerciseList: plan.exercises || []
    }));
    
    res.send(formattedPlans);
  } catch (err) {
    console.error('❌ Error retrieving plans by difficulty:', err);
    res.status(500).send({
      message: `Error retrieving Exercise Plans with difficulty=${difficulty}`,
      error: err.message
    });
  }
};

// ========================================
// Get plans by coach (Future feature)
// ========================================
export const findByCoach = async (req, res) => {
  try {
    const coachId = req.params.coachId;
    
    console.log("📥 GET /exercise-plans/coach/:coachId", coachId);
    
    const plans = await ExercisePlan.findAll({
      where: { created_by: coachId },
      include: [{
        model: Exercise,
        as: 'exercises',
        through: {
          attributes: ['sets', 'reps', 'weight', 'duration', 'rest_seconds', 'order']
        },
        attributes: ['id', 'name', 'muscleGroup', 'category', 'difficulty']
      }],
      order: [['created_at', 'DESC']]
    });
    
    console.log(`✅ Found ${plans.length} plans for coach: ${coachId}`);
    
    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      duration: plan.duration,
      difficulty: plan.difficulty,
      assignedAthletes: 0,
      exercises: plan.exercises ? plan.exercises.length : 0,
      exerciseList: plan.exercises || []
    }));
    
    res.send(formattedPlans);
  } catch (err) {
    console.error('❌ Error retrieving coach plans:', err);
    res.status(500).send({
      message: `Error retrieving plans for coach ${req.params.coachId}`,
      error: err.message
    });
  }
};