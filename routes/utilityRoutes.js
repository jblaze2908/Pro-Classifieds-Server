const express = require("express");
const router = express.Router();
const utilitiesHandler = require("../controllers/utilitiesHandler");
router.get("/getAllCity/:state", utilitiesHandler.cityByState);
module.exports = router;
