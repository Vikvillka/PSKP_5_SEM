let WebSocket = require('ws');
let fs = require('fs');

let k = 0;
let wss = new WebSocket.Server({port: 4000, host: 'localhost'});
wss.on('connection', (ws) => {
    let duplex = WebSocket.createWebSocketStream(ws, {encoding: 'utf8'});
    let wfile = fs.createWriteStream(`./upload/file${++k}.txt`);
    duplex.pipe(wfile);
})
wss.on('error', (e) => {console.log(`error: ${e}`)});
setTimeout(() => {wss.close();}, 25000);