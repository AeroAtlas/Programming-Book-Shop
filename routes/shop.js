const express = require('express');
const path = require('path');
const rootDir = require('../util/path');
const adminData = require('./admin');

const router = express.Router();

//For Templating Engines
router.get('/', (req, res, next) => {
  const { products } = adminData
  res.render('shop', {
    prods: products, 
    pageTitle: 'Shop', 
    path: "/", 
    hasProducts: products.length > 0, 
    activeShop: true,
    productCSS: true,
    // layout: false -> turns off main layout
  })
})

// router.get('/', (req, res, next) => {
//   console.log('shop.js',adminData.products);
//   res.sendFile(path.join(rootDir, 'views', 'shop.html'));
// });

module.exports = router;