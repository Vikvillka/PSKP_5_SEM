const http = require("http");
const fs = require("fs");

http.createServer(function(request, response){
    console.log(request.url);

    if (request.url === "/xmlhttprequest") {
        fs.readFile("xmlhttprequest.html", "utf8", function(err, data) {
            if (err) {
                response.writeHead(500, { "Content-Type": "text/plain" });
                response.end("Internal Server Error");
            } else {
                response.writeHead(200, { "Content-Type": "text/html" });
                response.end(data);
            }
        });
    } else if (request.url === "/api/name") {
        response.writeHead(200, { "Content-Type": "text/html" });
        response.end("Бычковская Виктория Александровна");
    }
    else {
        response.end(`
        <html>
            <body>
                <h1>Error:5000/html</h1>
            </body>
        </html>
    `);  
    }
     
}).listen(5000, "127.0.0.1", function(){
    console.log("Сервер начал прослушивание запросов на порту 5000");
});