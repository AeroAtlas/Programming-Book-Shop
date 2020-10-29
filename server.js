require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require("mongoose")
const session = require("express-session")
const MongoDBStore = require("connect-mongodb-session")(session)
const csrf = require("csurf");
const flash = require("connect-flash")

//PORT
const PORT = 3000 || process.env.PORT

//Controller
const errorController = require('./controllers/error');
//Models 
const User = require("./models/user")
//Initialize Express
const app = express();
//Initialize Store
const store = new MongoDBStore({
  uri: process.env.MONGODB_PASS, collection: "sessions"
})
//CSRF Protection
const csrfProtection = csrf();


//Set global config value and tell express where to find templates
app.set('view engine', 'ejs');
app.set('views', 'views');

//Create Route Variables
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

//? Middleware (incomming requests are only funned through Middleware)
//Body Parser
app.use(bodyParser.urlencoded({extended: false}));
//Static files (read access)
app.use(express.static(path.join(__dirname, 'public')));
//Sessions
app.use(session({secret: process.env.SECRET, resave: false, saveUninitialized: false, store: store}));
//CSRF
app.use(csrfProtection);
//Flash
app.use(flash())


//User middleware for mongoose model
app.use((req,res,next) => {
  if(!req.session.user){
    return next()
  }
  User.findById(req.session.user._id)
  .then(user => {
    if(!user){
      return next()
    }
    req.user = user
    next();
  })
  .catch(err => { throw new Error(err) })
})

//Authentication Middleware
app.use((req,res,next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
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
  res.redirect("/500")
})

//Database Connect
mongoose.connect(process.env.MONGODB_PASS)
  .then(() => app.listen(PORT))
  .catch(err => console.log(err))


















//app.use([path,]callback[,callback])...





//Client -> Request -> Server -> Response -> Client


//Stream -> ReqBody1 => ReqBody2 => Buffer[ReqBody3 => ReqBody4] -> Fully Parsed

/*Incoming Req -> MyCode + Single JS Thread 
                            ->Event Loop(only finish fast finishing code) -> Handle Event Callbacks 
                            ->"fs" -sent to-> WorkerPool (Does the heavy lifting & runs of diff threads)
                                                  ->^ triggers callback to EventLoop
Event Loop  -> Timers(Execute setTimeout, setInterval Callback)
            -> Pending Callbacks (Execute I/O-related (input/output-disk + network operations ~blocking ops). Callbacks that were defered)
              ( if too many callbacks it will skip a few and give those callback to the next loop )
            -> Poll (retrieve new I/O events, execute their callbacks). If not possible defer to pending cb's and check for timers cb's
            -> Check (execute setImmediate() callbacks) executes immediate after any open callbacks. faster than settimeout. after current cycle
            -> Close Callbaccks (execute all close event callbacks)
            --> process.exit (if (refs == 0)) [refs is for every new callback] -1 ever completed callback
                ** Listen doesn't let refs decrease so it stays looping
*/

/*
Middleware -> Request -> Middleware () -> Response
*/