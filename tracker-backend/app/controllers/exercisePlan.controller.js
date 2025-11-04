import db from "../models/index.js";
const ExercisePlan = db.exercisePlan;
const Exercise = db.exercise;
const ExercisePlanItem = db.exercisePlanItem; // ← Import this!
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
      created_by: req.user?.id || null,
    });

    // Add exercises with details if provided
    if (req.body.exercises && req.body.exercises.length > 0) {
      const exerciseItems = req.body.exercises.map(item => ({
        plan_id: plan.id,
        exercise_id: item.exercise_id,
        sets: item.sets || 3,
        reps: item.reps || '10',
        weight: item.weight || 0,
        order: item.order || 0
      }));
      
      try {
        await ExercisePlanItem.bulkCreate(exerciseItems);
        console.log('Successfully created exercise items:', exerciseItems.length);
      } catch (bulkError) {
        console.error('Error in bulkCreate:', bulkError);
        console.error('Exercise items being inserted:', JSON.stringify(exerciseItems, null, 2));
        throw bulkError;
      }
    }

    // Fetch the complete plan - THIS IS THE KEY PART
    const newPlan = await ExercisePlan.findByPk(plan.id, {
      include: [{
        model: Exercise,
        as: 'exercises',
        // Get the junction table data by querying separately
        through: {
          attributes: ['sets', 'reps', 'weight', 'order']
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
          attributes: ['sets', 'reps', 'weight', 'order']
        },
        attributes: ['id', 'name', 'category']
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
          attributes: ['sets', 'reps', 'weight', 'order']
        },
        attributes: ['id', 'name', 'category', 'difficulty', 'description']
      }]
    });
    
    if (!plan) {
      return res.status(404).send({ 
        message: `Exercise plan not found with id=${id}` 
      });
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
    console.log('=== UPDATE PLAN REQUEST ===');
    console.log('Plan ID:', req.params.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    const id = req.params.id;
    
    // First check if plan exists
    console.log('Step 0: Checking if plan exists...');
    const existingPlan = await ExercisePlan.findByPk(id);
    console.log('Existing plan:', existingPlan ? `Found (${existingPlan.name})` : 'Not found');
    
    if (!existingPlan) {
      console.log('ERROR: Plan does not exist with id:', id);
      return res.status(404).send({
        message: `Cannot update Exercise Plan with id=${id}. Plan not found!`
      });
    }
    
    // Update plan basic info
    console.log('Step 1: Updating plan basic info...');
    console.log('Old values:', { name: existingPlan.name, description: existingPlan.description });
    console.log('New values:', { name: req.body.name, description: req.body.description });
    
    const [updated] = await ExercisePlan.update({
      name: req.body.name,
      description: req.body.description
    }, {
      where: { id: id }
    });
    console.log('Plan updated result (rows affected):', updated);
    
    // Update exercises if provided
    console.log('Step 2: Checking exercises...', req.body.exercises ? 'Found' : 'None');
    if (req.body.exercises) {
      // Delete existing exercise items
      await ExercisePlanItem.destroy({
        where: { plan_id: id }
      });
      
      // Add new exercise items
      if (req.body.exercises.length > 0) {
        const exerciseItems = req.body.exercises.map(item => ({
          plan_id: id,
          exercise_id: item.exercise_id,
          sets: item.sets || 3,
          reps: item.reps || '10',
          weight: item.weight || 0,
          order: item.order || 0
        }));
        
        try {
          await ExercisePlanItem.bulkCreate(exerciseItems);
          console.log('Successfully updated exercise items:', exerciseItems.length);
        } catch (bulkError) {
          console.error('Error in update bulkCreate:', bulkError);
          console.error('Exercise items being inserted:', JSON.stringify(exerciseItems, null, 2));
          throw bulkError;
        }
      }
    }
    
    // Fetch updated plan with exercises
    console.log('Step 3: Fetching updated plan...');
    const updatedPlan = await ExercisePlan.findByPk(id, {
      include: [{
        model: Exercise,
        as: 'exercises',
        through: {
          attributes: ['sets', 'reps', 'weight', 'order']
        }
      }]
    });
    
    console.log('Step 4: Sending response...');
    res.send(updatedPlan);
    console.log('=== UPDATE COMPLETE ===');
  } catch (err) {
    console.error('=== ERROR IN UPDATE ===');
    console.error('Error updating exercise plan:', err);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
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
      message: `Could not delete Exercise Plan with id=${id}`
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
          attributes: ['sets', 'reps', 'weight', 'order']
        },
        attributes: ['id', 'name', 'category']
      }]
    });
    res.send(plans);
  } catch (err) {
    console.error('Error retrieving plans by difficulty:', err);
    res.status(500).send({
      message: `Error retrieving Exercise Plans with difficulty=${difficulty}`
    });
  }
};