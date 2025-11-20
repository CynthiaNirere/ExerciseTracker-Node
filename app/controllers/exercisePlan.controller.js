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
    console.log("User from auth:", req.user);
    
    // Create the plan
    const plan = await ExercisePlan.create({
      name: req.body.name,
      description: req.body.description || null,
      isStandard: req.body.isStandard || false,
      createdBy: req.user?.userId || 1,  // ✅ FIXED: Use createdBy and get from req.user
    });

    // Add exercises with details if provided
    if (req.body.exercises && req.body.exercises.length > 0) {
      const exerciseItems = req.body.exercises.map((item, index) => ({
        planId: plan.id,  // ✅ FIXED: Use camelCase
        exerciseId: typeof item === 'object' ? item.exercise_id : item,  // ✅ FIXED: Use camelCase
        sets: item.sets || 3,
        reps: item.reps || 10,
        durationSeconds: item.duration_seconds || item.durationSeconds || null,  // ✅ FIXED
        restSeconds: item.rest_seconds || item.restSeconds || 60,  // ✅ FIXED
        orderIndex: item.order !== undefined ? item.order : index,  // ✅ FIXED
        notes: item.notes || null
      }));
      
      await ExercisePlanItem.bulkCreate(exerciseItems);
    }

    // Fetch the complete plan with exercises
    const newPlan = await ExercisePlan.findByPk(plan.id, {
      include: [{
        model: Exercise,
        as: 'exercises',
        through: {
          attributes: ['sets', 'reps', 'durationSeconds', 'restSeconds', 'orderIndex']
        },
        attributes: ['id', 'name', 'muscleGroup', 'equipmentNeeded', 'description']  // ✅ REMOVED category, difficulty
      }]
    });

    console.log("✅ Plan created successfully:", newPlan.id);
    
    // Format response for frontend
    const formattedPlan = {
      id: newPlan.id,
      name: newPlan.name,
      description: newPlan.description,
      isStandard: newPlan.isStandard,
      assignedAthletes: 0,
      exercises: newPlan.exercises ? newPlan.exercises.length : 0,
      exerciseList: newPlan.exercises || [],
      createdAt: newPlan.createdAt
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
          attributes: ['sets', 'reps', 'durationSeconds', 'restSeconds', 'orderIndex']
        },
        attributes: ['id', 'name', 'muscleGroup', 'equipmentNeeded']  // ✅ REMOVED category, difficulty
      }],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`✅ Found ${plans.length} plans`);
    
    // Format response for frontend
    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      isStandard: plan.isStandard,
      assignedAthletes: 0,
      exercises: plan.exercises ? plan.exercises.length : 0,
      exerciseList: plan.exercises || [],
      createdAt: plan.createdAt
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
          attributes: ['sets', 'reps', 'durationSeconds', 'restSeconds', 'orderIndex']
        },
        attributes: ['id', 'name', 'muscleGroup', 'equipmentNeeded', 'description']  // ✅ REMOVED category, difficulty
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
      isStandard: plan.isStandard,
      assignedAthletes: 0,
      exercises: plan.exercises ? plan.exercises.length : 0,
      exerciseList: plan.exercises || [],
      createdAt: plan.createdAt
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
      isStandard: req.body.isStandard
    }, {
      where: { id: id }
    });
    
    // Update exercises if provided
    if (req.body.exercises !== undefined) {
      // Delete existing exercise items
      await ExercisePlanItem.destroy({
        where: { planId: id }
      });
      
      // Add new exercise items
      if (req.body.exercises.length > 0) {
        const exerciseItems = req.body.exercises.map((item, index) => ({
          planId: id,
          exerciseId: typeof item === 'object' ? item.exercise_id : item,
          sets: item.sets || 3,
          reps: item.reps || 10,
          durationSeconds: item.duration_seconds || item.durationSeconds || null,
          restSeconds: item.rest_seconds || item.restSeconds || 60,
          orderIndex: item.order !== undefined ? item.order : index,
          notes: item.notes || null
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
          attributes: ['sets', 'reps', 'durationSeconds', 'restSeconds', 'orderIndex']
        },
        attributes: ['id', 'name', 'muscleGroup', 'equipmentNeeded']
      }]
    });
    
    console.log("✅ Plan updated successfully");
    
    // Format response
    const formattedPlan = {
      id: updatedPlan.id,
      name: updatedPlan.name,
      description: updatedPlan.description,
      isStandard: updatedPlan.isStandard,
      assignedAthletes: 0,
      exercises: updatedPlan.exercises ? updatedPlan.exercises.length : 0,
      exerciseList: updatedPlan.exercises || [],
      createdAt: updatedPlan.createdAt
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
    
    // Delete exercise items first (CASCADE should handle this, but being explicit)
    await ExercisePlanItem.destroy({
      where: { planId: id }
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
// Find plans by difficulty (NOT NEEDED - REMOVE THIS IF NO DIFFICULTY)
// ========================================
export const findByDifficulty = async (req, res) => {
  res.status(501).send({ message: "Difficulty filtering not implemented - field does not exist" });
};

// ========================================
// Get plans by coach
// ========================================
export const findByCoach = async (req, res) => {
  try {
    const coachId = req.params.coachId;
    
    console.log("📥 GET /exercise-plans/coach/:coachId", coachId);
    
    const plans = await ExercisePlan.findAll({
      where: { createdBy: coachId },
      include: [{
        model: Exercise,
        as: 'exercises',
        through: {
          attributes: ['sets', 'reps', 'durationSeconds', 'restSeconds', 'orderIndex']
        },
        attributes: ['id', 'name', 'muscleGroup', 'equipmentNeeded']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`✅ Found ${plans.length} plans for coach: ${coachId}`);
    
    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      isStandard: plan.isStandard,
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

// ========================================
// ASSIGN PLAN TO ATHLETE
// ========================================
export const assignPlanToAthlete = async (req, res) => {
  try {
    const { planId } = req.params;
    const { athleteId } = req.body;
    
    console.log("📥 POST /exercise-plans/:planId/assign");
    console.log("Plan ID:", planId);
    console.log("Athlete ID:", athleteId);
    
    // Check if plan exists
    const plan = await ExercisePlan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    
    // Check if athlete exists
    const athlete = await db.user.findByPk(athleteId);
    if (!athlete || athlete.role !== 'athlete') {
      return res.status(404).json({ message: "Athlete not found" });
    }
    
    // Check if already assigned
    const existingAssignment = await db.athletePlan.findOne({
      where: { 
        athleteId: athleteId,
        planId: planId
      }
    });
    
    if (existingAssignment) {
      return res.status(400).json({ message: "Plan already assigned to this athlete" });
    }
    
    // Create assignment
    const assignment = await db.athletePlan.create({
      athleteId: athleteId,
      planId: planId,
      assignedBy: req.user?.userId || 1,  // ✅ ADDED
      assignedDate: new Date(),
      status: 'active'
    });
    
    console.log("✅ Plan assigned successfully");
    
    res.status(201).json({
      message: "Plan assigned successfully",
      assignment: assignment
    });
    
  } catch (err) {
    console.error('❌ Error assigning plan:', err);
    res.status(500).json({
      message: "Error assigning plan to athlete",
      error: err.message
    });
  }
};

// ========================================
// GET PLANS ASSIGNED TO ATHLETE
// ========================================
export const getAssignedPlans = async (req, res) => {
  try {
    const { athleteId } = req.params;
    
    console.log("📥 GET /exercise-plans/athlete/:athleteId");
    console.log("Athlete ID:", athleteId);
    
    // Get all assigned plans with details
    const assignments = await db.athletePlan.findAll({
      where: { athleteId: athleteId },
      include: [{
        model: ExercisePlan,
        as: 'plan',
        include: [{
          model: Exercise,
          as: 'exercises',
          through: {
            attributes: ['sets', 'reps', 'durationSeconds', 'restSeconds', 'orderIndex']
          },
          attributes: ['id', 'name', 'muscleGroup', 'equipmentNeeded', 'description']  // ✅ REMOVED category, difficulty
        }]
      }],
      order: [['assignedDate', 'DESC']]
    });
    
    console.log(`✅ Found ${assignments.length} assigned plans`);
    
    // Format response
    const formattedPlans = assignments.map(assignment => ({
      assignmentId: assignment.id,
      assignedDate: assignment.assignedDate,
      status: assignment.status,
      plan: {
        id: assignment.plan.id,
        name: assignment.plan.name,
        description: assignment.plan.description,
        exercises: assignment.plan.exercises || [],
        exerciseCount: assignment.plan.exercises ? assignment.plan.exercises.length : 0
      }
    }));
    
    res.json(formattedPlans);
    
  } catch (err) {
    console.error('❌ Error fetching assigned plans:', err);
    res.status(500).json({
      message: "Error fetching assigned plans",
      error: err.message
    });
  }
};

// ========================================
// UNASSIGN PLAN FROM ATHLETE
// ========================================
export const unassignPlanFromAthlete = async (req, res) => {
  try {
    const { planId, athleteId } = req.params;
    
    console.log("📥 DELETE /exercise-plans/:planId/assign/:athleteId");
    
    const deleted = await db.athletePlan.destroy({
      where: {
        planId: planId,
        athleteId: athleteId
      }
    });
    
    if (deleted) {
      console.log("✅ Plan unassigned successfully");
      return res.json({ message: "Plan unassigned successfully" });
    }
    
    res.status(404).json({ message: "Assignment not found" });
    
  } catch (err) {
    console.error('❌ Error unassigning plan:', err);
    res.status(500).json({
      message: "Error unassigning plan",
      error: err.message
    });
  }
};