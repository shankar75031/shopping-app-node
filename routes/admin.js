const path = require("path");

const express = require("express");

const productsController = require("../controllers/admin");

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", productsController.getAddProduct);

// /admin/add-product => POST
router.post("/add-product", productsController.postAddProduct);

// /admin/products => GET
router.get("/products", productsController.getProducts);
module.exports = router;
