const express = require("express");
const {check, body} = require("express-validator/check")
const authController = require("../controllers/auth");
const User = require("../models/user")
const router = express.Router();

router.get("/login", authController.getLogin);
router.get("/signup", authController.getSignup)
router.post("/login", [
  check("email")
    .isEmail().withMessage("Invalid Email")
    .normalizeEmail(),
  body("password")
    .isLength({min:6}).withMessage("Password must be atleast 6 characters")
    .trim()
    // .isAlphanumeric().withMessage("Password may only contain alphanumeric characters") //* Remove this
], authController.postLogin);
router.post("/logout", authController.postLogout);
router.post("/signup", [
  check("email")
    .isEmail().withMessage("Invalid Email")
    .custom((value, {req}) => { //custom validator
      return User.findOne({email:value}) //the return will resolve the promise if it is rejected or accepted (async validation)
        .then(userData => {
          if(userData){
            return Promise.reject("E-mail is already taken")
            // req.flash('error', 'E-mail is already taken')
            // return res.redirect("/signup")
          }
        })
    })
    .normalizeEmail(),
  //body("password", "Password must be alphanumeric and be atleast 6 characters long").isLength({min: 6}).isAlphanumeric()
  body("password")
    .isLength({min:6}).withMessage("Password must be atleast 6 characters")
    .trim(),
    // .isAlphanumeric().withMessage("Password may only contain alphanumeric characters"), //* Remove this
  body("confirmPassword").trim().custom((value, {req}) => {
    if(value !== req.body.password){
      throw new Error("Passwords have to match")
    }
    return true;
  })
  ], authController.postSignup)
router.get("/reset", authController.getReset)
router.post("/reset", authController.postReset)
router.get("/reset/:token", authController.getNewPassword)
router.post("/new-password", authController.postNewPassword)

module.exports = router;