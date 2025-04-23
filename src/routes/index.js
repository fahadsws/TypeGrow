const express = require("express");
const router = express.Router();


const userRoutes = require("./user.routes");
const authRoutes = require("./auth.routes");

router.use("/users", userRoutes);
router.use("/login", authRoutes);

module.exports = router;