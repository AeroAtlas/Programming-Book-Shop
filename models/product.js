const fs = require('fs');
const path = require('path');
const p = path.join(path.dirname(process.mainModule.filename), 'data', 'products.json')

const getProdsFromFs = (cb) => {
  fs.readFile(p, (err, data) => { err ? cb([]) : cb(JSON.parse(data)) })
}

module.exports = class Product {
  constructor(title, imageUrl, description, price){
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }
  save(){
    this.id = Math.random().toString();
    getProdsFromFs(products => {
      products.push(this);
      fs.writeFile(p, JSON.stringify(products), (err) => {
        console.log(err)
      })
    });
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