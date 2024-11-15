const http = require('http');
const data = require('./05-01.js')
const fs = require('fs');
const url = require('url');

let db = new data.DB();

let timeoutShutdown;
let timeCommit;
let timeStats;
let requestNumber = 0;
let commitNumber = 0;
let timeS = null;
let timeE = null;
let statFlag = false;

db.on('GET',(req,res)=>{
    console.log('DB.Get');

    res.setHeader('Content-Type', 'application/json');
    db.select()
    .then(elem =>{
        res.end(JSON.stringify(elem));
    })
})

db.on('POST', (req, res) =>{
    console.log('DB.POST'); 
    
    req.on('data', data => {
        let r = JSON.parse(data);
        if (!r.id || !r.name) {
            res.statusCode = 400; 
            return res.end(JSON.stringify({ error: "ID and Name are required fields." }));
        }
    
        db.insert(r)
            .then(result => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result));
            })
            .catch(err => {
                res.statusCode = 400; 
                res.end(JSON.stringify(err));
            });
    })
})

db.on('PUT', (req, res)=>{
    console.log('DB.PUT');

    req.on('data', data => {
        let r = JSON.parse(data);
        
        db.update(r)
            .then(result => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result));
            })
            .catch(err => {
                res.statusCode = 400; 
                res.end(JSON.stringify(err));
            });
    });
})

db.on('DELETE', (req, res)=>{
    console.log('DB.DELETE');
    
    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = url.searchParams.get('id');
    
    if (!id) {
        res.statusCode = 400; 
        return res.end(JSON.stringify({ error: 'ID is required.' }));
    }
    
    db.delete({ id: id })
        .then(result => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(result)); 
        })
        .catch(err => {
            res.statusCode = 400; 
            res.end(JSON.stringify(err));
        });
})

db.on('COMMIT', (req, res) => {
    console.log('DB.COMMIT');

    db.commit()
        .then(result => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'Commit success ', state: result }));
        })
        .catch(err => {
            res.statusCode = 500; 
            res.end(JSON.stringify({ error: 'Error in commit' }));
        });
});

let handleCommand = (command) => {
    let [cmd, param] = command.split(" ");

    switch(cmd){
        case 'sd':{
            let timeout = Number(param);
            clearTimeout(timeoutShutdown);

            if(!isNaN(timeout)){
                timeoutShutdown = setTimeout(() => {
                    server.close(() => {
                        console.log("Сервер выключен");
                        process.exit(0)
                    })
                }, timeout * 1000);
                timeoutShutdown.unref();
                console.log(`Сервер будет выключен через ${timeout} секунд`)
            } else {
                console.log('Отмена остановки сервера')
            }
            break;
        }

        case 'sc': {
            let time = Number(param);
            clearInterval(timeCommit);

            if(!isNaN(time)){
                timeCommit = setInterval(async () => {
                    await db.commit();
                    if(statFlag) commitNumber++;
                }, time * 1000)
                timeCommit.unref();
                console.log("Работает автокомит");
            } else {
                console.log("Автокомит отключен");
            }
            break;
        }

        case 'ss': {
            
            let time = Number(param);
            clearTimeout(timeStats);
            if(!isNaN(time)){
                statFlag = true;
                requestNumber = 0;
                commitNumber = 0;
                console.log('Начало сбора статистики');
                timeS = new Date();
                timeStats = setTimeout(() => {
                    console.log("Сбор статистики окончен");
                    statFlag = false;
                }, time * 1000)
                timeStats.unref();
            }
            else{
                if (statFlag) {
                    console.log("Сбор статистики остановлен");
                    clearTimeout(timeStats); 
                    statFlag = false; 
                } else {
                    console.log("Сбор статистики не активен");
                }
            }
            timeE = new Date();

            break;
        }
    }
}
process.stdin.setEncoding('utf8');

process.stdin.on('data', data => {
    let command = data.toString().trim();
    handleCommand(command);
})


let server = http.createServer(function(req, res) {
    if(statFlag){
        requestNumber++;
    }

    if(url.parse(req.url).pathname === '/'){
        let html = fs.readFile('index.html', (err, html) => {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.end(html);
        })
    }
    else if (url.parse(req.url).pathname ==='/api/db') {
        db.emit(req.method, req, res);
    }
    else if (url.parse(req.url).pathname === '/api/db/commit') {
        db.emit('COMMIT', req, res);
    }
    else if (url.parse(req.url).pathname === "/api/ss" && req.method === 'GET'){
        let stats = {
            startT: timeS ? timeS.toISOString() : '',
            endT: timeE ? timeE.toISOString() : '',
            requestNumber,
            commitNumber
        }
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
        res.end(JSON.stringify(stats));
    }
     
}).listen(5000, "127.0.0.1", function(){
    console.log("Сервер начал прослушивание запросов на порту 5000 http://localhost:5000");
});
