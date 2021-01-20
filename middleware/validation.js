const {check, body} = require("express-validator")
const User = require("../models/user")

//Auth Routes Validation
exports.Login = () => {
  return [
    check("email")
      .isEmail().withMessage("Invalid Email")
      .normalizeEmail(),
    body("password")
      .isLength({min:6}).withMessage("Password must be atleast 6 characters")
      .trim()
  ]
}

exports.Signup = () => {
  return [
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
    ]
}

//Admin Routes Validation
exports.addProduct = () => {
  return [
    body("title")
      .isString().withMessage("Title must be valid text")
      .isLength({min: 6}).withMessage("Title needs to be atleast 6 characters long")
      .trim(),
    body("imageUrl")
      .isURL().withMessage("Image Url must be a valid Url"),
    body("price")
      .isFloat().withMessage("Price must be a valid price with 2 decimal places"),
    body("description")
      .isLength({min: 8}).withMessage("Description needs to be atleast 8 characters long")
      .isLength({max: 500}).withMessage("Description cannot be longer than 500 characters")
      .trim()
  ]
}

exports.editProduct = () => {
  return (
    body("title")
      .isString().withMessage("Title must be valid text")
      .isLength({min: 6}).withMessage("Title needs to be atleast 6 characters long")
      .trim(),
    body("imageUrl")
      .isURL().withMessage("Image Url must be a valid Url"),
    body("price")
      .isFloat().withMessage("Price must be a valid price with 2 decimal places"),
    body("description")
      .isLength({min: 8}).withMessage("Description needs to be atleast 8 characters long")
      .isLength({max: 500}).withMessage("Description cannot be longer than 500 characters")
      .trim()
  )
}

// [
//   body("title")
//     .isString().withMessage("Title must be valid text")
//     .isLength({min: 6}).withMessage("Title needs to be atleast 6 characters long")
//     .trim(),
//   body("price")
//     .isFloat().withMessage("Price must be a valid price with 2 decimal places"),
//   body("description")
//     .isLength({min: 8}).withMessage("Description needs to be atleast 8 characters long")
//     .isLength({max: 500}).withMessage("Description cannot be longer than 500 characters")
//     .trim()
// ]