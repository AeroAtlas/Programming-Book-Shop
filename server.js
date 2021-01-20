require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");

//PORT
const PORT = process.env.PORT || 3000; 

//Controller
const errorController = require('./controllers/error');
//Models 
const User = require("./models/user");
//Initialize Express
const app = express();
//Initialize Store
const store = new MongoDBStore({
  uri: process.env.MONGODB_PASS, collection: "sessions"
});
//CSRF Protection
const csrfProtection = csrf();
//Multer File Storage Config
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images")
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname)
  }
})
//Multer File Storage Filter (might add more file types later)
const fileFilter = (req, file, cb) => {
  if(file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
    cb(null, true);
  }
  cb(null, false);

}


//Set global config value and tell express where to find templates
app.set('view engine', 'ejs');
app.set('views', 'views');

//Create Route Variables
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

//? Middleware (incomming requests are only funned through Middleware)
//Body Parser (handles text based)
app.use(bodyParser.urlencoded({extended: false}));
//Multer (handles images [input in ejs cannot be named image, so changed both to imageUrl])
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single("imageUrl"));
//Static files (read access)
app.use(express.static(path.join(__dirname, 'public')));
app.use("/images", express.static(path.join(__dirname, 'images')));
//Sessions
app.use(session({secret: process.env.SECRET, resave: false, saveUninitialized: false, store: store}));
//CSRF
app.use(csrfProtection);
//Flash
app.use(flash());

//Authentication Middleware
app.use((req,res,next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
})

//User middleware for mongoose model
app.use((req,res,next) => {
  //throw new Error (not async works but it will loop infinitely)
  if(!req.session.user){
    return next();
  }
  User.findById(req.session.user._id)
  .then(user => {
    if(!user){
      return next();
    }
    req.user = user
    next();
  })
  .catch(err => { 
    next(new Error(err)); //all async code needs next() to get error to errorHandle middleware
  })
})



//Routing
app.use('/admin', adminRoutes);
app.use('/', shopRoutes);
app.use('/', authRoutes);

//Render 500 if an error occurs
app.get("/500", errorController.anErrorOccured);
//Render 404 if no routes are hit
app.use(errorController.noPageFound);
//Error Handling Middleware
app.use((error, req, res, next) => {
  //res.status(error.httpStatusCode).render()
  res.redirect("/500");
});

//Database Connect
mongoose.connect(process.env.MONGODB_PASS)
  .then(() => app.listen(PORT))
  .catch(err => console.log(err));
