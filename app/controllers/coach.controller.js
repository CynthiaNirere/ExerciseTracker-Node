import db from "../models/index.js";

const User = db.user;
const AthleteProfile = db.athleteProfile;
const Coach = db.coach;
const ExerciseResult = db.exerciseResult;

// ========================================
// Get Coach's Athletes
// ========================================
export const getAthletes = async (req, res) => {
  try {
    const coachId = req.params.coachId || req.user?.userId;
    
    if (!coachId) {
      return res.status(400).json({ message: "Coach ID is required" });
    }

    const athletes = await User.findAll({
      where: { 
        role: 'athlete'
      },
      include: [{
        model: AthleteProfile,
        as: 'athleteProfile',
        where: { 
          coachId: coachId
        },
        required: true
      }],
      attributes: ['id', 'fName', 'lName', 'email', 'created_at']
    });

    // Get workout counts for all athletes with better error handling
    const formattedAthletes = await Promise.all(athletes.map(async (athlete) => {
      let totalWorkouts = 0;
      
      try {
        // Count unique workout dates - use the actual database column name
        const uniqueWorkoutDates = await db.sequelize.query(
          `SELECT DISTINCT performed_date FROM exercise_results WHERE athlete_id = ?`,
          {
            replacements: [athlete.id],
            type: db.Sequelize.QueryTypes.SELECT
          }
        );

        totalWorkouts = uniqueWorkoutDates.length;
      } catch (workoutError) {
        // If there's an error getting workout count, just set it to 0
        totalWorkouts = 0;
      }

      return {
        user_id: athlete.id,
        first_name: athlete.fName,
        last_name: athlete.lName,
        email: athlete.email,
        age: athlete.athleteProfile?.age || null,
        gender: athlete.athleteProfile?.gender || null,
        team: athlete.athleteProfile?.team || null,
        sport_type: athlete.athleteProfile?.sportType || null,
        bio: athlete.athleteProfile?.bio || null,
        totalWorkouts: totalWorkouts,
        activeGoals: 0,
        created_at: athlete.created_at
      };
    }));

    res.json(formattedAthletes);
    
  } catch (error) {
    res.status(500).json({ message: "Error fetching athletes", error: error.message });
  }
};

// ========================================
// Get Specific Athlete Details
// ========================================
export const getAthleteById = async (req, res) => {
  try {
    const { athleteId } = req.params;

    const athlete = await User.findOne({
      where: { 
        id: athleteId,
        role: 'athlete'
      },
      include: [{
        model: AthleteProfile,
        as: 'athleteProfile',
        required: false
      }],
      attributes: ['id', 'fName', 'lName', 'email', 'created_at']
    });

    if (!athlete) {
      return res.status(404).json({ message: "Athlete not found" });
    }

    let totalWorkouts = 0;
    
    try {
      // Get accurate workout count using raw query
      const uniqueWorkoutDates = await db.sequelize.query(
        `SELECT DISTINCT performed_date FROM exercise_results WHERE athlete_id = ?`,
        {
          replacements: [athlete.id],
          type: db.Sequelize.QueryTypes.SELECT
        }
      );

      totalWorkouts = uniqueWorkoutDates.length;
    } catch (workoutError) {
      totalWorkouts = 0;
    }

    const formattedAthlete = {
      user_id: athlete.id,
      first_name: athlete.fName,
      last_name: athlete.lName,
      email: athlete.email,
      age: athlete.athleteProfile?.age || null,
      gender: athlete.athleteProfile?.gender || null,
      team: athlete.athleteProfile?.team || null,
      sport_type: athlete.athleteProfile?.sportType || null,
      bio: athlete.athleteProfile?.bio || null,
      totalWorkouts: totalWorkouts,
      created_at: athlete.created_at
    };

    res.json(formattedAthlete);
    
  } catch (error) {
    res.status(500).json({ message: "Error fetching athlete", error: error.message });
  }
};

// ========================================
// Create New Athlete (Coach creates athlete)
// ========================================
export const createAthlete = async (req, res) => {
  try {
    const { 
      first_name, 
      last_name, 
      email, 
      role,
      coach_id,
      age, 
      gender, 
      team, 
      sport_type, 
      bio 
    } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const newUser = await User.create({
      fName: first_name,
      lName: last_name,
      email,
      password_hash: null,
      role: role || 'athlete'
    });

    if (age || gender || team || sport_type || bio || coach_id) {
      await AthleteProfile.create({
        athleteId: newUser.id,
        coachId: coach_id || null,
        age: age || null,
        gender: gender || null,
        team: team || null,
        sportType: sport_type || null,
        bio: bio || null
      });
    }

    res.status(201).json({ 
      message: "Athlete created successfully",
      athlete: {
        user_id: newUser.id,
        first_name: newUser.fName,
        last_name: newUser.lName,
        email: newUser.email
      }
    });
    
  } catch (error) {
    res.status(500).json({ message: "Error creating athlete", error: error.message });
  }
};

// ========================================
// Assign Athlete to Coach (Future Feature)
// ========================================
export const assignAthlete = async (req, res) => {
  try {
    const { athleteEmail, notes } = req.body;
    const coachId = req.user?.userId;
    
    res.json({ message: "Athlete assignment feature coming soon" });
    
  } catch (error) {
    res.status(500).json({ message: "Error assigning athlete", error: error.message });
  }
};

// ========================================
// Get Coach Profile
// ========================================
export const getCoachProfile = async (req, res) => {
  try {
    const coachId = req.params.coachId || req.user?.userId;

    const coach = await User.findOne({
      where: { 
        id: coachId,
        role: 'coach'
      },
      include: [{
        model: Coach,
        as: 'coachProfile',
        required: false
      }],
      attributes: ['id', 'fName', 'lName', 'email', 'created_at']
    });

    if (!coach) {
      return res.status(404).json({ message: "Coach not found" });
    }

    const formattedCoach = {
      user_id: coach.id,
      first_name: coach.fName,
      last_name: coach.lName,
      email: coach.email,
      experience_years: coach.coachProfile?.experienceYears || null,
      team: coach.coachProfile?.team || null,
      created_at: coach.created_at
    };

    res.json(formattedCoach);
    
  } catch (error) {
    res.status(500).json({ message: "Error fetching coach profile", error: error.message });
  }
};