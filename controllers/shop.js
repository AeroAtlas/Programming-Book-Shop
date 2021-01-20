require("dotenv").config()
const fs = require("fs")
const path = require("path")
const stripe = require("stripe")(process.env.STRIPE_KEY)
const PDFDocument = require("pdfkit")

const Product = require('../models/product');
const Order = require('../models/order');
const {ifErr} = require("../middleware/error-handle")

const ITEMS_PER_PAGE = 5;


exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find().countDocuments().then(numOfProds => {
    totalItems = numOfProds;
    return Product.find() //find returns cursor
    .skip((page - 1) * ITEMS_PER_PAGE) 
    .limit(ITEMS_PER_PAGE)
  })
    .then(products => {
      res.render('shop/product-list', {
        prods: products, 
        pageTitle: 'All Products', 
        path: "/products",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)
      });
    })
    .catch(err => next(ifErr(err)));
  // Product.find()
  //   .then(products => {
  //     res.render('shop/product-list', {
  //       prods: products, 
  //       pageTitle: 'All Products', 
  //       path: "/products"
  //     });
  //   })
  //   .catch(err => next(ifErr(err)));
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
  const page = +req.query.page || 1;
  let totalItems;

  Product.find().countDocuments().then(numOfProds => {
    totalItems = numOfProds;
    return Product.find() //find returns cursor
    .skip((page - 1) * ITEMS_PER_PAGE) 
    .limit(ITEMS_PER_PAGE)
  })
    .then(products => {
      res.render('shop/index', {
        prods: products, 
        pageTitle: 'Shop', 
        path: "/",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)
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
    .execPopulate() //Turns populate to a promise
    .then(user => {
      // console.log(user.cart.items)
      console.log(user)
      const products = user.cart.items.map(item => ({product: {...item.productId._doc}, quantity: item.quantity}))
      const order = new Order({
        products: products,
        user: {email: req.user.email, userId: req.user._id}
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

exports.getInvoice = (req, res, next) => {
  const {orderId} = req.params;
  Order.findById(orderId).then(order => {
    // console.log(order)
    if(!order){
      return next(new Error("No order found"))
    }
    if(order.user.userId.toString() !== req.user._id.toString()){
      return next(new Error("Unauthorized"))
    }
    const invoiceName = "invoice-" + orderId + ".pdf";
    const invoicePath = path.join("data", "invoices", invoiceName)
    //Create PDF Document
    const pdfDoc = new PDFDocument();
    //Adds headers to the response
    res.setHeader("Content-Type", "application/pdf")
    //res.setHeader('Content-Disposition", "attachment; filename="' + invoiceName + '"') //* downloads pdf
    res.setHeader('Content-Disposition', 'inline; filename=\"' + invoiceName + '\"') //* shows pdf
    //Read/Write Stream
    pdfDoc.pipe(fs.createWriteStream(invoicePath)) //creates/starts write stream
    pdfDoc.pipe(res); //read stream

    pdfDoc.fontSize(24).text("Invoice", {
      underline: true
    })
    pdfDoc.text("---------------------")
    let totalPrice = 0;
    order.products.map(prod => {
      pdfDoc.fontSize(16).text(`${prod.product.title} - ${prod.quantity} x $${prod.product.price}`)
      totalPrice += prod.product.price * prod.quantity
    })
    pdfDoc.fontSize(24).text("---------------------")
    pdfDoc.fontSize(20).text(`Total Price: $${totalPrice}`)
    pdfDoc.end() //ends write stream, saves file, sends response(read stream)



    // fs.readFile(invoicePath, (err, data) => { //* reading file data into memory can cause overflow if too many requests happen
    //   if(err){ return next() }
    //   ... 
    //   res.send(data)
    // })
    // const file = fs.createReadStream(invoicePath);
    // res.setHeader("Content-Type", "application/pdf")
    // //res.setHeader('Content-Disposition", "attachment; filename="' + invoiceName + '"') //* downloads pdf
    // res.setHeader('Content-Disposition", "inline; filename="' + invoiceName + '"') //* shows pdf
    // file.pipe(res) //* forwards data (readable stream) to response (writable stream)
    //Node now doesn't have to preload, instead it streams a buffer and only has to work with one chunk
    //A chunk is what we work with, streams are how we pass them back and forth
    //instead of waiting for all the chunks and concat'ing them, we stream the chunks as we get them to the browser and it concats it

  })
  .catch(err => next(ifErr(err)))

}

exports.getCheckout = (req, res, next) => {
  let products;
  let total;
  req.user
  .populate("cart.items.productId")
  .execPopulate() //Turns popualte to a promise
  .then(user => {
    products = user.cart.items
    total = products.reduce((acc,curr) => acc + (curr.quantity * curr.productId.price), 0)

    return stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: products.map(p => (
        { name: p.productId.title, 
          description: p.productId.description, 
          amount: Math.round(p.productId.price * 100), 
          currency: 'usd',
          quantity: p.quantity
        })),
        success_url: req.protocol + "://" + req.get("host") + "/checkout/success",
        cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel"
    })
    
  })
  .then(session => {
    res.render('shop/checkout', {
      path: '/checkout',
      pageTitle: 'Checkout',
      products: products,
      totalSum: total,
      sessionId: session.id
    })
  })
  .catch(err => next(ifErr(err)));
}


