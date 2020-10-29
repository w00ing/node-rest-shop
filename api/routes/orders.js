const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Order = require("../models/order");
const Product = require("../models/product");

router.get("/", async (req, res, next) => {
  try {
    const orders = await Order.find().select("product quantity _id").exec();
    res.status(200).json({
      count: orders.length,
      orders: orders.map((order) => {
        return {
          ...order["_doc"],
          request: {
            type: "GET",
            url: `${req.protocol}://${req.get("host")}/orders/${order.id}`,
          },
        };
      }),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

router.post("/", async (req, res, next) => {
  try {
    const productById = await Product.findById(req.body.productId);
    if (!productById) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    const order = new Order({
      _id: mongoose.Types.ObjectId(),
      quantity: req.body.quantity,
      product: req.body.productId,
    });
    const { _id, product, quantity } = await order.save();
    res.status(201).json({
      message: "Order stored",
      createdOrder: {
        _id,
        product,
        quantity,
      },
      request: {
        type: "GET",
        url: `${req.protocol}://${req.get("host")}/orders/${_id}`,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

router.get("/:orderId", async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(500).json({ message: "Order not found" });
    }
    const { _id, quantity, product } = order;

    res.status(200).json({
      order: {
        _id,
        quantity,
        product,
      },
      request: {
        type: "GET",
        url: `${req.protocol}://${req.get("host")}/orders`,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

router.delete("/:orderId", async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.orderId).exec();
    console.log(order);
    res.status(200).json({
      message: "Order deleted",
      request: {
        type: "POST",
        url: `${req.protocol}://${req.get("host")}/orders`,
        body: {
          productId: "ID",
          quantity: "Number",
        },
      },
    });
  } catch (error) {
    console.log(error);
    req.status(500).json({ error });
  }
});

module.exports = router;
