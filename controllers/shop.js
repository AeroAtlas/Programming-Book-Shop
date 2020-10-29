const Product = require('../models/product');
const Order = require('../models/order');
const {ifErr} = require("../middleware/error-handle")

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/product-list', {
        prods: products, 
        pageTitle: 'All Products', 
        path: "/products"
      });
    })
    .catch(err => next(ifErr(err)));
}

exports.getProduct = (req, res, next) => {
  const {productId} = req.params
  Product.findById(productId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: "/products"
      })
    })
    .catch(err => next(ifErr(err)));
}

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products, 
        pageTitle: 'Shop', 
        path: "/"
      });
    })
    .catch(err => next(ifErr(err)));
}

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate() //Turns popualte to a promise
    .then(user => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: user.cart.items
      })
    })
    .catch(err => next(ifErr(err)));
}

exports.postCart = (req, res, next) => {
  const {productId} = req.body;
  Product.findById(productId)
    .then(product => {
      return req.user.addToCart(product)
    })
    .then(result => {
      console.log(result)
      res.redirect("/cart")
    })
    .catch(err => next(ifErr(err)));
}

exports.postCartDeleteProduct = (req, res, next) => {
  const {productId} = req.body
  req.user
    .removeFromCart(productId)
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => next(ifErr(err)));
}

exports.postOrder = (req,res,next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate() //Turns popualte to a promise
    .then(user => {
      console.log(user.cart.items)
      const products = user.cart.items.map(item => ({product: {...item.productId._doc}, quantity: item.quantity}))
      const order = new Order({
        products: products,
        user: {email: req.user.email, userId: req.user}
      });
      return order.save()
    })
    .then(() => req.user.clearCart())
    .then(() => res.redirect("/orders"))
    .catch(err => next(ifErr(err)));
}

exports.getOrders = (req, res, next) => {
  Order.find({"user.userId": req.user._id})
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      })
    })
    .catch(err => next(ifErr(err)));
}

//* Don't need right now
// exports.getCheckout = (req, res, next) => {
//   res.render('shop/checkout', {
//     path: '/checkout',
//     pageTitle: 'Checkout'
//   })
// }