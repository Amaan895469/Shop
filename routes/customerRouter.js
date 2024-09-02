const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Customer = require("../models/customer-model");
const Product = require("../models/product-model");

// Create a new customer
router.post("/create", async (req, res) => {
  const { name } = req.body;
  try {
    const customer = await Customer.create({ name });
    res.json({ customerId: customer._id });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// Add item to cart or update quantity
router.post("/cart/add", async (req, res) => {
  const { customerId, productId, quantity = 1 } = req.body;

  if (isNaN(quantity) || quantity <= 0) {
    return res.status(400).send("Invalid quantity");
  }

  if (
    !mongoose.Types.ObjectId.isValid(customerId) ||
    !mongoose.Types.ObjectId.isValid(productId)
  ) {
    return res.status(400).send("Invalid customer or product ID");
  }

  try {
    let customer = await Customer.findById(customerId).populate("cart.drinkId");
    const product = await Product.findById(productId);

    if (!customer || !product) {
      return res.status(404).send("Customer or product not found");
    }

    const existingProduct = customer.cart.find(
      (item) => item.drinkId._id.toString() === productId
    );

    if (existingProduct) {
      existingProduct.quantity = quantity;
    } else {
      customer.cart.push({ drinkId: productId, quantity });
    }

    await customer.populate("cart.drinkId");

    customer.total = customer.cart.reduce((acc, item) => {
      const price = item.drinkId.price || 0;
      const qty = item.quantity || 0;
      return acc + qty * price;
    }, 0);

    console.log("Calculated Total:", customer.total);

    await customer.save();

    res.json({ customer, total: customer.total });
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).send("Server Error");
  }
});

// Get cart details by customerId
router.get("/cart", async (req, res) => {
  const { customerId } = req.query;

  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    return res.status(400).send("Invalid customer ID");
  }

  try {
    const customer = await Customer.findById(customerId).populate(
      "cart.drinkId"
    );

    if (!customer) {
      return res.status(404).send("Customer not found");
    }

    // Calculate the total
    const total = customer.cart.reduce((acc, item) => {
      return acc + item.drinkId.price * item.quantity;
    }, 0);

    res.json({
      customer: {
        name: customer.name,
        cart: customer.cart,
      },
      total: total, // Ensure total is calculated here
    });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).send("Server Error");
  }
});

// Remove item from cart
router.post("/cart/remove", async (req, res) => {
  const { customerId, productId } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(customerId) ||
    !mongoose.Types.ObjectId.isValid(productId)
  ) {
    return res.status(400).send("Invalid customer or product ID");
  }

  try {
    const customer = await Customer.findById(customerId).populate(
      "cart.drinkId"
    );
    if (!customer) {
      return res.status(404).send("Customer not found");
    }

    customer.cart = customer.cart.filter(
      (item) => item.drinkId._id.toString() !== productId
    );

    customer.total = customer.cart.reduce(
      (acc, item) => acc + item.drinkId.price * item.quantity,
      0
    );

    await customer.save();
    res.json({ customer, total: customer.total });
  } catch (err) {
    console.error("Error removing from cart:", err);
    res.status(500).send("Server Error");
  }
});

// Checkout
router.post("/checkout", async (req, res) => {
  const { customerId, discountCode, paymentMethod } = req.body;

  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    return res.status(400).send("Invalid customer ID");
  }

  try {
    const customer = await Customer.findById(customerId).populate(
      "cart.drinkId"
    );

    if (!customer) {
      return res.status(404).send("Customer not found");
    }

    // Calculate total
    let total = customer.cart.reduce(
      (acc, item) => acc + item.drinkId.price * item.quantity,
      0
    );

    // Apply discount
    if (discountCode === "DISCOUNT10") {
      total -= 2; // Apply a €2 discount
    }
    total = total < 0 ? 0 : total; // Ensure total isn't negative

    // Check payment method
    if (total > 10 && paymentMethod === "Cash") {
      return res
        .status(400)
        .send("You must pay with a Credit Card for totals over €10");
    }

    customer.total = total;
    customer.discount = discountCode === "DISCOUNT10" ? 2 : 0;
    customer.paymentMethod = paymentMethod;

    await customer.save();

    res.status(200).json({
      message: "Order placed successfully!",
      total: customer.total,
      customerName: customer.name,
    });
  } catch (err) {
    console.error("Error during checkout:", err);
    res.status(500).send("Server Error");
  }
});

// Apply discount
router.post("/apply-discount", async (req, res) => {
  const { customerId, discountCode } = req.body;

  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    return res.status(400).send("Invalid customer ID");
  }

  try {
    const customer = await Customer.findById(customerId).populate(
      "cart.drinkId"
    );

    if (!customer) {
      return res.status(404).send("Customer not found");
    }

    let total = customer.cart.reduce(
      (acc, item) => acc + item.drinkId.price * item.quantity,
      0
    );

    if (discountCode === "DISCOUNT10") {
      total -= 2; // Apply a €2 discount
    }
    total = total < 0 ? 0 : total;

    customer.total = total;
    customer.discount = discountCode === "DISCOUNT10" ? 2 : 0;

    await customer.save();

    res.json({
      total: customer.total,
      message: "Discount applied successfully!",
    });
  } catch (err) {
    console.error("Error applying discount:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
