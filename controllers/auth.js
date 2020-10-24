require("dotenv").config();
const crypto = require("crypto")
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
  // console.log(req.flash('error')[0])
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
          } else {
            req.flash('error', 'Invalid email or password')
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

exports.getReset = (req, res, next) => {
  res.render("auth/reset", {
    path: '/reset',
    pageTitle: "Reset Password",
    errorMessage: req.flash('error')[0]
  })
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if(err){
      console.log(err)
      req.flash('error', 'An error has occured. Please try again')
      return res.redirect('/reset')
    }
    const token = buffer.toString('hex'); //convert hexidecimal to ascii string
    User.findOne({email: req.body.email})
      .then(user => {
        if(!user){
          req.flash('error', 'No account with that email found')
          return res.redirect('/reset')
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3_600_000
        return user.save()
      })
      .then(result => {
        res.redirect('/');
        return transporter.sendMail({
          to: req.body.email,
          from: process.env.MY_EMAIL,
          subject: 'Password Reset',
          html: `
<p>You requested a password reset</p>
<p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
          `
        })
      })
      .catch(err => console.log(err))
  })
}

exports.getNewPassword = (req, res, next) => {
  const {token} = req.params;
  User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
    .then(user => {
      res.render("auth/new-password", {
        path: '/new-password',
        pageTitle: "New Password",
        errorMessage: req.flash('error')[0],
        userId: user._id.toString(),
        passwordToken: token
      })
    })
    .catch(err => console.log(err))

}

exports.postNewPassword = (req, res, next) => {
  const {password, userId, passwordToken} = req.body;
  let resetUser;

  User.findOne({resetToken: passwordToken, resetTokenExpiration: {$gt: Date.now()}, _id: userId})
    .then(user => {
      resetUser = user;
      return bcrypt.hash(password, 12)
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = null;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save()
    })
    .then(() => {
      res.redirect('/login')
      //Sending email to confirm reset
      return transporter.sendMail({ //need to test again
        to: resetUser.email,
        from: process.env.MY_EMAIL,
        subject: 'Password Reset',
        html: `
<p>Your password has been reset</p>
<p>If you did not request this change notify us immediately</p>
        `
      })
    }) 
    .catch(err => console.log(err))
}