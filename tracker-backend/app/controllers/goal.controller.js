import db from '../models/index.js';

const Goal = db.goals;
const User = db.users;
const exports = {};

// Create a new goal
exports.createGoal = async (req, res) => {
  try {
    console.log('Creating goal:', req.body);

    // Validate request
    if (!req.body.user_id || !req.body.exercise || !req.body.goal_type || !req.body.target_value || !req.body.deadline) {
      return res.status(400).json({
        message: "User ID, exercise, goal type, target value, and deadline are required!"
      });
    }

    // Create goal
    const goal = {
      user_id: req.body.user_id,
      exercise: req.body.exercise,
      goal_type: req.body.goal_type,
      current_value: req.body.current_value || 0,
      target_value: req.body.target_value,
      deadline: req.body.deadline,
      status: 'active'
    };

    const newGoal = await Goal.create(goal);
    
    console.log('✅ Goal created:', newGoal.goal_id);

    // Calculate progress
    const progress = Math.round((parseFloat(newGoal.current_value) / parseFloat(newGoal.target_value)) * 100);

    res.status(201).json({
      message: "Goal created successfully",
      goal: {
        id: newGoal.goal_id,
        userId: newGoal.user_id,
        exercise: newGoal.exercise,
        type: newGoal.goal_type,
        currentValue: parseFloat(newGoal.current_value),
        targetValue: parseFloat(newGoal.target_value),
        deadline: newGoal.deadline,
        status: newGoal.status,
        progress: progress
      }
    });

  } catch (error) {
    console.error('❌ Error creating goal:', error);
    res.status(500).json({
      message: error.message || "Error occurred while creating goal"
    });
  }
};

// Get all goals for an athlete
exports.getAthleteGoals = async (req, res) => {
  try {
    const athleteId = req.params.athleteId;
    
    console.log('📊 Fetching goals for athlete:', athleteId);
    console.log('📊 Type of athleteId:', typeof athleteId);
    console.log('📊 Parsed athleteId:', parseInt(athleteId));

    // Try to get ALL goals first to see what's in the database
    const allGoals = await Goal.findAll({
      raw: true
    });
    
    console.log('📊 ALL goals in database:', JSON.stringify(allGoals, null, 2));

    // Now try to get goals for this specific athlete
    const goals = await Goal.findAll({
      where: { user_id: parseInt(athleteId) },
      order: [['created_at', 'DESC']],
      raw: true
    });

    console.log('✅ Found', goals.length, 'goals for athlete', athleteId);
    console.log('✅ Goals:', JSON.stringify(goals, null, 2));

    // Format goals with progress calculation
    const formattedGoals = goals.map(goal => {
      const progress = Math.round((parseFloat(goal.current_value) / parseFloat(goal.target_value)) * 100);
      
      return {
        id: goal.goal_id,
        userId: goal.user_id,
        exercise: goal.exercise,
        type: goal.goal_type,
        currentValue: parseFloat(goal.current_value),
        targetValue: parseFloat(goal.target_value),
        deadline: goal.deadline,
        status: goal.status,
        progress: progress
      };
    });

    console.log('✅ Formatted goals:', JSON.stringify(formattedGoals, null, 2));

    res.status(200).json(formattedGoals);

  } catch (error) {
    console.error('❌ Error fetching goals:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ message: 'Error fetching goals', error: error.message });
  }
};

// Update a goal
exports.updateGoal = async (req, res) => {
  try {
    const goalId = req.params.id;
    
    console.log('Updating goal:', goalId, req.body);

    const goal = await Goal.findOne({
      where: { goal_id: goalId }
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Update goal
    await Goal.update(req.body, {
      where: { goal_id: goalId }
    });

    // Fetch updated goal
    const updatedGoal = await Goal.findOne({
      where: { goal_id: goalId }
    });

    const progress = Math.round((parseFloat(updatedGoal.current_value) / parseFloat(updatedGoal.target_value)) * 100);

    res.status(200).json({
      message: "Goal updated successfully",
      goal: {
        id: updatedGoal.goal_id,
        userId: updatedGoal.user_id,
        exercise: updatedGoal.exercise,
        type: updatedGoal.goal_type,
        currentValue: parseFloat(updatedGoal.current_value),
        targetValue: parseFloat(updatedGoal.target_value),
        deadline: updatedGoal.deadline,
        status: updatedGoal.status,
        progress: progress
      }
    });

  } catch (error) {
    console.error('❌ Error updating goal:', error);
    res.status(500).json({ message: 'Error updating goal', error: error.message });
  }
};

// Delete a goal
exports.deleteGoal = async (req, res) => {
  try {
    const goalId = req.params.id;
    
    console.log('Deleting goal:', goalId);

    const goal = await Goal.findOne({
      where: { goal_id: goalId }
    });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    await Goal.destroy({
      where: { goal_id: goalId }
    });

    console.log('✅ Goal deleted');

    res.status(200).json({ message: 'Goal deleted successfully' });

  } catch (error) {
    console.error('❌ Error deleting goal:', error);
    res.status(500).json({ message: 'Error deleting goal', error: error.message });
  }
};

export default exports;