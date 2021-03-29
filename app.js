const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
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
app.use(multer({ dest: "images" }).single("image"));
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

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Middleware to add user to the request object
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      // In callbacks use next(error) in synchronous code use throw new Error();
      next(new Error(err));
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get("/500", errorController.get500);
app.use(errorController.get404);

// Special error handling middleware with 4 args, first being error
// This is called when you call next with error as arguement next(err);
app.use((error, req, res, next) => {
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

mongoose
  .connect(MONGO_DB_URI, { useNewUrlParser: true })
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.error(err);
  });
