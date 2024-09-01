const mongoose = require("mongoose");

const customerSchema = mongoose.Schema({
  name: String,
  cart: [
    {
      drinkId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
    },
  ],
  total: { type: Number },
  discount: { type: Number, default: 0 },
  paymentMethod: String,
});

module.exports = mongoose.model("Customer", customerSchema);
