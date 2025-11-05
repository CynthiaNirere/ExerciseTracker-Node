import db from '../models/index.js';

const User = db.users;
const Exercise = db.exercises;
const exports = {};

// Create new athlete
exports.createAthlete = async (req, res) => {
  try {
    console.log('Creating new athlete:', req.body);
    
    // Validate request
    if (!req.body.first_name || !req.body.last_name || !req.body.email) {
      return res.status(400).send({
        message: "First name, last name, and email are required!"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: req.body.email }
    });

    if (existingUser) {
      return res.status(400).json({
        message: "A user with this email already exists"
      });
    }

    // Create athlete
    const athlete = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password_hash: req.body.password || 'default123', // You should hash this in production
      role: 'athlete',
      age: req.body.age || null,
      height: req.body.height || null,
      weight: req.body.weight || null,
      bio: req.body.bio || null,
      training_goals: req.body.training_goals || null,
      injuries: req.body.injuries || null
    };

    // Save athlete in the database
    const newAthlete = await User.create(athlete);
    
    console.log('✅ Athlete created successfully:', newAthlete.user_id);

    res.status(201).json({
      message: "Athlete created successfully",
      athlete: {
        id: newAthlete.user_id,
        fName: newAthlete.first_name,
        lName: newAthlete.last_name,
        email: newAthlete.email,
        age: newAthlete.age,
        height: newAthlete.height,
        weight: newAthlete.weight
      }
    });

  } catch (error) {
    console.error('❌ Error creating athlete:', error);
    res.status(500).json({
      message: error.message || "Error occurred while creating athlete"
    });
  }
};

// Get athlete by ID
exports.getAthleteById = async (req, res) => {
  try {
    const athleteId = req.params.id;
    
    const athlete = await User.findOne({
      where: { 
        user_id: athleteId
      }
    });

    if (!athlete) {
      return res.status(404).json({ message: 'Athlete not found' });
    }

    const totalWorkouts = await Exercise.count({
      where: { created_by: athleteId }  // ← CHANGED from user_id to created_by
    });

    res.status(200).json({
      id: athlete.user_id,
      fName: athlete.first_name,
      lName: athlete.last_name,
      email: athlete.email,
      age: athlete.age,
      height: athlete.height,
      weight: athlete.weight,
      bio: athlete.bio,
      trainingGoals: athlete.training_goals,
      injuries: athlete.injuries,
      totalWorkouts: totalWorkouts
    });

  } catch (error) {
    console.error('Error fetching athlete:', error);
    res.status(500).json({ message: 'Error fetching athlete data', error: error.message });
  }
};

// Get athlete's goals
exports.getAthleteGoals = async (req, res) => {
  try {
    const athleteId = req.params.id;
    
    // TODO: Fetch goals from your goals table when you create it
    res.status(200).json([]);
    
  } catch (error) {
    console.error('Error fetching athlete goals:', error);
    res.status(500).json({ message: 'Error fetching goals', error: error.message });
  }
};

// Get athlete's workout results
exports.getAthleteResults = async (req, res) => {
  try {
    const athleteId = req.params.id;
    
    const results = await Exercise.findAll({
      where: { created_by: athleteId },  // ← CHANGED from user_id to created_by
      order: [['created_at', 'DESC']]     // ← CHANGED from date to created_at
    });

    const formattedResults = results.map(result => ({
      id: result.exercise_id,              // ← CHANGED from id to exercise_id
      date: result.created_at,             // ← CHANGED from date to created_at
      exercise: result.name,               // ← CHANGED from exercise to name
      sets: result.sets || '-',
      bestSet: result.bestSet || '-',
      notes: result.description || ''      // ← CHANGED from notes to description
    }));

    res.status(200).json(formattedResults);
    
  } catch (error) {
    console.error('Error fetching athlete results:', error);
    res.status(500).json({ message: 'Error fetching workout results', error: error.message });
  }
};

// Get all athletes for a coach
exports.getCoachAthletes = async (req, res) => {
  try {
    const coachId = req.params.coachId;
    
    console.log('📊 Fetching athletes for coach:', coachId);
    
    const athletes = await User.findAll({
      where: { role: 'athlete' },
      attributes: ['user_id', 'first_name', 'last_name', 'email', 'age', 'height', 'weight']
    });

    console.log('✅ Found', athletes.length, 'athletes');

    const athletesWithWorkouts = await Promise.all(
      athletes.map(async (athlete) => {
        const totalWorkouts = await Exercise.count({
          where: { created_by: athlete.user_id }  // ← CHANGED from user_id to created_by
        });
        
        return {
          id: athlete.user_id,
          fName: athlete.first_name,
          lName: athlete.last_name,
          email: athlete.email,
          age: athlete.age,
          height: athlete.height,
          weight: athlete.weight,
          totalWorkouts
        };
      })
    );

    console.log('✅ Returning athletes with workouts:', athletesWithWorkouts);
    res.status(200).json(athletesWithWorkouts);
    
  } catch (error) {
    console.error('❌ Error fetching athletes:', error);
    res.status(500).json({ message: 'Error fetching athletes', error: error.message });
  }
};

export default exports;