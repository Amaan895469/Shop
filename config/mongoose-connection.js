const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/shop")
  .then(function () {
    console.log("Connected to db");
  })
  .catch(function (error) {
    console.log("Error connecting to db: ", error);
  });

module.exports = mongoose.connection;
