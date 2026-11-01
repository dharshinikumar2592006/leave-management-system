
const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("--------------------------------");
        console.log(" MongoDB Connected Successfully!");
        console.log("--------------------------------");

    } catch (error) {
        console.log("MongoDB Connection Failed!");
        console.error(error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
