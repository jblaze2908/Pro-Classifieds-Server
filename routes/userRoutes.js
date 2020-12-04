const express = require("express");
const router = express.Router();
const userHandler = require("../controllers/userHandler");
const checkAuth = require("../middleware/checkAuth");
router.post("/login", userHandler.login);
router.post("/add_user", userHandler.create_account);
router.get("/fetch_profile", checkAuth, userHandler.fetchProfile);
router.post("/update_profile", checkAuth, userHandler.updateProfile);
module.exports = router;
