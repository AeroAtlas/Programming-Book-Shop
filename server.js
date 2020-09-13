const http = require('http');
const fs = require('fs'); //filesystem

const server = http.createServer((req,res) => {
  // console.group(req.url, req.method, req.headers)
  // process.exit()
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
      fs.writeFileSync('message.txt', message);
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
})

server.listen(3000)


//Stream -> ReqBody1 => ReqBody2 => Buffer[ReqBody3 => ReqBody4] -> Fully Parsed