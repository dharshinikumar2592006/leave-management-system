
const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Leave = require("../models/Leave");

// CHECK STAFF ROLE
async function verifyStaff(req, res, next) {
    try {
        const staffId = req.headers["x-user-id"];

        if (!staffId) {
            return res.status(401).json({
                message: "Staff login required"
            });
        }

        const staff = await User.findById(staffId);

        if (!staff || staff.role !== "staff") {
            return res.status(403).json({
                message: "Staff access only"
            });
        }

        req.staff = staff;
        next();

    } catch (error) {
        res.status(500).json({ message: "Authentication error" });
    }
}

// VIEW ALL LEAVE APPLICATIONS
router.get("/applications", verifyStaff, async (req, res) => {
    try {
        const applications = await Leave.find()
            .populate("studentId", "username email rollNumber")
            .sort({ appliedDate: -1 });

        console.log("Staff viewed all leave applications");
        console.log("Total Applications:", applications.length);

        res.json(applications);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error" });
    }
});

// APPROVE OR REJECT LEAVE
router.put("/decision/:id", verifyStaff, async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;

        if (!["Approved", "Rejected"].includes(status)) {
            return res.status(400).json({
                message: "Invalid decision"
            });
        }

        if (status === "Rejected" &&
            (!rejectionReason || !rejectionReason.trim())) {
            return res.status(400).json({
                message: "Rejection reason is mandatory"
            });
        }

        const application = await Leave.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        if (application.status !== "Pending") {
            return res.status(400).json({
                message: "Application has already been processed"
            });
        }

        if (status === "Approved") {
            const student = await User.findById(application.studentId);

            const balanceField =
                application.leaveType === "casual"
                    ? "casualLeave"
                    : "medicalLeave";

            if (student[balanceField] < application.numberOfDays) {
                return res.status(400).json({
                    message: "Insufficient leave balance"
                });
            }

            student[balanceField] -= application.numberOfDays;
            await student.save();

            application.rejectionReason = "";
        } else {
            application.rejectionReason = rejectionReason.trim();
        }

        application.status = status;
        await application.save();

        console.log("--------------------------------");
        console.log("STAFF LEAVE DECISION");
        console.log("Staff:", req.staff.username);
        console.log("Application ID:", application._id);
        console.log("Decision:", status);

        if (status === "Rejected") {
            console.log("Rejection Reason:", rejectionReason);
        }

        console.log("--------------------------------");

        res.json({
            message: `Leave application ${status.toLowerCase()} successfully`,
            application
        });

    } catch (error) {
        console.error("Staff Decision Error:", error.message);
        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;
