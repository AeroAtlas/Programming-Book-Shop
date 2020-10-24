const {Schema, model} = require("mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken:{
    type: String
  },
  resetTokenExpiration:{
    type: String
  },
  cart: {
    items: [
      {productId: {type: Schema.Types.ObjectId, ref: "Product", required: true},
       quantity: {type: Number, required: true}}]
  }
})

userSchema.methods.addToCart = function(product) {
  const cartProductIndex = this.cart.items.findIndex(cp => {
    return cp.productId.toString() === product._id.toString()
  })
  const updatedCartItems = [...this.cart.items];
  if (cartProductIndex >= 0){
    updatedCartItems[cartProductIndex].quantity = this.cart.items[cartProductIndex].quantity + 1
  } else {
    updatedCartItems.push({productId: product._id, quantity: 1})
  }
  this.cart = {items: updatedCartItems}
  return this.save()
}

userSchema.methods.removeFromCart = function(productId){
  this.cart.items = this.cart.items.filter(item => item.productId.toString() !== productId.toString())
  return this.save()
}

userSchema.methods.clearCart = function(){
  this.cart = {items: []}
  return this.save()
}

module.exports = model("User", userSchema)




// const mongodb = require("mongodb");
// const {getDb} = require("../util/database");

// class User {
//   constructor(username, email, cart, id){
//     this.name = username;
//     this.email = email;
//     this.cart = cart; // {items: []}
//     this._id = id;
//   }
//   save(){
//     const db = getDb();
//     return db.collection("users").insertOne(this)
//   }
//   addToCart(product){
//     const cartProductIndex = this.cart.items.findIndex(cp => {
//       return cp.productId.toString() === product._id.toString()
//     })
//     const updatedCartItems = [...this.cart.items];
//     if (cartProductIndex >= 0){
//       updatedCartItems[cartProductIndex].quantity = this.cart.items[cartProductIndex].quantity + 1
//     } else {
//       updatedCartItems.push({productId: new mongodb.ObjectId(product._id), quantity: 1})
//     }
//     const updatedCart = {items: updatedCartItems}
//     const db = getDb();
//     return db.collection("users")
//       .updateOne({_id: new mongodb.ObjectId(this._id)}, {$set: {cart: updatedCart}})
//   }

//   getCart(){
//     const db = getDb();
//     const productIds = this.cart.items.map(item => item.productId)
//     return db.collection("products")
//       .find({_id: {$in: productIds}}).toArray()
//       .then(products => {
//         //* Add feature to remove deleted content from carts
//         // console.log(products)
//         // if(products.length < productIds.length){
//         //   return products.filter((prod, index) => prod._id === productIds[i])
//         // }
//         return products.map(prod => 
//           ({...prod, quantity: this.cart.items.find(item =>
//             item.productId.toString() === prod._id.toString()).quantity }))
//       });
//   }

//   deleteItemFromCart(productId){
//     const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString())
//     const db = getDb();
//     return db.collection("users")
//       .updateOne({_id: new mongodb.ObjectId(this._id)}, {$set: {cart: {items: updatedCartItems}}})
//   }

//   addOrder(){
//     const db = getDb();
//     return this.getCart()
//       .then(products => {
//         const order = {items: products, user: {_id: new mongodb.ObjectId(this._id), name: this.name}}
//         return db.collection("orders").insertOne(order)
//       })
//       .then(() => {
//         this.cart = {items: []}
//         return db.collection("users")
//         .updateOne({_id: new mongodb.ObjectId(this._id)}, {$set: {cart: {items: []}}})
//       })
//   }

//   getOrders(){
//     const db = getDb();
//     return db.collection("orders").find({"user._id": new mongodb.ObjectId(this._id)}).toArray();
//   }

//   static findById(userId){
//     const db = getDb();
//     return db.collection("users").findOne({_id: new mongodb.ObjectId(userId)})
//       .then(user => {
//         console.log(user)
//         return user;
//       })
//       .catch(err => console.log(err))
//   }

// }

// module.exports = User;