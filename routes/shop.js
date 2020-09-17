const express = require('express');
const router = express.Router();
const productsController = require("../controllers/products")

//For Templating Engines
router.get('/', productsController.getProducts)



module.exports = router;