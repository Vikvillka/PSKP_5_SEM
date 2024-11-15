let http = require('http');
let url = require('url');
let fs = require('fs');
const {parse} = require('querystring');
const parseString = require('xml2js').parseString;
const xmlBuilder = require('xmlbuilder');
const multiParty = require('multiparty');

class Server {

    constructor(server, socket){
        this.server = server;
        this.socket = socket;
    }

    handleConnection = (req, res) => {
        let paramSet = url.parse(req.url, true).query.set; 
        res.writeHead(200, {'Content-Type': 'text/html; chrset=utf-8'});

        if(!paramSet){
            let param = server.keepAliveTimeout;
            res.end(`<p>KeepAliveTimeout: ${param}</p>`);
        }
        else if(Number(paramSet)){
            server.keepAliveTimeout = Number(paramSet);
            res.end(`<p>KeepAliveTimeout was changed: ${paramSet}</p>`);
        }
        else{
            res.end(`<p>wrong param(KeepAliveTimeout)</p>`);
        }
    }

    handleHeaders = (req, res) => {
        let headers = '<h3>Request headers:</h3> </br>';
        for(let i in req.headers){
            headers += `<p>${i} - ${req.headers[i]}</p></br>`
        }

        headers += '<h3>Response headers:</h3> </br>';
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('UserHeader', 'UserValue');
        let resHeaders = res.getHeaders();
        for (let i in resHeaders){
            headers += `<p>${i} - ${resHeaders[i]}</p></br>`
        }

        res.writeHead(200);
        res.end(headers);
    }

    handleParameter = (req, res) => {
        let X = url.parse(req.url, true).query.x;
        let Y = url.parse(req.url, true).query.y;
        let X2 = url.parse(req.url).pathname.split('/')[2];    
        let Y2 = url.parse(req.url).pathname.split('/')[3];

        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});

        if(Number(X) && Number(Y)){
            res.end(`<p>x + y = ${+X + +Y}</p></br>
                     <p>x - y = ${X - Y}</p></br>
                     <p>x * y = ${X * Y}</p></br>
                     <p>x / y = ${X / Y}</p></br>`)
        }
        else if(X2 !== undefined && Y2 !== undefined){
            if(Number(X2) && Number(Y2)){
                res.end(`<p>x2 + y2 = ${+X2 + +Y2}</p></br>
                         <p>x2 - y2 = ${X2 - Y2}</p></br>
                         <p>x2 * y2 = ${X2 * Y2}</p></br>
                         <p>x2 / y2 = ${X2 / Y2}</p></br>`)
            }else{
                res.end(`<p>${req.url}</p>`);
            }
        }
        else{
            res.end('<p>Wrong prameters or not founded</p>')
        }
        
    }

    handleClose = (req, res) => {
        let timeout = 10;

        setTimeout(() => {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                res.end('<p>Server will be terminated in 10 seconds</p>');
            server.close(() => {
            }, timeout * 1000);
        })
    }

    handleSocket = (req, res) => {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(`<p>Client port ${res.socket.remotePort}</p></br>
                 <p>Client ip ${res.socket.remoteAddress}</p></br>
                 <p>Server port ${res.socket.localPort}</p></br>
                 <p>Server ip ${res.socket.localAddress}</p></br>`)
    }

    handleReqData = (req, res) => {
        let body = '';

        req.on('data', (chunk) => {
            console.log(`chunk: ${chunk.length} bytes`);
            body += chunk;
        });

        req.on('end', () => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`<p>Received data: ${body}<p>`);
        });

    }

    //http://localhost:5000/resp-status?code=566&mess='dd'
    handleRespStatus = (req, res) => {
        let code = url.parse(req.url, true).query.code;
        let mess = url.parse(req.url, true).query.mess;

        if(Number(code)){
            if(+code >= 200 && code < 600) {
                res.writeHead(+code, mess, {'Content-Type': 'text/html; charset=utf-8'});
                res.end(`<p>response status - ${code}, message - ${mess}</p>`)
            }
            else{
                res.writeHead(406, 'Invalid StatusCode', {'Content-Type': 'text/html; charset=utf-8'});
                res.end(`<p>Valid StatusCode is 200-599.</p>`)
            }
        }
        else{
            res.writeHead(407, 'Incorrect StatusCode', {'Content-Type': 'text/html; charset=utf-8'});
            res.end('<p>Correct StatusCode is 200-599.</p>')
        }
    }

    handleFormParameter = (req,res) => {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});

        if(req.method === 'GET'){
            res.end(fs.readFileSync('./form.html'));
        }
        else if(req.method === 'POST'){
            let body = '', param = '';

            req.on('data', (chunk) => {
                body += chunk.toString();
            })

            req.on('end', () => {
                param = parse(body);
                res.end(`<p>Text: ${param.inputText} </p></br>
                         <p>Number: ${param.inputNumber}</p></br>
                         <p>Date: ${param.inputDate}</p></br>
                         <p>Checked checkbox(s): ${param.inputCheck}</p></br>
                         <p>Selected radiobutton: ${param.inputRadio}</p></br>
                         <p>Textarea: ${param.inputTextArea}</p></br>
                         <p>Submit: ${param.inputSubmitForm}</p></br>`)
            })
        }
        else{
            res.writeHead(408, 'Incorrect method', {'Content-Type': 'text/html; charset=utf-8'});
            res.end('<h1>Incorrect method</h1>');
        }
    }

    handleJson = (req, res) => {
        res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
        let data = '';

        req.on('data', chunk => {
            data += chunk.toString();
        });

        req.on('end', () => {
            data = JSON.parse(data);
            let answer = {};
            answer._comment = "Ответ. Лабораторная работа 8/10";
            answer.x_plus_y = data.x + data.y;
            answer.concatination_s_and_o = `${data.s}: ${data.o.surname}, ${data.o.name}`;
            answer.length_m = data.m.length;
            res.end(JSON.stringify(answer, null, 2));
        });
    }

    handleXml = (req, res) => {
        let data = '';
    
        req.on('data', chunk => {
            data += chunk.toString();
        });
    
        req.on('end', () => {
            parseString(data, (error, result) => {
                if (error) {
                    res.writeHead(400, {'Content-Type': 'text/xml; charset=utf-8'});
                    res.end(`<result>String can't be parsed</result>`);
                    return;
                }
    
                let sum = 0;
                let mess = '';
    
                result.request.x.forEach(elem => {
                    sum += Number.parseInt(elem.$.value);
                });
    
                result.request.m.forEach(elem => {
                    mess += elem.$.value;
                });
    
                let xml = xmlBuilder.create('response')
                    .att('id', +result.request.$.id + 5)
                    .att('request', result.request.$.id);
                xml.ele('sum', {element: 'x', sum: `${sum}`});
                xml.ele('concat', {element: 'm', result: `${mess}`});
                let rc = xml.toString({pretty: true});
    
                res.writeHead(200, {'Content-Type': 'text/xml; charset=utf-8'});
                res.end(rc);
            });
        });
    
        req.on('error', err => {
            console.error('Request error:', err);
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('Internal Server Error');
        });
    };

    //http://localhost:5000/files/data.json
    handleFiles = (req, res) => {
        let file = url.parse(req.url).pathname.split('/')[2];

        if(file === undefined){
            fs.readdir('./static', (err, files) => {
                if(err){
                    res.end('<p>Folder was not founded</p>')
                    return;
                }
                res.setHeader('X-static-files-count', `${files.lenght}`);
                res.writeHead(200,  {'Content-Type': 'text/html; charset=utf-8'});
                res.end(`<p>There are ${files.length} files</p>`);
            })
        }
        else {
            try {
                res.setHeader('Content-Type', 'application/octet-stream');
                res.end(fs.readFileSync(`./static/${file}`));
            } catch (err) {
                res.writeHead(404, 'Resource not found', {'Content-Type': 'text/html; charset=utf-8'});
                res.end('<p>Error 404</p>')
            }
        }
    }

    handleUpload = (req, res) => {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});

        if(req.method === 'GET'){
            res.end(fs.readFileSync('./webform.html'));
        }

        else if (req.method === 'POST') {
            let form = new multiParty.Form({ uploadDir: './static' });
            form.on('file', (name, file) => {
                console.log(`filename: ${file.originalFilename} in ${file.path}`);
            });
            form.on('error', err => { res.end(`<p>form returned error: ${err}</p>`) });
            form.on('close', () => {
                res.end('<p>File uploaded</p>');
            });
            form.parse(req);
        }

        else {
            res.writeHead(408, 'Incorrect method', { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<p>408: Incorrect method</p>');
        }
    }
}

let server = http.createServer();

let serverHandle = ((req, res) => {
    let server = new Server(this.server, this.socket);
    if(req.method === 'GET'){
        switch(url.parse(req.url).pathname.split('/')[1]){
            case '':
                res.writeHead(200, {'Content-Type': 'text/html; chrset=utf-8'});
                res.end('<p>There are no tasks</p>');
                break;
            case 'connection': 
                server.handleConnection(req, res);
                break;
            case 'headers':
                server.handleHeaders(req, res);
                break;
            case 'parameter':
                server.handleParameter(req, res);
                break;
            case 'close':
                server.handleClose(req, res);
                break;
            case 'socket':
                server.handleSocket(req, res);
                break;
            case 'req-data':
                server.handleReqData(req, res);
                break;
            case 'resp-status':
                server.handleRespStatus(req, res);
                break;
            case 'formparameter':
                server.handleFormParameter(req, res);
                break;
            case 'files':
                server.handleFiles(req, res);
                break;
            case 'upload':
                server.handleUpload(req, res);
                break;

        }
    }
    else if(req.method === 'POST'){
        switch(url.parse(req.url).pathname.split('/')[1]){
            case 'formparameter':
                server.handleFormParameter(req, res);
                break;
            case 'json':
                server.handleJson(req, res);
                break;
            case 'xml':
                server.handleXml(req, res);
                break;
            case 'upload':
                server.handleUpload(req, res);
                break;
        }
    }
})

server.on('connection', (socket) => {
    console.log('Server has a new connection');

    socket.on('close', () => {
        console.log('Server has beed closed');
    })
})
server.on('request', serverHandle);
server.listen(5000, () => console.log('http://localhost:5000'))