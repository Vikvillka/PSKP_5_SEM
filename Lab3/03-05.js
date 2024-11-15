const http = require("http");
const url = require("url");
const fs = require("fs");

const factorial = (n, callback) => {
    if (n <= 1) {
        return setImmediate(() => callback(null, 1));
    }

    setImmediate(() => {
        factorial(n - 1, (err, result) => {
            if (err) {
                return callback(err);
            }
            callback(null, n * result);
        });
    });
};

http.createServer(function(request, response) {
    console.log(request.url);

    const parsedUrl = url.parse(request.url, true);
    const startTime = new Date().getMilliseconds();

    if (parsedUrl.pathname === '/fact' && request.method === 'GET') {
        const k = parseInt(parsedUrl.query.k); 
        if (!isNaN(k) && k >= 0) {
            factorial(k, (err, result) => {
                if (err) {
                    response.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
                    response.end(JSON.stringify({ error: 'Ошибка вычисления факториала.' }));
                } else {
                    const jsonResponse = JSON.stringify({ k: k, fact: result });
                    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    response.end(jsonResponse);
                }
            });
        } else {
            response.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            response.end(JSON.stringify({ error: 'Параметр k должен быть неотрицательным целым числом.' }));
        }
    }

    else if (parsedUrl.pathname === '/' && request.method === 'GET') {
        fs.readFile('03-03.html', 'utf-8', function(err, data) {
            if (err) {
                response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
                response.end("Ошибка сервера");
            } else {
                response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                response.end(data);
            }
        });
    }

    else {
        response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }); 
        response.end(`
            <html>
                <body>
                    <h1>404 Не найдено</h1>
                </body>
            </html>
        `);  
    }

    const finishTime = new Date().getMilliseconds();
    let result = finishTime - startTime;
    console.log (`Time: ${result}`);
    
}).listen(5000, "127.0.0.1", function() {
    console.log("Сервер начал прослушивание запросов на порту 5000");
});