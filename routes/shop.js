const express = require('express');
const path = require('path');
const rootDir = require('../util/path');
const adminData = require('./admin');

const router = express.Router();

//For Templating Engines
router.get('/', (req, res, next) => {
  const { products } = adminData
  res.render('shop', {prods: products, docTitle: 'Shop'})
})

// router.get('/', (req, res, next) => {
//   console.log('shop.js',adminData.products);
//   res.sendFile(path.join(rootDir, 'views', 'shop.html'));
// });

module.exports = router;