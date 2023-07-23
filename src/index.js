const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
app.use(cors());
const port = process.env.PORT;
const DB = process.env.DB;
const productRoutes = require("./Routes/productRoutes");
const authRoutes = require("./Routes/authRoutes");

app.use("/", authRoutes);
app.use("/", productRoutes);

mongoose.connect(DB).then(() => {
  app.listen(port, () => {
    console.log(`server started on ${port}`);
  });
});
