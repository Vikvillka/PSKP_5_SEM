const http = require('http');
const fs = require('fs');
const FormData = require('form-data');

const form = new FormData();

const filePath = './MyFile.txt';
form.append('file', fs.createReadStream(filePath));

const options = {
    hostname: 'localhost',
    port: 5000, 
    path: '/6', 
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
        console.log('Данные ответа:');
        console.log(data);
    });
});

req.on('error', (error) => {
    console.error(`Ошибка запроса: ${error.message}`);
});

form.pipe(req);