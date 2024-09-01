const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: String,
  price: { type: Number },
  category: String,
  discount: { type: Number, default: 0 },
});

module.exports = mongoose.model("Product", productSchema);
