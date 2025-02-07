const User = require("../models/userModel");

exports.createUser = async (req, res) => {
  try {
    const { telegramId, firstName, lastName, username } = req.body;

    // Check if user already exists
    let user = await User.findOne({ telegramId });
    if (user) {
      return res.status(200).json({ message: "User already exists", user });
    }

    // Create and save new user
    user = new User({ telegramId, firstName, lastName, username });
    await user.save();

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error("Error creating user: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Function to fetch all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from the database
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users: ", error);
    res.status(500).json({ message: "Server error" });
  }
};
