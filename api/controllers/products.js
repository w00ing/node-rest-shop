const mongoose = require("mongoose");
const Product = require("../models/product");

exports.products_get_all = async (req, res, next) => {
  try {
    const products = await Product.find()
      .select("name price _id productImage")
      .exec();
    console.log(products);
    const response = {
      count: products.length,
      products: products.map((product) => {
        console.log(product);
        return {
          ...product["_doc"],
          productImage: product.productImage,
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
};

exports.products_create_product = async (req, res, next) => {
  console.log(req.file);
  const newProduct = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path,
  });
  try {
    const { name, _id, price, productImage } = await newProduct.save();

    res.status(201).json({
      message: "Created product successfully",
      createdProduct: {
        name,
        _id,
        price,
        productImage,
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
};

exports.products_get_product = async (req, res, next) => {
  const {
    params: { productId: id },
  } = req;
  try {
    const product = await Product.findById(id)
      .select("name price _id productImage")
      .exec();
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
};

exports.products_update_product = async (req, res, next) => {
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
};

exports.products_delete_product = async (req, res, next) => {
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
};
