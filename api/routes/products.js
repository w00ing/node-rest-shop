const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Product = require("../models/product");

router.get("/", async (req, res, next) => {
  try {
    const products = await Product.find().exec();
    console.log(products);

    // Optional checking. The array will be there anyway. We might consider it not to be an error.

    // products.length >= 0
    res.status(200).json({
      message: "Get all products",
      products,
    });
    //   : res.status(404).json({
    //       message: "No entries found",
    //     });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

router.post("/", async (req, res, next) => {
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
  });
  try {
    const result = await product.save();
    console.log(result);
    res.status(201).json({
      message: "Handling POST requests to /products",
      createdProduct: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

router.get("/:productId", async (req, res, next) => {
  const {
    params: { productId: id },
  } = req;
  try {
    const product = await Product.findById(id).exec();
    console.log("From Database", product);
    product
      ? res.status(200).json(product)
      : res
          .status(404)
          .json({ message: "No valid entry found for the provided ID" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

router.patch("/:productId", async (req, res, next) => {
  const {
    params: { productId: id },
  } = req;
  const { body: props } = req;
  console.log(props);
  try {
    const product = await Product.findByIdAndUpdate(id, props, {
      new: true,
    }).exec();
    console.log(product);
    product
      ? res.status(200).json(product)
      : res.status(404).json({ message: "Entry not found" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error });
  }
});

router.delete("/:productId", async (req, res, next) => {
  const {
    params: { productId: id },
  } = req;
  try {
    const product = await Product.findByIdAndDelete({ _id: id }).exec();
    console.log(product);
    product
      ? res.status(200).json({
          message: "Deleted product",
          product,
        })
      : res.status(404).json({
          message: "No entry found",
        });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

module.exports = router;
