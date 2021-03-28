const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const sendInBlueTransport = require("nodemailer-sendinblue-transport");
const { reset } = require("nodemon");
const { validationResult } = require("express-validator/check");
const User = require("../models/user");

const transporter = nodemailer.createTransport(
  sendInBlueTransport({
    apiKey: process.env.SENDINBLUE_API_KEY,
    apiUrl: "https://api.sendinblue.com/v3.0",
  })
);

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

exports.getSignUp = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array(),
    });
  } else {
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: "Invalid email or password",
            oldInput: {
              email: email,
              password: password,
            },
            validationErrors: [],
          });
        }
        bcrypt
          .compare(password, user.password)
          .then((doMatch) => {
            // If password match or do not match we reach then block
            if (doMatch) {
              req.session.isLoggedIn = true;
              req.session.user = user;
              return req.session.save((err) => {
                console.log(err);
                return res.redirect("/");
              });
            }
            return res.status(422).render("auth/login", {
              path: "/login",
              pageTitle: "Login",
              errorMessage: "Invalid email or password",
              oldInput: {
                email: email,
                password: password,
              },
              validationErrors: [],
            });
          })
          .catch((err) => console.error(err));
      })
      .catch((err) => console.log(err));
  }
};

exports.postSignUp = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationErrors: errors.array(),
    });
  } else {
    bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        const user = new User({
          email: email,
          password: hashedPassword,
          cart: { items: [] },
        });
        return user.save();
      })
      .then((result) => {
        res.redirect("/login");
        return transporter.sendMail({
          to: email,
          from: "shankar75031@gmail.com",
          subject: "Welcome to Shoppi",
          html: "<h1>Sign up successful</h1>",
        });
      })
      .catch((err) => console.error(err));
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email found!");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 36000000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        return transporter.sendMail({
          to: req.body.email,
          from: "shankar75031@gmail.com",
          subject: "Password Reset",
          html: `
          <h1>You requested a password reset</h1>
          <p>Click this <a href="http://localhost:3000/reset/${token}">LINK</a> to reset password.</p>
          `,
        });
      })
      .catch((error) => console.error(error));
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => console.error(err));
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  User.findOne({
    _id: userId,
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => console.error(err));
};
