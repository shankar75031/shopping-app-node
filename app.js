const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const errorController = require("./controllers/error");
const User = require("./models/user");
const { ObjectId } = require("bson");
const app = express();

const dbUrl = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.edrzp.mongodb.net/shop?retryWrites=true&w=majority`;

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Middleware to add user to the request object
app.use((req, res, next) => {
  User.findById("605ceda69fab784320205c1a")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.error(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(dbUrl, { useNewUrlParser: true })
  .then((result) => {
    return User.findOne();
  })
  .then((user) => {
    if (!user) {
      const newUser = new User({
        name: "Anna & Elsa",
        email: "max@test.com",
        cart: {
          items: [],
        },
      });
      newUser.save();
    }

    console.log("DB Connected");
    app.listen(3000);
  })
  .catch((err) => {
    console.error(err);
  });
