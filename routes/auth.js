const express = require("express");
const authController = require("../controllers/auth");
const router = express.Router();

router.get("/login", authController.getLogin);
router.get("/signup", authController.getSignUp);
router.get("/reset/:token", authController.getNewPassword);
router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);
router.post("/login", authController.postLogin);
router.post("/new-password", authController.postNewPassword);
router.post("/signup", authController.postSignUp);
router.post("/logout", authController.postLogout);

module.exports = router;
