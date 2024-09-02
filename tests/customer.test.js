const mongoose = require("mongoose");
const { connectDB, closeDB } = require("../mongoose-connection");
const Customer = require("../models/customer-model");
const Product = require("../models/product-model");
const request = require("supertest");
const app = require("../index");

beforeAll(async () => {
  await connectDB();
});
afterAll(async () => {
  await closeDB();
});
beforeEach(async () => {
  await Customer.deleteMany({});
  await Product.deleteMany({});
});

afterEach(async () => {
  await Customer.deleteMany({});
  await Product.deleteMany({});
});

describe("Customer API", () => {
  afterAll(async () => {
    // await mongoose.connection.close();
  });

  it("should create a new customer", async () => {
    const response = await request(app)
      .post("/customer/create")
      .send({ name: "John Doe" });

    expect(response.statusCode).toBe(200);
    expect(response.body.customerId).toBeDefined();

    // Clean up
    await Customer.findByIdAndDelete(response.body.customerId);
  });

  it("should return 500 on database error during customer creation", async () => {
    jest.spyOn(Customer, "create").mockImplementation(() => {
      throw new Error("Database error");
    });

    const response = await request(app)
      .post("/customer/create")
      .send({ name: "Jane Doe" });

    expect(response.statusCode).toBe(500);
    expect(response.text).toBe("Server Error");

    Customer.create.mockRestore();
  });
});
describe("Add Item to Cart API", () => {
  it("should add a new item to the cart", async () => {
    const customer = await Customer.create({ name: "John Doe" });
    const product = await Product.create({ name: "Coke", price: 2 });

    const response = await request(app)
      .post("/customer/cart/add")
      .send({ customerId: customer._id, productId: product._id, quantity: 2 });

    expect(response.statusCode).toBe(200);
    expect(response.body.customer.cart).toHaveLength(1);
    expect(response.body.total).toBe(4); // 2 * 2

    // Clean up
    await Customer.findByIdAndDelete(customer._id);
    await Product.findByIdAndDelete(product._id);
  });

  it("should update the quantity of an existing item", async () => {
    const customer = await Customer.create({ name: "John Doe" });
    const product = await Product.create({ name: "Coke", price: 2 });

    await customer.cart.push({ drinkId: product._id, quantity: 2 });
    await customer.save();

    const response = await request(app)
      .post("/customer/cart/add")
      .send({ customerId: customer._id, productId: product._id, quantity: 3 });

    expect(response.statusCode).toBe(200);
    expect(response.body.customer.cart[0].quantity).toBe(3);
    expect(response.body.total).toBe(6); // 3 * 2

    // Clean up
    await Customer.findByIdAndDelete(customer._id);
    await Product.findByIdAndDelete(product._id);
  });

  it("should return 400 for invalid quantity", async () => {
    const customer = await Customer.create({ name: "John Doe" });
    const product = await Product.create({ name: "Coke", price: 2 });

    const response = await request(app)
      .post("/customer/cart/add")
      .send({ customerId: customer._id, productId: product._id, quantity: 0 });

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("Invalid quantity");

    // Clean up
    await Customer.findByIdAndDelete(customer._id);
    await Product.findByIdAndDelete(product._id);
  });
});
describe("Get Cart Details API", () => {
  it("should retrieve cart details", async () => {
    const customer = await Customer.create({ name: "John Doe" });
    const product = await Product.create({ name: "Coke", price: 2 });

    await customer.cart.push({ drinkId: product._id, quantity: 2 });
    await customer.save();

    const response = await request(app).get(
      `/customer/cart?customerId=${customer._id}`
    );

    expect(response.statusCode).toBe(200);
    expect(response.body.customer.name).toBe("John Doe");
    expect(response.body.customer.cart).toHaveLength(1);
    expect(response.body.total).toBe(4);

    // Clean up
    await Customer.findByIdAndDelete(customer._id);
    await Product.findByIdAndDelete(product._id);
  });

  it("should return 400 for an invalid customer ID", async () => {
    const response = await request(app).get(
      "/customer/cart?customerId=nonexistentid"
    );

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("Invalid customer ID");
  });
});
describe("Remove Item from Cart API", () => {
  it("should remove an item from the cart", async () => {
    const customer = await Customer.create({ name: "John Doe" });
    const product = await Product.create({ name: "Coke", price: 2 });

    customer.cart.push({ drinkId: product._id, quantity: 2 });
    await customer.save();

    const response = await request(app)
      .post("/customer/cart/remove")
      .send({ customerId: customer._id, productId: product._id });

    expect(response.statusCode).toBe(200);
    expect(response.body.customer.cart).toHaveLength(0);
    expect(response.body.total).toBe(0);

    // Clean up
    await Customer.findByIdAndDelete(customer._id);
    await Product.findByIdAndDelete(product._id);
  });

  it("should return 400 for invalid customer or product ID", async () => {
    const response = await request(app)
      .post("/customer/cart/remove")
      .send({ customerId: "nonexistentid", productId: "nonexistentid" });

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("Invalid customer or product ID");
  });
});
describe("Apply Discount API", () => {
  it("should apply a valid discount", async () => {
    const customer = await Customer.create({ name: "John Doe" });
    const product = await Product.create({ name: "Coke", price: 5 });

    customer.cart.push({ drinkId: product._id, quantity: 1 });
    await customer.save();

    const response = await request(app)
      .post("/customer/apply-discount")
      .send({ customerId: customer._id, discountCode: "DISCOUNT10" });

    expect(response.statusCode).toBe(200);
    expect(response.body.total).toBe(3); // 5 - 2 (discount)
    expect(response.body.message).toBe("Discount applied successfully!");

    // Clean up
    await Customer.findByIdAndDelete(customer._id);
    await Product.findByIdAndDelete(product._id);
  });

  it("should not apply discount for invalid code", async () => {
    const customer = await Customer.create({ name: "John Doe" });
    const product = await Product.create({ name: "Coke", price: 5 });

    customer.cart.push({ drinkId: product._id, quantity: 1 });
    await customer.save();

    const response = await request(app)
      .post("/customer/apply-discount")
      .send({ customerId: customer._id, discountCode: "INVALID" });

    expect(response.statusCode).toBe(200);
    expect(response.body.total).toBe(5);
    expect(response.body.message).toBe("Discount applied successfully!");

    await Customer.findByIdAndDelete(customer._id);
    await Product.findByIdAndDelete(product._id);
  });
});
describe("Checkout API", () => {
  it("should complete checkout with a valid payment method", async () => {
    const customer = await Customer.create({ name: "John Doe" });
    const product = await Product.create({ name: "Coke", price: 5 });

    customer.cart.push({ drinkId: product._id, quantity: 2 });
    await customer.save();

    const response = await request(app).post("/customer/checkout").send({
      customerId: customer._id,
      discountCode: "DISCOUNT10",
      paymentMethod: "Credit Card",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.total).toBe(8); // 10 - 2 (discount)
    expect(response.body.message).toBe("Order placed successfully!");

    // Clean up
    await Customer.findByIdAndDelete(customer._id);
    await Product.findByIdAndDelete(product._id);
  });

  it("should fail checkout for cash payments over €10", async () => {
    const customer = await Customer.create({ name: "John Doe" });
    const product = await Product.create({ name: "Coke", price: 7 });

    customer.cart.push({ drinkId: product._id, quantity: 2 });
    await customer.save();

    const response = await request(app).post("/customer/checkout").send({
      customerId: customer._id,
      discountCode: "DISCOUNT10",
      paymentMethod: "Cash",
    });

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe(
      "You must pay with a Credit Card for totals over €10"
    );

    await Customer.findByIdAndDelete(customer._id);
    await Product.findByIdAndDelete(product._id);
  });
});
