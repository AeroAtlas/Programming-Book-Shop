//*server.js
const http = require('http');
const routes = require('./routes');
const server = http.createServer(routes)
server.listen(3000)

//*routes.js
const fs = require('fs'); //filesystem

const reqHandler = (req,res) => {
  const url = req.url
  const method = req.method
  if(url === '/'){
    res.write('<html>')
    res.write('<head><title>Enter Message</title></head>')
    res.write(`<body>
      <form action="/message" method="POST">
        <input type="text" name="message">
          <button type="submit">SEND</button>
        </input>
      </form></body>`)
    res.write('</html>')
    return res.end();
  }

  if(url === '/message' && method === 'POST'){
    const body = [];
    req.on('data', (chunk) => {
      console.log(chunk)
      body.push(chunk);
    });
    req.on('end', () => {
      const parsedBody = Buffer.concat(body).toString();
      const message = parsedBody.split('=')[1]
      console.log(parsedBody)
      fs.writeFile('message.txt', message, (err) => {
        if(err) throw err
      });
    })
    res.statusCode = 302;
    res.setHeader('Location', '/'); //302 is redirect
    return res.end();
  }

  res.setHeader('Content-Type', 'text/html')
  res.write('<html>')
  res.write('<head><title>Enter Message</title></head>')
  res.write(`<body><h1>Hello</h1></body>`)
  res.write('</html>')
  res.end();
}

module.exports = reqHandler;

// module.exports = {
//   hanlder: reqHandler,
//   someText: 'Some text'
// }

// exports.handler = reqHandler;

// router.get('/', (req, res, next) => {
//   console.log('shop.js',adminData.products);
//   res.sendFile(path.join(rootDir, 'views', 'shop.html'));
// });
  // res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
  // res.status(404).sendFile(path.join(__dirname, 'views', '404.html'))