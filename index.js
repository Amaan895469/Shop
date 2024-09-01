const express = require("express");
const cors = require("cors");
const { connectDB, closeDB } = require("./mongoose-connection");
const productRouter = require("./routes/productRouter");
const customerRouter = require("./routes/customerRouter");

const app = express();
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/product", productRouter);
app.use("/customer", customerRouter);

if (process.env.NODE_ENV !== "test") {
  app.listen(3001, () => {
    console.log("Backend Server is running on port 3001");
  });
}

module.exports = app;
