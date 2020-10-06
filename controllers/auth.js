const bcrypt = require("bcryptjs"); 
const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  // console.log(req.get("Cookie"))
  // let isLoggedIn;
  // if(!req.get("Cookie").split(";")[1]){
  //   isLoggedIn = (req.get("Cookie").trim().split("=")[1] === "true")
  // } else {
  //   isLoggedIn = (req.get("Cookie").split(";")[1].trim().split("=")[1] === "true")
  // }
  // console.log(isLoggedIn)

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: req.flash('error')
  })
}

exports.getSignup = (req,res,next) => {
  res.render("auth/signup", {
    path: '/signup',
    pageTitle: "Signup"
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
        return res.redirect("/signup")
      }
      return bcrypt.hash(password, 12)
        .then(hashPass => {
          const user = new User({
            email: email, password: hashPass, cart: {items: []}
          });
          return user.save();
        })
        .then(() => res.redirect("/login"))
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    if(err) { console.log(err) }
    res.redirect("/");
  });
}