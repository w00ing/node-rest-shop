const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

router.post("/signup", async (req, res, next) => {
  try {
    const user = await User.find({ email: req.body.email }).exec();
    if (user.length >= 1) {
      return res.status(409).json({ message: "Mail exists" });
    } else {
      const hash = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        _id: new mongoose.Types.ObjectId(),
        email: req.body.email,
        password: hash,
      });
      const result = await user.save();
      console.log(result);
      res.status(201).json({
        message: "User created",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const user = await User.find({ email: req.body.email }).exec();
    if (user.length < 1) {
      return res.status(401).json({
        message: "Auth failed",
      });
    }
    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user[0].password,
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Auth failed",
      });
    } else {
      const token = await jwt.sign(
        {
          email: user[0].email,
          userId: user[0]._id,
        },
        process.env.JWT_KEY,
        {
          expiresIn: "1h",
        },
      );
      return res.status(200).json({
        message: "Auth successful",
        token,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      message: "Auth failed",
    });
  }
});

router.delete("/:userId", async (req, res, next) => {
  try {
    const { userId: id } = req.body;
    const result = await User.findByIdAndDelete(id);
    console.log(result);
    res.status(200).json({
      message: "User deleted",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

module.exports = router;
