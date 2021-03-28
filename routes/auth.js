const express = require("express");
const { check, body } = require("express-validator/check");
const authController = require("../controllers/auth");
const router = express.Router();

router.get("/login", authController.getLogin);
router.get("/signup", authController.getSignUp);
router.get("/reset/:token", authController.getNewPassword);
router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);
router.post("/login", authController.postLogin);
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        if (value === "test@test.com") {
          throw new Error("This email address is forbidden");
        }
        return true;
      }),
    body(
      "password",
      "Please enter a password with alphabets and numbers and minimum length of 5"
    )
      .isLength({ min: 5 })
      .isAlphanumeric(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match!");
      }
      return true;
    }),
  ],
  authController.postSignUp
);
router.post("/logout", authController.postLogout);
router.post("/new-password", authController.postNewPassword);

module.exports = router;
