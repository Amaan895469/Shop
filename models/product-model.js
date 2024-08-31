const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  Name: "String",
  Price: "Number",
  Category: "String",
  Image: "String",
  Discount: {
    type: "Number",
    default: 0,
  },
});

module.exports = mongoose.model("product", productSchema);
