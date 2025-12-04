import db from "../models/index.js";
const Goal = db.goal;
const User = db.user;
const Exercise = db.exercise;
const ExercisePlan = db.exercisePlan;
const { Op } = db.Sequelize;

// Get all goals for a specific athlete
export const getGoalsByAthlete = async (req, res) => {
  try {
    const athleteId = req.params.athleteId;
    
    const goals = await Goal.findAll({
      where: { athleteId: athleteId },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fName', 'lName', 'role'],
          required: false
        },
        {
          model: Exercise,
          as: 'exercise',
          attributes: ['id', 'name', 'muscleGroup'],
          required: false
        },
        {
          model: ExercisePlan,
          as: 'plan',
          attributes: ['id', 'name'],
          required: false
        }
      ],
      order: [['startDate', 'DESC']]
    });
    
    const mappedGoals = goals.map(goal => {
      const data = goal.toJSON();
      return {
        id: data.id,
        athleteId: data.athleteId,
        createdBy: data.createdBy,
        creatorName: data.creator ? `${data.creator.fName} ${data.creator.lName}` : null,
        creatorRole: data.creator?.role || null,
        exerciseId: data.exerciseId,
        exerciseName: data.exercise?.name || null,
        planId: data.planId,
        planName: data.plan?.name || null,
        title: data.title,
        description: data.description,
        targetValue: data.targetValue,
        currentValue: data.currentValue,
        unit: data.unit,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate,
        targetDate: data.endDate
      };
    });
    
    res.send(mappedGoals);
  } catch (err) {
    res.status(500).send({
      message: "Unable to load goals. Please try again."
    });
  }
};

// Get daily goals for an athlete (goals ending today or within next 7 days)
export const getDailyGoals = async (req, res) => {
  try {
    const athleteId = req.params.athleteId;
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const goals = await Goal.findAll({
      where: {
        athleteId: athleteId,
        status: 'active',
        endDate: {
          [Op.between]: [today, nextWeek]
        }
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fName', 'lName', 'role'],
          required: false
        },
        {
          model: Exercise,
          as: 'exercise',
          attributes: ['id', 'name', 'muscleGroup'],
          required: false
        },
        {
          model: ExercisePlan,
          as: 'plan',
          attributes: ['id', 'name'],
          required: false
        }
      ],
      order: [['endDate', 'ASC']]
    });
    
    const mappedGoals = goals.map(goal => {
      const data = goal.toJSON();
      const daysRemaining = Math.ceil((new Date(data.endDate) - today) / (1000 * 60 * 60 * 24));
      
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        targetValue: data.targetValue,
        currentValue: data.currentValue,
        unit: data.unit,
        endDate: data.endDate,
        daysRemaining: daysRemaining,
        progress: data.targetValue > 0 ? Math.min(Math.round((data.currentValue / data.targetValue) * 100), 100) : 0,
        exerciseName: data.exercise?.name || null,
        planName: data.plan?.name || null,
        creatorName: data.creator ? `${data.creator.fName} ${data.creator.lName}` : null,
        creatorRole: data.creator?.role || null
      };
    });
    
    res.send(mappedGoals);
  } catch (err) {
    res.status(500).send({
      message: "Unable to load daily goals. Please try again."
    });
  }
};

// Create a new goal
export const createGoal = async (req, res) => {
  try {
    if (!req.body.title) {
      return res.status(400).send({
        message: "Goal title is required"
      });
    }
    
    if (!req.body.athleteId) {
      return res.status(400).send({
        message: "Athlete ID is required"
      });
    }
    
    // Use the logged-in user's ID (coach) as creator
    const creatorId = req.user?.userId;
    
    const goal = await Goal.create({
      athleteId: req.body.athleteId,
      createdBy: creatorId,
      exerciseId: req.body.exerciseId || null,
      planId: req.body.planId || null,
      title: req.body.title,
      description: req.body.description,
      targetValue: req.body.targetValue,
      currentValue: req.body.currentValue || 0,
      unit: req.body.unit || 'count',
      status: req.body.status || 'active',
      startDate: req.body.startDate || new Date(),
      endDate: req.body.targetDate || req.body.endDate
    });
    
    const goalWithDetails = await Goal.findByPk(goal.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fName', 'lName', 'role'],
          required: false
        },
        {
          model: Exercise,
          as: 'exercise',
          attributes: ['id', 'name', 'muscleGroup'],
          required: false
        },
        {
          model: ExercisePlan,
          as: 'plan',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });
    
    res.status(201).send(goalWithDetails);
  } catch (err) {
    res.status(500).send({
      message: "Unable to create goal. Please try again."
    });
  }
};

// Update a goal
export const updateGoal = async (req, res) => {
  try {
    const id = req.params.id;
    
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      targetValue: req.body.targetValue,
      currentValue: req.body.currentValue,
      unit: req.body.unit,
      status: req.body.status,
      exerciseId: req.body.exerciseId,
      planId: req.body.planId,
      endDate: req.body.targetDate || req.body.endDate
    };
    
    const [updated] = await Goal.update(updateData, {
      where: { id: id }
    });
    
    if (updated === 1) {
      const updatedGoal = await Goal.findByPk(id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'fName', 'lName', 'role'],
            required: false
          },
          {
            model: Exercise,
            as: 'exercise',
            attributes: ['id', 'name', 'muscleGroup'],
            required: false
          },
          {
            model: ExercisePlan,
            as: 'plan',
            attributes: ['id', 'name'],
            required: false
          }
        ]
      });
      res.send(updatedGoal);
    } else {
      res.status(404).send({
        message: "Goal not found"
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Unable to update goal. Please try again."
    });
  }
};

// Delete a goal
export const deleteGoal = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Goal.destroy({
      where: { id: id }
    });
    
    if (deleted) {
      res.send({ message: "Goal deleted successfully" });
    } else {
      res.status(404).send({
        message: "Goal not found"
      });
    }
  } catch (err) {
    res.status(500).send({
      message: "Unable to delete goal. Please try again."
    });
  }
};

// Get all goals (admin)
export const getAllGoals = async (req, res) => {
  try {
    const goals = await Goal.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fName', 'lName', 'role'],
          required: false
        },
        {
          model: Exercise,
          as: 'exercise',
          attributes: ['id', 'name', 'muscleGroup'],
          required: false
        },
        {
          model: ExercisePlan,
          as: 'plan',
          attributes: ['id', 'name'],
          required: false
        }
      ],
      order: [['startDate', 'DESC']]
    });
    res.send(goals);
  } catch (err) {
    res.status(500).send({
      message: "Unable to load goals. Please try again."
    });
  }
};

// Get single goal by ID
export const getGoalById = async (req, res) => {
  try {
    const id = req.params.id;
    const goal = await Goal.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fName', 'lName', 'role'],
          required: false
        },
        {
          model: Exercise,
          as: 'exercise',
          attributes: ['id', 'name', 'muscleGroup'],
          required: false
        },
        {
          model: ExercisePlan,
          as: 'plan',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });
    
    if (!goal) {
      return res.status(404).send({
        message: "Goal not found"
      });
    }
    
    res.send(goal);
  } catch (err) {
    res.status(500).send({
      message: "Unable to load goal. Please try again."
    });
  }
};

// Get exercises from a specific plan (for goal creation)
export const getExercisesFromPlan = async (req, res) => {
  try {
    const planId = req.params.planId;
    
    const plan = await ExercisePlan.findByPk(planId, {
      include: [{
        model: Exercise,
        as: 'exercises',
        through: {
          attributes: ['sets', 'reps', 'durationSeconds', 'restSeconds']
        },
        attributes: ['id', 'name', 'muscleGroup', 'description']
      }]
    });
    
    if (!plan) {
      return res.status(404).send({
        message: "Training plan not found"
      });
    }
    
    res.send(plan.exercises || []);
  } catch (err) {
    res.status(500).send({
      message: "Unable to load exercises. Please try again."
    });
  }
};