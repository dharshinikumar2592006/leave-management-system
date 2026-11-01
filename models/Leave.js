
const mongoose = require("mongoose");

const LeaveSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    leaveType: {
        type: String,
        enum: ["casual", "medical"],
        required: true
    },
    numberOfDays: {
        type: Number,
        required: true
    },
    appliedDate: {
        type: Date,
        default: Date.now
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
    },
    rejectionReason: {
        type: String,
        default: ""
    }
}, { timestamps: true });

module.exports = mongoose.model("Leave", LeaveSchema);
