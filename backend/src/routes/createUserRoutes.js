const express = require("express");
const router = express.Router();
const {
  createUser,
  getAllUsers,
} = require("../controllers/createUserControllers");

router.post("/", createUser);
router.get("/all", getAllUsers); // Add this new GET route

module.exports = router;
