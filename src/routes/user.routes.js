const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const aiController = require("../controllers/assist.controller");
const verifyLinkedInToken = require("../middlewares/verifyLinkedInToken");

// Post Now 
router.post("/create-post",verifyLinkedInToken, userController.createPost);

// Post on Slot 
router.post("/create-post-slot", verifyLinkedInToken, userController.slotPost);

// Post on schedule 
router.post("/create-post-schedule", verifyLinkedInToken, userController.schedulePost);

// Slots 
router.post("/create-slot", verifyLinkedInToken, userController.createSlot);
router.get("/get-slots", verifyLinkedInToken, userController.getSlot);

// AI 
router.post("/AI-assist-V1", aiController.AIAssist);

module.exports = router;