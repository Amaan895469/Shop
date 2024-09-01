const request = require("supertest");
const app = require("../index");
const mongoose = require("mongoose");
const Product = require("../models/product-model");
describe("Product API", () => {
  it("should retrieve the list of products", async () => {
    const product = await Product.create({ name: "Coke", price: 5 });

    const response = await request(app).get("/product");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe("Coke");

    // Clean up
    await Product.findByIdAndDelete(product._id);
  });

  it("should return 500 on server error", async () => {
    jest.spyOn(Product, "find").mockImplementation(() => {
      throw new Error("Database error");
    });

    const response = await request(app).get("/product");

    expect(response.statusCode).toBe(500);
    expect(response.text).toBe("Server Error");

    Product.find.mockRestore();
  });
});
