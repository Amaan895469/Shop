const mongoose = require("mongoose");
const dbgr = require("debug")("development:mongoose");

const connectDB = async () => {
  try {
    const mongoURI =
      "mongodb+srv://Amaan:895469@coffeeshop.awpgk.mongodb.net/?retryWrites=true&w=majority&appName=CoffeeShop";
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
  }
};

const closeDB = async () => {
  await mongoose.connection.close();
  dbgr("Disconnected from MongoDB");
};

module.exports = { connectDB, closeDB };
