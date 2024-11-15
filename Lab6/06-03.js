const http = require('http');
const fs = require('fs');
const url = require('url');
const { send } = require('./m0603');

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        fs.readFile('index.html', 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end('Error loading page');
                return;
            }
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.end(data);
        });
    } else if (req.method === 'POST' && req.url === '/send') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { message } = Object.fromEntries(new URLSearchParams(body));

            send(message)
                .then(reply => {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({ message: 'Email sent successfully!' }));
                })
                .catch(err => {
                    res.writeHead(500, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({ message: 'Error sending email' }));
                });
        });
    } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Unknown route');
    }
});

server.listen(5000, () => {
    console.log("http://localhost:5000");
});