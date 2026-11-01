
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    rollNumber: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["student", "staff"],
        default: "student"
    },
    casualLeave: {
        type: Number,
        default: 10
    },
    medicalLeave: {
        type: Number,
        default: 10
    }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
