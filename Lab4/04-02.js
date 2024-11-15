const http = require('http');
const data = require('./04-01.js')
const fs = require('fs');
const url = require('url');

let db = new data.DB();

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

http.createServer(function(req, res) {
    if(url.parse(req.url).pathname === '/'){
        let html = fs.readFile('index.html', (err, html) => {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.end(html);
        })
    }
    else if (url.parse(req.url).pathname ==='/api/db') {
        db.emit(req.method, req, res);
    }
     
}).listen(5000, "127.0.0.1", function(){
    console.log("Сервер начал прослушивание запросов на порту 5000");
});
