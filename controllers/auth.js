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
    isAuthenticated: false
  })
}

exports.postLogin = (req, res, next) => {
  User.findById("5f738120b72eea54042dc5af")
    .then(user => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save(err => {
        if(err){ console.log(err) }
        res.redirect("/");
      });
    })
    .catch(err => console.log(err))
}

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    if(err) { console.log(err) }
    res.redirect("/");
  });
}