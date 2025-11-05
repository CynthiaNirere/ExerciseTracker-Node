import db from "../models/index.js";
const ExercisePlan = db.exercisePlan;
const Exercise = db.exercise;
const ExercisePlanItem = db.exercisePlanItem;
const { Op } = db.Sequelize;

// Create and Save a new Exercise Plan
export const create = async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).send({ message: "Plan name is required!" });
    }
    
    // Create the plan
    const plan = await ExercisePlan.create({
      name: req.body.name,
      description: req.body.description || null,
      created_by: req.user?.userId || null,
    });

    // Add exercises with details if provided
    if (req.body.exercises && req.body.exercises.length > 0) {
      const exerciseItems = req.body.exercises.map((item, index) => ({
        plan_id: plan.id,
        exercise_id: item.exercise_id,
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

    res.status(201).send(newPlan);
  } catch (err) {
    console.error('Error creating exercise plan:', err);
    res.status(500).send({
      message: err.message || "Error creating exercise plan."
    });
  }
};

// Retrieve all Exercise Plans
export const findAll = async (req, res) => {
  try {
    const plans = await ExercisePlan.findAll({
      include: [{
        model: Exercise,
        as: 'exercises',
        through: {
          attributes: ['sets', 'reps', 'weight', 'duration', 'rest_seconds', 'order']
        },
        // ✓ Use 'id' not 'exercise_id' - Sequelize will map it
        attributes: ['id', 'name', 'muscleGroup', 'category', 'difficulty']
      }],
      order: [['created_at', 'DESC']]
    });
    
    console.log('Found plans:', plans.length);
    res.send(plans);
  } catch (err) {
    console.error('Error retrieving exercise plans:', err);
    console.error('Error details:', err.message);
    res.status(500).send({ 
      message: err.message || "Error retrieving exercise plans." 
    });
  }
};

// Find one Exercise Plan by ID
export const findOne = async (req, res) => {
  try {
    const id = req.params.id;
    const plan = await ExercisePlan.findByPk(id, {
      include: [{
        model: Exercise,
        as: 'exercises',
        through: {
          attributes: ['sets', 'reps', 'weight', 'duration', 'rest_seconds', 'order']
        },
        // ✓ Use 'id' not 'exercise_id' - it will map to exercise_id
        attributes: ['id', 'name', 'muscleGroup', 'category', 'difficulty', 'description']
      }]
    });
    
    if (!plan) {
      return res.status(404).send({ 
        message: `Exercise plan not found with id=${id}` 
      });
    }
    
    // ✓ Add logging to see what we're returning
    console.log('📤 Returning plan:', plan.id);
    if (plan.exercises && plan.exercises.length > 0) {
      console.log('First exercise:', JSON.stringify(plan.exercises[0].toJSON(), null, 2));
    }
    
    res.send(plan);
  } catch (err) {
    console.error('Error retrieving exercise plan:', err);
    res.status(500).send({ 
      message: `Error retrieving exercise plan with id=${req.params.id}` 
    });
  }
};

// Update an Exercise Plan
export const update = async (req, res) => {
  try {
    const id = req.params.id;
    
    const existingPlan = await ExercisePlan.findByPk(id);
    
    if (!existingPlan) {
      return res.status(404).send({
        message: `Cannot update Exercise Plan with id=${id}. Plan not found!`
      });
    }
    
    // Update plan basic info
    await ExercisePlan.update({
      name: req.body.name,
      description: req.body.description
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
          exercise_id: item.exercise_id,
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
    
    res.send(updatedPlan);
  } catch (err) {
    console.error('Error updating exercise plan:', err);
    res.status(500).send({
      message: `Error updating Exercise Plan with id=${req.params.id}`
    });
  }
};

// Delete an Exercise Plan
export const remove = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Delete exercise items first
    await ExercisePlanItem.destroy({
      where: { plan_id: id }
    });
    
    // Delete the plan
    const deleted = await ExercisePlan.destroy({
      where: { id: id }
    });
    
    if (deleted) {
      return res.send({ 
        message: "Exercise Plan was deleted successfully!" 
      });
    }
    
    res.status(404).send({
      message: `Cannot delete Exercise Plan with id=${id}. Plan not found!`
    });
  } catch (err) {
    console.error('Error deleting exercise plan:', err);
    res.status(500).send({
      message: `Could not delete Exercise Plan with id=${id}`,
      error: err.message
    });
  }
};

// Find plans by difficulty
export const findByDifficulty = async (req, res) => {
  try {
    const difficulty = req.params.difficulty;
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
    res.send(plans);
  } catch (err) {
    console.error('Error retrieving plans by difficulty:', err);
    res.status(500).send({
      message: `Error retrieving Exercise Plans with difficulty=${difficulty}`,
      error: err.message
    });
  }
};