const path = require("path");
const fs = require("fs");

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
  constructor(title, imageUrl, description, price) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductsFromFile((products) => {
      fs.readFile(p, (error, fileContent) => {
        if (!error) {
          products = JSON.parse(fileContent);
        }
        products.push(this);
        fs.writeFile(p, JSON.stringify(products), (error) => {
          console.log(error);
        });
      });
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }
};
