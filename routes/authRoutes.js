
const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();

const User = require("../models/User");

// STUDENT REGISTRATION
router.post("/register", async (req, res) => {
    try {
        const { username, email, password, rollNumber } = req.body;

        if (!username || !email || !password || !rollNumber) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { rollNumber }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email or Roll Number already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            rollNumber,
            role: "student"
        });

        await newUser.save();

        console.log("--------------------------------");
        console.log("NEW STUDENT REGISTERED");
        console.log("Name:", username);
        console.log("Email:", email);
        console.log("Roll Number:", rollNumber);
        console.log("--------------------------------");

        res.status(201).json({
            message: "Registration successful"
        });

    } catch (error) {
        console.error("Registration Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
});

// LOGIN FOR STUDENT AND STAFF
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            console.log("Login failed: User not found");
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            console.log("Login failed: Invalid password");
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        console.log("--------------------------------");
        console.log("USER LOGIN SUCCESSFUL");
        console.log("Name:", user.username);
        console.log("Role:", user.role);
        console.log("Email:", user.email);
        console.log("--------------------------------");

        res.json({
            message: "Login successful",
            userId: user._id,
            username: user.username,
            email: user.email,
            rollNumber: user.rollNumber,
            role: user.role,
            casualLeave: user.casualLeave,
            medicalLeave: user.medicalLeave
        });

    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
