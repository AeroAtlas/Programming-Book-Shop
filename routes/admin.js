const express = require('express');
const router = express.Router();
const path = require('path');
const rootDir = require('../util/path');

const products = [];

router.get('/add-product', (req, res, next) => {
  console.log("In the 2nd middleware");
  res.render('add-product', {
    pageTitle: 'Add Product', 
    path: '/admin/add-product',
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true
  });
  // res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
});

router.post('/add-product',(req,res,next)=> {
  products.push({title: req.body.title})
  console.log(req.body);
  res.redirect('/');
})

exports.routes = router;
exports.products = products;