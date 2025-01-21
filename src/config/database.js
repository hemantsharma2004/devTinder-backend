const mongoose = require("mongoose");

const connectdb = async () => {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_SECRET, {
        });
       
    } catch (err) {
        console.error("Database connection error:", err.message);
        process.exit(1); 
    }
};

module.exports = connectdb;
