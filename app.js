
require("dotenv").config();

const express = require("express");
const path = require("path");

// Database connection
const connectDB = require("./config/db");

// Route imports
const authRoutes = require("./routes/authRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const staffRoutes = require("./routes/staffRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/staff", staffRoutes);

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Handle unknown API routes
app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found"
    });
});

// Start server after database connection
const PORT = process.env.PORT || 5050;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log("----------------------------------");
            console.log(" LEAVE MANAGEMENT SYSTEM STARTED");
            console.log("----------------------------------");
            console.log(`Server running at http://localhost:${PORT}`);
            console.log("MongoDB: Connected");
            console.log("Auth Routes: /api/auth");
            console.log("Leave Routes: /api/leaves");
            console.log("Staff Routes: /api/staff");
            console.log("----------------------------------");
        });

    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
