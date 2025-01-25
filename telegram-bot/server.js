const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello, world!');
});

server.listen(5000, () => {
  console.log('Node.js server is running on http://localhost:5000');
});
