const Product = require('../models/product');
const {validationResult} = require("express-validator")
const {ifErr} = require("../middleware/error-handle")
const {deleteFile} = require("../util/file")

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
  const {title, price, description} = req.body
  const image = req.file //is a buffer
  //Check if Image is valid
  // if(!image){
  //   return res.status(422).render('admin/edit-product', { //maybe edit product?
  //     pageTitle: 'Add Product', 
  //     path: '/admin/add-product',
  //     editing: false,
  //     hasError: true,
  //     product: {title, price, description},
  //     errorMessage: "Attached file is not an accepted image format",
  //     validationErrors: []
  //   });
  // }
  //Check for Validation Errors
  const errors = validationResult(req)
  if(!errors.isEmpty() || !image){
    const errorArray = errors.array().map(err => `${err.msg}`).join(` & `)
    return res.status(422).render('admin/edit-product', { //maybe edit product?
      pageTitle: 'Add Product', 
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {title, price, description},
      errorMessage: errorArray || "Attached file is not an accepted image format",
      validationErrors: errors.array() || []
    });
  }
  //Save Path to Image
  const imageUrl = image.path;

  //Create Product
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
  const {productId, title, price, description} = req.body
  const image = req.file
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    const errorArray = errors.array().map(err => `${err.msg}`).join(` & `)
    return res.status(422).render('admin/edit-product', { //maybe change to add product
      pageTitle: 'Edit Product', 
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      product: {title, price, description, _id: productId},
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
    if(image) {
      deleteFile(product.imageUrl)
      product.imageUrl = image.path;
    }
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

exports.deleteProduct = (req,res,next) => {
  const { productId } = req.params
  Product.findById(productId)
    .then(product => {
      if(!product){
        return next(new Error("Product not found"))
      }
      deleteFile(product.imageUrl)
      return Product.deleteOne({_id: productId, userId: req.user._id})
    })
    .then(() => {
      console.log("Destroyed Product");
      // res.redirect('/admin/products');
      res.status(200).json({message: "Delete Success"});
    })
    .catch(err => res.status(500).json({message: "Deleting product failed"}))
}