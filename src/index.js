import http from 'http';

const SERVER_PORT = 8080;

http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(SERVER_PORT, '127.0.0.1');

console.log(`Server running at http://127.0.0.1:${SERVER_PORT}`);
