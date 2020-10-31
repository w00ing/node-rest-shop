const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter,
});

const Product = require("../models/product");

router.get("/", async (req, res, next) => {
  try {
    const products = await Product.find().select("name price _id").exec();
    const response = {
      count: products.length,
      products: products.map((product) => {
        return {
          ...product["_doc"],
          request: {
            type: "GET",
            url: `${req.protocol}://${req.get("host")}/products/${product._id}`,
          },
        };
      }),
    };
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

router.post("/", upload.single("productImage"), async (req, res, next) => {
  console.log(req.file);
  const newProduct = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
  });
  try {
    const { name, _id, price } = await newProduct.save();

    res.status(201).json({
      message: "Created product successfully",
      createdProduct: {
        name,
        _id,
        price,
        request: {
          type: "GET",
          url: `${req.protocol}://${req.get("host")}/products/${_id}`,
        },
      },
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
    const product = await Product.findById(id).select("name price _id").exec();
    console.log("From Database", product);
    product
      ? res.status(200).json({
          ...product["_doc"],
          request: {
            type: "GET",
            description: "Get all products",
            url: `${req.protocol}://${req.get("host")}/products`,
          },
        })
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
      ? res.status(200).json({
          message: "Product updated",
          ...product["_doc"],
          request: {
            type: "GET",
            url: `${req.protocol}://${req.get("host")}/products/${product._id}`,
          },
        })
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
          ...product["_doc"],
          request: {
            type: "POST",
            url: `${req.protocol}://${req.get("host")}/products/${product._id}`,
            body: { name: "String", price: "Number" },
          },
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
