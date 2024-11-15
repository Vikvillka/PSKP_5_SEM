const http = require("http");

http.createServer(function(request, response){
    console.log(request.url);

    if (request.url === "/api/name") {
        response.setHeader('Content-Type', 'text/plane; charset=utf-8');
        response.end("Бычковская Виктория Александровна");
    } else {
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