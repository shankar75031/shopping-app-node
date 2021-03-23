const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/error");
const sequelize = require("./util/database");

const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const Order = require("./models/order");
const CartItem = require("./models/cartItem");
const OrderItem = require("./models/orderItem");
const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Middleware to add user to the request object
app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.error(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// Data relations
// A product belongs to only one user
Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
// A user can have many products
User.hasMany(Product);
// A user has only one cart
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });

// initialize tables. dont force in production.
let selectedUser;
// { force: true }
sequelize
  .sync()
  .then((result) => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: "Prabha", email: "test@gmail.com" });
    }
    return user;
  })
  .then((user) => {
    selectedUser = user;
    return user.getCart();
  })
  .then((cart) => {
    if (!cart) {
      return selectedUser.createCart();
    } else {
      return cart;
    }
  })
  .then((cart) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
