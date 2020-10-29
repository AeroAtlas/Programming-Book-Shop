const Product = require('../models/product');
const {validationResult} = require("express-validator/check")
const {ifErr} = require("../middleware/error-handle")

exports.getAddProduct = (req, res, next) => {
  // if(!req.session.isLoggedIn){ return res.redirect("/login") }
  res.render('admin/edit-product', {
    pageTitle: 'Add Product', 
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
}

exports.postAddProduct = (req,res,next)=> {
  const {title, price, description, imageUrl} = req.body
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    const errorArray = errors.array().map(err => `${err.msg}`).join(` & `)
    return res.status(422).render('admin/edit-product', { //maybe edit product?
      pageTitle: 'Add Product', 
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {title, imageUrl, price, description},
      errorMessage: errorArray,
      validationErrors: errors.array()
    });
  }
  const product = new Product({title:title, price:price, description:description, imageUrl:imageUrl, userId: req.user})
    product.save()
      .then(() => {
        console.log("Created Product")
        res.redirect("/admin/products")
      })
      .catch(err => next(ifErr(err)));
}

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if(!editMode) { return res.redirect('/') }
  const {productId} = req.params;
  Product.findById(productId)
    .then(product => {
      if(!product) { return res.redirect('/') }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product', 
        path: '/admin/edit-product',
        editing: editMode,
        hasError: false,
        product: product,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err => next(ifErr(err)));
}

exports.postEditProduct = (req, res, next) => {
  const {productId, title, price, description, imageUrl} = req.body
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    const errorArray = errors.array().map(err => `${err.msg}`).join(` & `)
    return res.status(422).render('admin/edit-product', { //maybe change to add product
      pageTitle: 'Edit Product', 
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {title, imageUrl, price, description, _id: productId},
      errorMessage: errorArray,
      validationErrors: errors.array()
    });
  }
  Product.findById(productId).then(product => {
    if(product.userId.toString() !== req.user._id.toString()){ //remember to convert to string
      return res.redirect("/");
    }
    product.title = title;
    product.price = price;
    product.description = description;
    product.imageUrl = imageUrl;
    return product.save()
      .then(() => {
        console.log("Updated Product");
        res.redirect('/admin/products');
      })
  })
  .catch(err => next(ifErr(err)));
}

exports.getProducts = (req, res, next) => {
  Product.find({userId: req.user._id})
    // .select("title price -_id")
    // .populate("userId", "name")
    .then(products => {
      console.log(products)
      res.render('admin/products', {
        prods: products, 
        pageTitle: 'Admin Products', 
        path: "/admin/products"
      });
    })
    .catch(err => next(ifErr(err)));
}

exports.postDeleteProduct = (req,res,next) => {
  const { productId } = req.body
  //Product.findByIdAndRemove(productId)
  Product.deleteOne({_id: productId, userId: req.user._id})
    .then(() => {
      console.log("Destroyed Product");
      res.redirect('/admin/products');
    })
    .catch(err => next(ifErr(err)));
}