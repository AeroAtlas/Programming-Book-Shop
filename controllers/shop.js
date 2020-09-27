const Product = require('../models/product');
// const Cart = require('../models/cart');
// const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      res.render('shop/product-list', {
        prods: products, 
        pageTitle: 'All Products', 
        path: "/products"
      });
    })
    .catch(err => console.log(err))
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
    .catch(err => console.log(err));
}

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      res.render('shop/index', {
        prods: products, 
        pageTitle: 'Shop', 
        path: "/"
      });
    }).catch(err => console.log(err))
}

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then(cart => {
      return cart
        .getProducts()
        .then(products => {
          res.render('shop/cart', {
            path: '/cart',
            pageTitle: 'Your Cart',
            products: products
          })
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
}

exports.postCart = (req, res, next) => {
  const {productId} = req.body;
  let fetchedCart;
  let newQuantity = 1;
  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts({where: {id: productId}})
    })
    .then(products => {
      if (products[0]) {
        const oldQuantity = products[0].cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return products[0];
      }
      return Product.findByPk(productId)
    })
    .then(product => {
      return fetchedCart.addProduct(product, {through: {quantity: newQuantity}})
    })
    .then(() => {
      res.redirect("/cart")
    })
    .catch(err => console.log(err))
}

exports.postCartDeleteProduct = (req, res, next) => {
  const {productId} = req.body
  req.user
    .getCart()
    .then(cart => {
      return cart.getProducts({where:{id:productId}})
    })
    .then(products => {
      const product = products[0]
      return product.cartItem.destroy();
    })
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err))
}

exports.postOrder = (req,res,next) => {
  let fetchedCart;
  req.user.getCart()
    .then(cart => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then(products => {
      return req.user.createOrder()
        .then(order => {
          order.addProducts(products.map(product => {
            product.orderItem = { quantity: product.cartItem.quantity};
            return product
          }))
        })
        .then(result => fetchedCart.setProducts(null))
        .then(result => res.redirect("/orders"))
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
}

exports.getOrders = (req, res, next) => {
  req.user.getOrders({include: ["products"]})
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      })
    })
    .catch(err => console.log(err))
}

//* Don't need right now
exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout'
  })
}