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
  res.setHeader("Set-Cookie", "loggedIn=true; HttpOnly")
  res.redirect("/")
}