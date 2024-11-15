const http = require('http');
const fs = require('fs');
const sendmail = require('sendmail')();


const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        fs.readFile('./index.html', 'utf8', (err, data) => {
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
            const { from, to, message } = Object.fromEntries(new URLSearchParams(body));

            sendmail({
                from: from,
                to: to,
                subject: 'msg',
                html: message,
                
            }, (err, reply) => {
                if (err) {
                    res.writeHead(500, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({ message: 'Error sending email' }));
                } else {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({ message: 'Email sent successfully!' }));
                }
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