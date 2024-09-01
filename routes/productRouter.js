// routes/productRouter.js
const express = require("express");
const router = express.Router();
const Product = require("../models/product-model");

router.get("/", async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;
