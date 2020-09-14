// const http = require('http');
const express = require('express');

const app = express();
// const server = http.createServer(app);

app.use('/', (req,res,next)=>{
  console.log('This always runs')
  next()
})

app.use('/add-product', (req, res, next) => {
  console.log("In the 2nd middleware");
  res.send('<form><input type="text" name="title"><button type="submit">Add Product</button></form>');
});

app.use('/', (req, res, next) => {
  console.log("In the 2nd middleware");
  res.send('<h1>Hello from express</h1>');
});

app.listen(3000);

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