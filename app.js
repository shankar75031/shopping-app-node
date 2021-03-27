const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const csrf = require("csurf");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const errorController = require("./controllers/error");
const User = require("./models/user");
const MongoDbStore = require("connect-mongodb-session")(session);
const { ObjectId } = require("bson");

const MONGO_DB_URI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.edrzp.mongodb.net/shop?retryWrites=true&w=majority`;

const app = express();
const store = new MongoDbStore({
  uri: MONGO_DB_URI,
  databaseName: "shop",
  collection: "sessions",
});

const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "olaf",
    resave: false, // Session will not be saved on every requires
    saveUninitialized: false, // Session is not saved for a request that doesn't require to save the session
    // You can also configure session cookie here
    store: store,
  })
);
app.use(csrfProtection);
app.use(flash());

// Middleware to add user to the request object
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.error(err));
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGO_DB_URI, { useNewUrlParser: true })
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.error(err);
  });
