const fs = require('fs');
const path = require('path');
const Cart = require('./cartOld');
const p = path.join(path.dirname(process.mainModule.filename), 'data', 'products.json')

const getProdsFromFs = (cb) => {
  fs.readFile(p, (err, data) => { err ? cb([]) : cb(JSON.parse(data)) })
}

module.exports = class Product {
  constructor(id, title, imageUrl, description, price){
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }
  save(){
    getProdsFromFs(products => {
      if(this.id){
        const existingProdIndex = products.findIndex(prod => prod.id === this.id)
        const updatedProds = [...products];
        updatedProds[existingProdIndex] = this;
        fs.writeFile(p, JSON.stringify(updatedProds), (err) => {
          if(err) console.log(err)
        })
      } else {
        this.id = Math.random().toString();
        products.push(this);
        fs.writeFile(p, JSON.stringify(products), (err) => {
          if(err) console.log(err)
        })
      }
    });
  }
  static deleteById(id){
    getProdsFromFs(products => {
      const product = products.find(prod => prod.id === id)
      const updatedProds = products.filter(prods => prods.id !== id)
      fs.writeFile(p, JSON.stringify(updatedProds), err => { 
        if(!err){
          Cart.deleteProduct(id, product.price)
        }
      })
    })
  }
  static fetchAll(cb){
    getProdsFromFs(cb)
  }

  static findById(id, cb){
    getProdsFromFs(products => {
      const product = products.find(prod => prod.id === id)
      cb(product)
    })
  }

}