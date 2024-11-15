const http = require('http');
const fs = require('fs');

let options = {
    host: 'localhost',
    path: '/8',
    port: 5000,
    method: 'GET'
}
const req = http.request(options, (res) => {
    res.pipe(fs.createWriteStream('file_from_server.png'));
});

req.on('error', (error) => {
    console.error(`Ошибка запроса: ${error.message}`);
});

req.end();