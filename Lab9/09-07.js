const http = require('http');
const fs = require('fs');
const FormData = require('form-data');

const filePath = './MyFile.png'; 
const form = new FormData();
form.append('file', fs.createReadStream(filePath));

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/7', 
    method: 'POST',
    headers: form.getHeaders()
};

const req = http.request(options, (res) => {
    let data = '';

    console.log(`Статус ответа: ${res.statusCode}`);

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Ответ от сервера:');
        console.log(data);
    });
});

req.on('error', (error) => {
    console.error(`Ошибка запроса: ${error.message}`);
});

form.pipe(req);