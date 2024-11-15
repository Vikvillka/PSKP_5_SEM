const http = require('http');
const querystring = require('querystring');

const postData = querystring.stringify({
    x: 5,    
    y: 10,    
    s: 'test' 
});

const options = {
    hostname: 'localhost',
    port: 5000, 
    path: '/3', 
    method: 'POST'
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

req.write(postData);
req.end();