require("dotenv").config();
const bcrypt = require("bcryptjs"); 
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const User = require("../models/user");

//Transporter for nodemailer
const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: process.env.SENDGRID_KEY
  }
}))

exports.getLogin = (req, res, next) => {
  // console.log(req.get("Cookie"))
  // let isLoggedIn;
  // if(!req.get("Cookie").split(";")[1]){
  //   isLoggedIn = (req.get("Cookie").trim().split("=")[1] === "true")
  // } else {
  //   isLoggedIn = (req.get("Cookie").split(";")[1].trim().split("=")[1] === "true")
  // }
  // console.log(isLoggedIn)
  console.log(req.flash('error')[0])
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: req.flash('error')[0]
  })
}

exports.getSignup = (req,res,next) => {
  res.render("auth/signup", {
    path: '/signup',
    pageTitle: "Signup",
    errorMessage: req.flash('error')[0]
  })
};

exports.postLogin = (req, res, next) => {
  const {email, password} = req.body
  User.findOne({email:email})
    .then(user => {
      if(!user){
        req.flash('error', 'Invalid email or password')
        return res.redirect("/login");
      }
      bcrypt.compare(password, user.password)
        .then(doMatch => {
          if(doMatch){
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              if(err){ console.log(err) }
              return res.redirect("/");
            });
          }
          res.redirect("/login");
        })
        .catch(err => {
          console.log(err)
          res.redirect("/login")
        })
    })
    .catch(err => console.log(err))
}

exports.postSignup = (req,res,next) => {
  const {email, password, confirmPassword} = req.body;
  //check for password vs confirmPassword
  User.findOne({email:email})
    .then(userData => {
      if(userData){
        req.flash('error', 'E-mail is already taken')
        return res.redirect("/signup")
      }
      return bcrypt.hash(password, 12)
        .then(hashPass => {
          const user = new User({
            email: email, password: hashPass, cart: {items: []}
          });
          return user.save();
        })
        .then(() => {
          res.redirect("/login")
          return transporter.sendMail({
            to: email,
            from: process.env.MY_EMAIL,
            subject: 'Signup suceeded',
            html: '<h1>You have successfully signed up</h1>'
          })
        })
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    if(err) { console.log(err) }
    res.redirect("/");
  });
}