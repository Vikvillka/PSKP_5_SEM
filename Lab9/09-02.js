const http = require('http');

const x = 1; 
const y = 2; 

const options = {
    hostname: 'localhost',
    port: 5000,
    path: `/2?x=${x}&&y=${y}`,
    method: 'GET'
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

req.end();