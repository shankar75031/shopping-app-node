const { getDb } = require("../util/database");
const mongodb = require("mongodb");
class Product {
  constructor(title, price, description, imageUrl, _id) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = _id ? new mongodb.ObjectId(_id) : null;
  }

  save() {
    const db = getDb();
    let dbOperation;
    if (this._id) {
      // Update db
      dbOperation = db.collection("products").updateOne(
        { _id: this._id },
        {
          $set: this,
        }
      );
    } else {
      dbOperation = db.collection("products").insertOne(this);
    }
    return dbOperation
      .then((result) => console.log(result))
      .catch((err) => console.error(err));
  }

  static fetchAll() {
    const db = getDb();
    return db
      .collection("products")
      .find()
      .toArray()
      .then((products) => {
        console.log(products);
        return products;
      })
      .catch((err) => console.error(err));
  }

  static findById(prodId) {
    const db = getDb();
    return db
      .collection("products")
      .find({ _id: new mongodb.ObjectID(prodId) })
      .next()
      .then((product) => {
        console.log(product);
        return product;
      })
      .catch((err) => {
        console.error(err);
      });
  }

  static deleteById(prodId) {
    const db = getDb();
    return db
      .collection("products")
      .deleteOne({ _id: new mongodb.ObjectId(prodId) })
      .then((result) => {
        console.log(result);
      })
      .catch((err) => console.error(err));
  }
}

module.exports = Product;
