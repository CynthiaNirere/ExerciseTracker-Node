import db from "../models/index.js";

const User = db.user;
const AthleteProfile = db.athleteProfile;
const Coach = db.coach;

// ========================================
// Get Coach's Athletes
// ========================================
export const getAthletes = async (req, res) => {
  try {
    const coachId = req.params.coachId || req.user?.userId;
    
    console.log("📥 GET /api/coach/:coachId/athletes");
    console.log("👤 Coach ID:", coachId);
    
    if (!coachId) {
      return res.status(400).json({ message: "Coach ID is required" });
    }

    // Find all athletes assigned to this coach
    const athletes = await User.findAll({
      where: { 
        role: 'athlete'
      },
      include: [{
        model: AthleteProfile,
        as: 'athleteProfile',
        where: { 
          coach_id: coachId  // ← FILTER BY COACH ID
        },
        required: true  // ← Changed to true so only athletes with profiles are returned
      }],
      attributes: ['user_id', 'first_name', 'last_name', 'email', 'created_at']
    });

    // Format response
    const formattedAthletes = athletes.map(athlete => ({
      user_id: athlete.user_id,
      first_name: athlete.first_name,
      last_name: athlete.last_name,
      email: athlete.email,
      age: athlete.athleteProfile?.age || null,
      gender: athlete.athleteProfile?.gender || null,
      team: athlete.athleteProfile?.team || null,
      sport_type: athlete.athleteProfile?.sport_type || null,
      bio: athlete.athleteProfile?.bio || null,
      totalWorkouts: 0,
      activeGoals: 0,
      created_at: athlete.created_at
    }));

    console.log(`✅ Found ${formattedAthletes.length} athletes for coach ${coachId}`);
    res.json(formattedAthletes);
    
  } catch (error) {
    console.error("❌ Error fetching athletes:", error);
    res.status(500).json({ message: "Error fetching athletes", error: error.message });
  }
};

// ========================================
// Get Specific Athlete Details
// ========================================
export const getAthleteById = async (req, res) => {
  try {
    const { athleteId } = req.params;
    
    console.log("📥 GET /api/athletes/:athleteId");
    console.log("👤 Athlete ID:", athleteId);

    const athlete = await User.findOne({
      where: { 
        user_id: athleteId,
        role: 'athlete'
      },
      include: [{
        model: AthleteProfile,
        as: 'athleteProfile',
        required: false
      }],
      attributes: ['user_id', 'first_name', 'last_name', 'email', 'created_at']
    });

    if (!athlete) {
      return res.status(404).json({ message: "Athlete not found" });
    }

    // Format response
    const formattedAthlete = {
      user_id: athlete.user_id,
      first_name: athlete.first_name,
      last_name: athlete.last_name,
      email: athlete.email,
      age: athlete.athleteProfile?.age || null,
      gender: athlete.athleteProfile?.gender || null,
      team: athlete.athleteProfile?.team || null,
      sport_type: athlete.athleteProfile?.sport_type || null,
      bio: athlete.athleteProfile?.bio || null,
      totalWorkouts: 0,
      created_at: athlete.created_at
    };

    console.log("✅ Athlete found");
    res.json(formattedAthlete);
    
  } catch (error) {
    console.error("❌ Error fetching athlete:", error);
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

    console.log("📥 POST /api/athletes");
    console.log("Creating athlete:", { first_name, last_name, email });

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Create user
    const newUser = await User.create({
      first_name,
      last_name,
      email,
      password_hash: null,
      role: role || 'athlete'
    });

   // Create athlete profile if any profile data is provided
if (age || gender || team || sport_type || bio || coach_id) {
  await AthleteProfile.create({
    athlete_id: newUser.user_id,
    coach_id: coach_id || null,  // ← ADD THIS
    age: age || null,
    gender: gender || null,
    team: team || null,
    sport_type: sport_type || null,
    bio: bio || null
  });
}

    console.log("✅ Athlete created successfully");
    res.status(201).json({ 
      message: "Athlete created successfully",
      athlete: {
        user_id: newUser.user_id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email
      }
    });
    
  } catch (error) {
    console.error("❌ Error creating athlete:", error);
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
    
    console.log("📥 POST /api/coach/athletes/assign");
    console.log("Athlete email:", athleteEmail);
    console.log("Coach ID:", coachId);
    
    res.json({ message: "Athlete assignment feature coming soon" });
    
  } catch (error) {
    console.error("❌ Error assigning athlete:", error);
    res.status(500).json({ message: "Error assigning athlete", error: error.message });
  }
};

// ========================================
// Get Coach Profile
// ========================================
export const getCoachProfile = async (req, res) => {
  try {
    const coachId = req.params.coachId || req.user?.userId;
    
    console.log("📥 GET /api/coach/:coachId/profile");
    console.log("👤 Coach ID:", coachId);

    const coach = await User.findOne({
      where: { 
        user_id: coachId,
        role: 'coach'
      },
      include: [{
        model: Coach,
        as: 'coachProfile',
        required: false
      }],
      attributes: ['user_id', 'first_name', 'last_name', 'email', 'created_at']
    });

    if (!coach) {
      return res.status(404).json({ message: "Coach not found" });
    }

    const formattedCoach = {
      user_id: coach.user_id,
      first_name: coach.first_name,
      last_name: coach.last_name,
      email: coach.email,
      experience_years: coach.coachProfile?.experienceYears || null,
      team: coach.coachProfile?.team || null,
      created_at: coach.created_at
    };

    console.log("✅ Coach profile found");
    res.json(formattedCoach);
    
  } catch (error) {
    console.error("❌ Error fetching coach profile:", error);
    res.status(500).json({ message: "Error fetching coach profile", error: error.message });
  }
};