const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  res.status(200).json({
    message: "Handling GET requests to /products",
  });
});

router.post("/", (req, res, next) => {
  const product = {
    name: req.body.name,
    price: req.body.price,
  };

  res.status(201).json({
    message: "Handling POST requests to /products",
    createdProduct: product,
  });
});

router.get("/:productId", (req, res, next) => {
  const {
    params: { productId: id },
  } = req.params;
  if (id === "special") {
    res.status(200).json({
      message: "You discovered the special ID",
      id,
    });
  } else {
    res.status(200).json({
      message: "You passed an ID",
      id,
    });
  }
});

router.patch("/:productId", (req, res, next) => {
  const {
    params: { productId: id },
  } = req;
  res.status(200).json({
    message: "Updated product",
    id,
  });
});

router.delete("/:productId", (req, res, next) => {
  const {
    params: { productId: id },
  } = req;
  res.status(200).json({
    message: "Deleted product",
    id,
  });
});

module.exports = router;
