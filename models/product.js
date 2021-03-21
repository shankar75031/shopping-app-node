const path = require("path");
const fs = require("fs");
const Cart = require("./cart");

const p = path.join(
  path.dirname(process.mainModule.filename),
  "data",
  "products.json"
);

const getProductsFromFile = (cb) => {
  fs.readFile(p, (error, fileContent) => {
    if (error) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    console.log(this.id);
    getProductsFromFile((products) => {
      if (this.id) {
        const existingProductIndex = products.findIndex(
          (prod) => prod.id === this.id
        );
        const updatedProducts = [...products];
        console.log(this.title);
        updatedProducts[existingProductIndex] = this;
        console.log(
          updatedProducts.forEach((product) => console.log(product.title))
        );
        fs.writeFile(p, JSON.stringify(updatedProducts), (error) => {
          console.log(error);
        });
      } else {
        this.id = Math.random().toString();
        fs.readFile(p, (error, fileContent) => {
          if (!error) {
            products = JSON.parse(fileContent);
          }
          products.push(this);
          fs.writeFile(p, JSON.stringify(products), (error) => {
            console.log("error" + error);
          });
        });
      }
    });
  }

  static deleteById(id, callback) {
    getProductsFromFile((products) => {
      const product = products.find((prod) => prod.id === id);

      const updatedProducts = products.filter((product) => product.id !== id);
      fs.writeFile(p, JSON.stringify(updatedProducts), (error) => {
        if (!error) {
          Cart.deleteProduct(id, product.price, product.price);
        }
      });
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }
  static findById(productId, cb) {
    getProductsFromFile((products) => {
      const product = products.find((pr) => {
        return pr.id === productId;
      });
      console.log(product);
      cb(product);
    });
  }
};
