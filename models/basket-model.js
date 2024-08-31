const mongoose = require("mongoose");

const basketSchema = mongoose.Schema({
  Name: "String",
  Price: "Number",
  Category: "String",
  Image: "String",
  Quantity: {
    type: "Number",
    default: 0,
  },
  Total: {
    type: "Number",
    default: 0,
  },
  Discount: {
    type: "Number",
    default: 0,
  },
  Payment: "Number",
});

module.exports = mongoose.model("basket", basketSchema);
