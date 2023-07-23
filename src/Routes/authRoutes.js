const express = require("express");
const UserModel = require("../Model/user.model");

const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/line", (req, res) => {
  res.send({ msg: "King of the world" });
});
const verifyToken = (req, res) => {
  const token = req.cookies.jwtToken;

  if (!token) {
    return res.send({ msg: "Token Not Found" });
  }

  try {
    const decodedToken = jwt.verify(token, "SECERTKEY");
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).send("Token is not Valid");
  }
};
const authFunction = async (user, res) => {
  const token = await jwt.sign(
    { name: user.name, email: user.mail, role: user.role },
    "SECERTKEY",
    { expiresIn: "7days" }
  );
  res.cookie("jwtToken", token, { httpOnly: true });

  return res.status(200).send({
    msg: "LOGIN SUCCESS",
    auth: true,
    userName: user.name,
    role: user.role,
  });
};
app.post("/signin", async (req, res) => {
  const { email, pass } = req.body;

  const user = await UserModel.findOne({ email });

  if (!user) {
    return res.status(404).send({ msg: "User not found", auth: false });
  }
  const hashPass = await bcrypt.compare(pass, user.pass);
  if (user.block) {
    const blocktime = new Date() - new Date(user.lockUntil);
    const hoursLeft = Math.ceil(blocktime / (1000 * 60 * 60));

    if (hoursLeft <= 24) {
      return res.send({
        msg: `Your account has been blocked, try again after ${
          24 - hoursLeft
        } hours `,
        auth: false,
      });
    } else {
      await UserModel.updateOne(
        { email: email },
        {
          $set: {
            block: false,
            lockUntil: 0,
            loginAttempts: 0,
          },
        }
      );
      if (hashPass) {
        authFunction(user, res);
      }
    }
  }

  if (user.loginAttempts >= 5) {
    await UserModel.updateOne(
      { email: email },
      { $set: { block: true, lockUntil: new Date() } }
    );
    return res.status(503).send({
      msg: "You are blocked for 24 hours",
      auth: false,
    });
  }

  if (!hashPass) {
    await UserModel.updateOne({ email: email }, { $inc: { loginAttempts: 1 } });
    return res.status(401).send({
      msg: "Password is not correct",
      auth: false,
    });
  } else {
    await UserModel.updateOne(
      { email: email },
      {
        $set: {
          loginAttempts: 0,
          lockuntil: 0,
          block: false,
        },
      }
    );

    authFunction(user, res);
  }
});

app.get("/private-route", verifyToken, (req, res) => {
  const user = req.user;
  return res.status(200).send({
    msg: "LOGIN SUCCESS",
    auth: true,
    user,
  });
});

app.post("/signup", async (req, res) => {
  const { name, email, pass } = req.body;

  try {
    const eUser = await UserModel.findOne({ email });
    if (eUser) {
      return res.status(409).send({ error: "Email already registered" });
    }
    const hash = await bcrypt.hash(pass, 10);
    const user = new UserModel({
      name,
      email,
      pass: hash,
    });
    await user.save();
    const token = jwt.sign({ name, email }, "SECERTKEY", {
      expiresIn: "7days",
    });
    res.cookie("jwtToken", token, { httpOnly: true });
    return res.status(201).send({ token, msg: "User Created" });
  } catch (e) {
    return res.status(500).send({ error: "An error occurred during signup" });
  }
});
module.exports = app;
