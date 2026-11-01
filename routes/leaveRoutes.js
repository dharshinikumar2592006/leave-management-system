
const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Leave = require("../models/Leave");

// APPLY FOR LEAVE
router.post("/apply/:studentId", async (req, res) => {
    try {
        const { leaveType, numberOfDays, reason } = req.body;

        const student = await User.findById(req.params.studentId);

        if (!student || student.role !== "student") {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        if (!["casual", "medical"].includes(leaveType)) {
            return res.status(400).json({
                message: "Invalid leave type"
            });
        }

        if (!Number.isInteger(Number(numberOfDays)) ||
            Number(numberOfDays) <= 0) {
            return res.status(400).json({
                message: "Enter a valid number of leave days"
            });
        }

        if (!reason || !reason.trim()) {
            return res.status(400).json({
                message: "Leave reason is required"
            });
        }

        const application = new Leave({
            studentId: student._id,
            leaveType,
            numberOfDays: Number(numberOfDays),
            reason: reason.trim()
        });

        await application.save();

        console.log("--------------------------------");
        console.log("NEW LEAVE APPLICATION");
        console.log("Student:", student.username);
        console.log("Roll Number:", student.rollNumber);
        console.log("Leave Type:", leaveType);
        console.log("Days:", numberOfDays);
        console.log("Reason:", reason);
        console.log("Applied Date:", application.appliedDate);
        console.log("Status: Pending");
        console.log("--------------------------------");

        res.status(201).json({
            message: "Leave application submitted successfully",
            application
        });

    } catch (error) {
        console.error("Leave Application Error:", error.message);
        res.status(500).json({
            message: "Server error"
        });
    }
});

// STUDENT VIEW OWN APPLICATIONS
router.get("/my-leaves/:studentId", async (req, res) => {
    try {
        const student = await User.findById(req.params.studentId);

        if (!student || student.role !== "student") {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        const applications = await Leave.find({
            studentId: student._id
        }).sort({ appliedDate: -1 });

        console.log("Student viewed leave history:", student.rollNumber);

        res.json(applications);

    } catch (error) {
        console.error("Fetching Leaves Error:", error.message);
        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;
