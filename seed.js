const { connectDB, closeDB } = require("./mongoose-connection");
const Product = require("./models/product-model");

const seedProducts = [
  { name: "Italian Coffee", price: 3, category: "Coffee", discount: 0 },
  { name: "American Coffee", price: 2.5, category: "Coffee", discount: 0 },
  { name: "Tea", price: 2, category: "Tea", discount: 0 },
  { name: "Chocolate", price: 3.5, category: "Hot Beverage", discount: 0 },
];

async function seedDB() {
  try {
    await connectDB();

    await Product.deleteMany({});
    await Product.insertMany(seedProducts);
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await closeDB();
  }
}

seedDB();
