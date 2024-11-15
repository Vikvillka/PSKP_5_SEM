const http = require("http");
const fs = require("fs");

http.createServer(function(request, response){
    console.log(request.url);

    if (request.url === "/png") {
        fs.readFile("D:\\5_SEM_LABS\\PSKP\\Lab2\\pic.png", function (err, data) {
            if (err) {
                response.writeHead("500", { "Content-type": "text-plain" });
                response.end("Internal Server Error");
            } else {
                response.writeHead("200", { "Content-type": "image/png" });
                response.end(data);
            }
        });
    } else {
        response.end(`
        <html>
            <body>
                <h1>Error:5000/png</h1>
            </body>
        </html>
    `);  
    }
     
}).listen(5000, "127.0.0.1", function(){
    console.log("Сервер начал прослушивание запросов на порту 5000");
});