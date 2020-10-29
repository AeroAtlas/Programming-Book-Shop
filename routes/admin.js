const express = require('express');
const {check, body} = require("express-validator/check")
const router = express.Router();
const adminController = require("../controllers/admin")
const isAuth = require("../middleware/is-auth");

router.get('/add-product', isAuth, adminController.getAddProduct);
router.get('/products', isAuth, adminController.getProducts);
router.post('/add-product', [
  body("title")
    .isString().withMessage("Title must be valid text")
    .isLength({min: 6}).withMessage("Title needs to be atleast 6 characters long")
    .trim(),
  body("imageUrl")
    .isURL().withMessage("Image Url must be a valid Url"),
  body("price")
    .isFloat().withMessage("Price must be a valid price with 2 decimal places"),
  body("description")
    .isLength({min: 8}).withMessage("Description needs to be atleast 8 characters long")
    .isLength({max: 500}).withMessage("Description cannot be longer than 500 characters")
    .trim()
], isAuth, adminController.postAddProduct);
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct)
router.post('/edit-product', [
  body("title")
    .isString().withMessage("Title must be valid text")
    .isLength({min: 6}).withMessage("Title needs to be atleast 6 characters long")
    .trim(),
  body("imageUrl")
    .isURL().withMessage("Image Url must be a valid Url"),
  body("price")
    .isFloat().withMessage("Price must be a valid price with 2 decimal places"),
  body("description")
    .isLength({min: 8}).withMessage("Description needs to be atleast 8 characters long")
    .isLength({max: 500}).withMessage("Description cannot be longer than 500 characters")
    .trim()
], isAuth, adminController.postEditProduct);
router.post('/delete-product', isAuth, adminController.postDeleteProduct)

module.exports = router;