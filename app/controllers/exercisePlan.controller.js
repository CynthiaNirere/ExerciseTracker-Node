import db from "../models/index.js";

const ExercisePlan = db.exercisePlan;
const Exercise = db.exercise;
const ExercisePlanItem = db.exercisePlanItem;
const AthletePlan = db.athletePlan;
const { Op } = db.Sequelize;

// Retrieve all Exercise Plans
export const findAll = async (req, res) => {
  try {
    console.log("📋 Fetching all exercise plans...");
    
    const plans = await ExercisePlan.findAll({
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
    
    console.log(`✅ Found ${plans.length} plans`);
    
    // Count assigned athletes for each plan
    const formattedPlans = await Promise.all(plans.map(async (plan) => {
      const assignedCount = await AthletePlan.count({
        where: { planId: plan.id }
      });
      
      return {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        isStandard: plan.isStandard,
        assignedAthletes: assignedCount,
        exercises: plan.exercises ? plan.exercises.length : 0,
        exerciseList: plan.exercises || [],
        createdAt: plan.createdAt
      };
    }));
    
    res.send(formattedPlans);
  } catch (err) {
    console.error("❌ Error in findAll exercise plans:", err.message);
    console.error("Stack:", err.stack);
    res.status(500).send({ 
      message: "Unable to load training plans. Please try again.",
      error: err.message
    });
  }
};

// Create and Save a new Exercise Plan
export const create = async (req, res) => {
  try {
    console.log("📝 Creating new exercise plan:", req.body.name);
    
    if (!req.body.name) {
      return res.status(400).send({ message: "Plan name is required" });
    }
    
    const plan = await ExercisePlan.create({
      name: req.body.name,
      description: req.body.description || null,
      isStandard: req.body.isStandard || false,
      createdBy: req.user?.userId || 1,
    });

    console.log("✅ Plan created with ID:", plan.id);

    if (req.body.exercises && req.body.exercises.length > 0) {
      const exerciseItems = req.body.exercises.map((item, index) => ({
        planId: plan.id,
        exerciseId: typeof item === 'object' ? item.exercise_id : item,
        sets: item.sets || 3,
        reps: item.reps || 10,
        durationSeconds: item.duration_seconds || item.durationSeconds || null,
        restSeconds: item.rest_seconds || item.restSeconds || 60,
        orderIndex: item.order !== undefined ? item.order : index,
        notes: item.notes || null
      }));
      
      await ExercisePlanItem.bulkCreate(exerciseItems);
      console.log(`✅ Added ${exerciseItems.length} exercises to plan`);
    }

    const newPlan = await ExercisePlan.findByPk(plan.id, {
      include: [{
        model: Exercise,
        as: 'exercises',
        through: {
          attributes: ['sets', 'reps', 'durationSeconds', 'restSeconds', 'orderIndex']
        },
        attributes: ['id', 'name', 'muscleGroup', 'equipmentNeeded', 'description']
      }]
    });

    // Count assigned athletes
    const assignedCount = await AthletePlan.count({
      where: { planId: newPlan.id }
    });
    
    const formattedPlan = {
      id: newPlan.id,
      name: newPlan.name,
      description: newPlan.description,
      isStandard: newPlan.isStandard,
      assignedAthletes: assignedCount,
      exercises: newPlan.exercises ? newPlan.exercises.length : 0,
      exerciseList: newPlan.exercises || [],
      createdAt: newPlan.createdAt
    };

    res.status(201).send(formattedPlan);
  } catch (err) {
    console.error("❌ Error creating exercise plan:", err.message);
    console.error("Stack:", err.stack);
    res.status(500).send({
      message: "Unable to create training plan. Please try again.",
      error: err.message
    });
  }
};

// Find one Exercise Plan by ID
export const findOne = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("🔍 Fetching plan:", id);
    
    const plan = await ExercisePlan.findByPk(id, {
      include: [{
        model: Exercise,
        as: 'exercises',
        through: {
          attributes: ['sets', 'reps', 'durationSeconds', 'restSeconds', 'orderIndex']
        },
        attributes: ['id', 'name', 'muscleGroup', 'equipmentNeeded', 'description']
      }]
    });
    
    if (!plan) {
      return res.status(404).send({ 
        message: "Training plan not found" 
      });
    }
    
    // Count assigned athletes
    const assignedCount = await AthletePlan.count({
      where: { planId: plan.id }
    });
    
    const formattedPlan = {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      isStandard: plan.isStandard,
      assignedAthletes: assignedCount,
      exercises: plan.exercises ? plan.exercises.length : 0,
      exerciseList: plan.exercises || [],
      createdAt: plan.createdAt
    };
    
    console.log("✅ Plan found");
    res.send(formattedPlan);
  } catch (err) {
    console.error("❌ Error finding plan:", err.message);
    res.status(500).send({ 
      message: "Unable to load training plan. Please try again.",
      error: err.message
    });
  }
};

// Update an Exercise Plan
export const update = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("✏️ Updating plan:", id);
    
    const existingPlan = await ExercisePlan.findByPk(id);
    
    if (!existingPlan) {
      return res.status(404).send({
        message: "Training plan not found"
      });
    }
    
    await ExercisePlan.update({
      name: req.body.name,
      description: req.body.description,
      isStandard: req.body.isStandard
    }, {
      where: { id: id }
    });
    
    if (req.body.exercises !== undefined) {
      await ExercisePlanItem.destroy({
        where: { planId: id }
      });
      
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
    
    // Count assigned athletes
    const assignedCount = await AthletePlan.count({
      where: { planId: updatedPlan.id }
    });
    
    const formattedPlan = {
      id: updatedPlan.id,
      name: updatedPlan.name,
      description: updatedPlan.description,
      isStandard: updatedPlan.isStandard,
      assignedAthletes: assignedCount,
      exercises: updatedPlan.exercises ? updatedPlan.exercises.length : 0,
      exerciseList: updatedPlan.exercises || [],
      createdAt: updatedPlan.createdAt
    };
    
    console.log("✅ Plan updated");
    res.send(formattedPlan);
  } catch (err) {
    console.error("❌ Error updating plan:", err.message);
    res.status(500).send({
      message: "Unable to update training plan. Please try again.",
      error: err.message
    });
  }
};

// Delete an Exercise Plan
export const remove = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("🗑️ Deleting plan:", id);
    
    await ExercisePlanItem.destroy({
      where: { planId: id }
    });
    
    const deleted = await ExercisePlan.destroy({
      where: { id: id }
    });
    
    if (deleted) {
      console.log("✅ Plan deleted");
      return res.send({ 
        message: "Training plan deleted successfully" 
      });
    }
    
    res.status(404).send({
      message: "Training plan not found"
    });
  } catch (err) {
    console.error("❌ Error deleting plan:", err.message);
    res.status(500).send({
      message: "Unable to delete training plan. Please try again.",
      error: err.message
    });
  }
};

// Get plans by coach
export const findByCoach = async (req, res) => {
  try {
    const coachId = req.params.coachId;
    console.log("👨‍🏫 Fetching plans for coach:", coachId);
    
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
    
    // Count assigned athletes for each plan
    const formattedPlans = await Promise.all(plans.map(async (plan) => {
      const assignedCount = await AthletePlan.count({
        where: { planId: plan.id }
      });
      
      return {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        isStandard: plan.isStandard,
        assignedAthletes: assignedCount,
        exercises: plan.exercises ? plan.exercises.length : 0,
        exerciseList: plan.exercises || []
      };
    }));
    
    console.log(`✅ Found ${formattedPlans.length} plans for coach`);
    res.send(formattedPlans);
  } catch (err) {
    console.error("❌ Error fetching coach plans:", err.message);
    res.status(500).send({
      message: "Unable to load training plans. Please try again.",
      error: err.message
    });
  }
};

// Assign plan to athlete
export const assignPlanToAthlete = async (req, res) => {
  try {
    const { planId } = req.params;
    const { athleteId } = req.body;
    console.log(`📌 Assigning plan ${planId} to athlete ${athleteId}`);
    
    const plan = await ExercisePlan.findByPk(planId);
    if (!plan) {
      return res.status(404).json({ message: "Training plan not found" });
    }
    
    const athlete = await db.user.findByPk(athleteId);
    if (!athlete || athlete.role !== 'athlete') {
      return res.status(404).json({ message: "Athlete not found" });
    }
    
    const existingAssignment = await AthletePlan.findOne({
      where: { 
        athleteId: athleteId,
        planId: planId
      }
    });
    
    if (existingAssignment) {
      return res.status(400).json({ message: "This plan is already assigned to this athlete" });
    }
    
    const assignment = await AthletePlan.create({
      athleteId: athleteId,
      planId: planId,
      assignedBy: req.user?.userId || 1,
      assignedDate: new Date(),
      status: 'active'
    });
    
    console.log("✅ Plan assigned");
    res.status(201).json({
      message: "Training plan assigned successfully",
      assignment: assignment
    });
    
  } catch (err) {
    console.error("❌ Error assigning plan:", err.message);
    res.status(500).json({
      message: "Unable to assign training plan. Please try again.",
      error: err.message
    });
  }
};

// Get plans assigned to athlete
export const getAssignedPlans = async (req, res) => {
  try {
    const { athleteId } = req.params;
    console.log(`📋 Fetching assigned plans for athlete: ${athleteId}`);
    
    const assignments = await AthletePlan.findAll({
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
          attributes: ['id', 'name', 'muscleGroup', 'equipmentNeeded', 'description']
        }]
      }],
      order: [['assignedDate', 'DESC']]
    });
    
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
    
    console.log(`✅ Found ${formattedPlans.length} assigned plans`);
    res.json(formattedPlans);
    
  } catch (err) {
    console.error("❌ Error fetching assigned plans:", err.message);
    console.error("Stack:", err.stack);
    res.status(500).json({
      message: "Unable to load assigned plans. Please try again.",
      error: err.message
    });
  }
};

// Unassign plan from athlete
export const unassignPlanFromAthlete = async (req, res) => {
  try {
    const { planId, athleteId } = req.params;
    console.log(`📌 Unassigning plan ${planId} from athlete ${athleteId}`);
    
    const deleted = await AthletePlan.destroy({
      where: {
        planId: planId,
        athleteId: athleteId
      }
    });
    
    if (deleted) {
      console.log("✅ Plan unassigned");
      return res.json({ message: "Training plan unassigned successfully" });
    }
    
    res.status(404).json({ message: "Assignment not found" });
    
  } catch (err) {
    console.error("❌ Error unassigning plan:", err.message);
    res.status(500).json({
      message: "Unable to unassign training plan. Please try again.",
      error: err.message
    });
  }
};