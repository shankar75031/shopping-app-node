const path = require("path");
const fs = require("fs");
const express = require("express");
const https = require("https");
const mongoose = require("mongoose");
const multer = require("multer");
const session = require("express-session");
const csrf = require("csurf");
const helmet = require("helmet");
const compression = require("compression");
const dotenv = require("dotenv");
const morgan = require("morgan");
const flash = require("connect-flash");
const hash = require("random-hash");
const bodyParser = require("body-parser");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const errorController = require("./controllers/error");
const User = require("./models/user");
const MongoDBStore = require("connect-mongodb-session")(session);

dotenv.config()

const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.edrzp.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`;

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});
const csrfProtection = csrf();

const privateKey = fs.readFileSync('server.key')
const certificate = fs.readFileSync('server.cert')

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // cb(null, path.join(__dirname, "images"));
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, hash.generateHash({ length: 5 }) + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", "views");

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})
app.use(helmet())
app.use(compression())
app.use(morgan('combined', {stream: accessLogStream}))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
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

app.use((req, res, next) => {
  // throw new Error('Sync Dummy');
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
      next(new Error(err));
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...);
  // res.redirect('/500');
  console.log(error);
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: error.isLoggedIn,
  });
});

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    console.log("DB CONNECTED");
    // https.createServer({key: privateKey, cert: certificate}, app)
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log(err);
  });
