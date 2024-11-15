const http = require('http');

const jsonObject = JSON.stringify({
    "comment": "Запрос.Лабораторная работа 8/10",
    "x": 1,
    "y": 2,
    "s": "Сообщение",
    "m": ["a", "b", "c", "d"],
    "o": {
    "surname": "Иванов",
    "name": "Иван"
    }
});

const options = {
    hostname: 'localhost',
    port: 5000, 
    path: '/4', 
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
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

req.write(jsonObject);
req.end();