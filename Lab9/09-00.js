const http = require('http');
const url = require("url");
const parseString = require('xml2js').parseString;
const mp = require('multiparty');
const fs = require("fs");
const querystring = require('querystring');


http.createServer((req, res) => {
    let parsedUrl = url.parse(req.url, true);
    const { x, y } = parsedUrl.query;
    let form = new mp.Form({ uploadDir: './static' });

    switch (parsedUrl.pathname) {
        case '/':
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`Task first`);
            break;
        case "/2": {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            let x = parsedUrl.query.x;
            let y = parsedUrl.query.y;
            res.end(`Second task x = ${x}, y = ${y}`);
            break;
            
        }
        case "/3": {
            let data = '';

            req.on('data', (chunk) => {
                data += chunk;
            });
            req.on('end', () => {
                const parsedBody = querystring.parse(data);
                const x = parsedBody.x;
                const y = parsedBody.y;
                const s = parsedBody.s;
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`Third task x = ${x}, y = ${y}, s = ${s}`);
            });

            break;
        }
        case "/4":
            let data = '';
            req.on('data', (chunk) => {
                data += chunk;
            });
            req.on('end', () => {
                data = JSON.parse(data);
                res.writeHead(200, { 'Content-type': 'application/json; charset=utf-8' });
                let resp = {};
                resp.__comment = data.comment ;
                resp.x_plus_y = data.x + data.y;
                resp.Concatenation_s_o = data.s + ': ' + data.o.surname + ', ' + data.o.name;
                resp.Length_m = data.m.length;
                res.end(JSON.stringify(resp));
            });
            break;
        case "/5": {
            let data = '';
            req.on('data', (chunk) => {
                data += chunk;
            });
            req.on('end', () => {
                parseString(data, (err, result) => {
                    res.writeHead(200, { 'Content-type': 'application/xml' });
                    let id = result.request.$.id;
                    let sum = 0;
                    let concat = '';
                    result.request.x.forEach((p) => {
                        sum += parseInt(p.$.value);
                    });
                    result.request.m.forEach((p) => {
                        concat += p.$.value;
                    });

                    let responseText = `<response id="33" request="${id}"><sum element="x" result="${sum}"/><concat element="m" result="${concat}"/></response>`;
                    res.end(responseText);
                });
            });
            break;
        }
        case "/6":
            form.on('field', (name, field) => {
              console.log(field);
              result += `'${name}' = ${field}`;
            });
             form.on('file', (name, file) => {
              console.log(name, file);
              const filePath = './Upload_MyFile.txt'; 
              const readStream = fs.createReadStream(file.path);
              const writeStream = fs.createWriteStream(filePath);
          
              readStream.pipe(writeStream); 
            });
          
            form.on('error', (err) => {
              res.writeHead(500, { 'Content-Type': 'text/html' });
              console.log('error', err.message);
              res.end('Ошибка формы.');
            });
          
            form.on('close', () => {
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.write('Данные:');
              res.end(' файл добавлен');
            });
          
            form.parse(req);
            break;
        case "/7":
            form.on('field', (name, field) => {
              console.log(field);
              result += `'${name}' = ${field}`;
            });
          
            form.on('file', (name, file) => {
              console.log(name, file);
              const filePath = './server.png'; 
              const readStream = fs.createReadStream(file.path);
              const writeStream = fs.createWriteStream(filePath);
          
              readStream.pipe(writeStream); 
            });
          
            form.on('error', (err) => {
              res.writeHead(500, { 'Content-Type': 'text/html' });
              console.log('error', err.message);
              res.end('Ошибка формы');
            });
          
            form.on('close', () => {
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.write('Данные:');
              res.end(' файл добавлен');
            });
          
            form.parse(req);
            break;
        case "/8":
            res.writeHead(200, { 'Content-Type': 'text/html' });
            let file = fs.readFileSync("./server.png");
            console.log("Успешно");
            res.end(file);
            break;
    }
}).listen(5000, () => console.log('http://localhost:5000'));