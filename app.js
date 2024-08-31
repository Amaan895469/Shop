const express = require("express");
const app = express();

const db = require("./config/mongoose-connection");
const cookieParser = require("cookie-parser");
const path = require("path");
const productRouter = require("./routes/productRouter");
const basketRouter = require("./routes/basketRouter");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("Coreview Assessment");
});

app.use("/product", productRouter);
app.use("/basket", basketRouter);

app.listen(3000);
