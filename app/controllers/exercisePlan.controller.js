import db from "../models/index.js";
const ExercisePlan = db.exercisePlan;
const Exercise = db.exercise;
const ExercisePlanItem = db.exercisePlanItem;
const AthletePlan = db.athletePlan;
const { Op } = db.Sequelize;

// Create and Save a new Exercise Plan
export const create = async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).send({ message: "Plan name is required" });
    }
    
    const plan = await ExercisePlan.create({
      name: req.body.name,
      description: req.body.description || null,
      isStandard: req.body.isStandard || false,
      createdBy: req.user?.userId || 1,
    });

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
    res.status(500).send({
      message: "Unable to create training plan. Please try again."
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
        exerciseList: plan.exercises || [],
        createdAt: plan.createdAt
      };
    }));
    
    res.send(formattedPlans);
  } catch (err) {
    res.status(500).send({ 
      message: "Unable to load training plans. Please try again." 
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
    
    res.send(formattedPlan);
  } catch (err) {
    res.status(500).send({ 
      message: "Unable to load training plan. Please try again." 
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
    
    res.send(formattedPlan);
  } catch (err) {
    res.status(500).send({
      message: "Unable to update training plan. Please try again."
    });
  }
};

// Delete an Exercise Plan
export const remove = async (req, res) => {
  try {
    const id = req.params.id;
    
    await ExercisePlanItem.destroy({
      where: { planId: id }
    });
    
    const deleted = await ExercisePlan.destroy({
      where: { id: id }
    });
    
    if (deleted) {
      return res.send({ 
        message: "Training plan deleted successfully" 
      });
    }
    
    res.status(404).send({
      message: "Training plan not found"
    });
  } catch (err) {
    res.status(500).send({
      message: "Unable to delete training plan. Please try again."
    });
  }
};

// Get plans by coach
export const findByCoach = async (req, res) => {
  try {
    const coachId = req.params.coachId;
    
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
    
    res.send(formattedPlans);
  } catch (err) {
    res.status(500).send({
      message: "Unable to load training plans. Please try again."
    });
  }
};

// Assign plan to athlete
export const assignPlanToAthlete = async (req, res) => {
  try {
    const { planId } = req.params;
    const { athleteId } = req.body;
    
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
    
    res.status(201).json({
      message: "Training plan assigned successfully",
      assignment: assignment
    });
    
  } catch (err) {
    res.status(500).json({
      message: "Unable to assign training plan. Please try again."
    });
  }
};

// Get plans assigned to athlete
export const getAssignedPlans = async (req, res) => {
  try {
    const { athleteId } = req.params;
    
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
    
    res.json(formattedPlans);
    
  } catch (err) {
    res.status(500).json({
      message: "Unable to load assigned plans. Please try again."
    });
  }
};

// Unassign plan from athlete
export const unassignPlanFromAthlete = async (req, res) => {
  try {
    const { planId, athleteId } = req.params;
    
    const deleted = await AthletePlan.destroy({
      where: {
        planId: planId,
        athleteId: athleteId
      }
    });
    
    if (deleted) {
      return res.json({ message: "Training plan unassigned successfully" });
    }
    
    res.status(404).json({ message: "Assignment not found" });
    
  } catch (err) {
    res.status(500).json({
      message: "Unable to unassign training plan. Please try again."
    });
  }
};