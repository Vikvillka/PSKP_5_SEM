let WebSocket = require('ws');
let fs = require('fs');

let ws = new WebSocket('ws://localhost:4000');
ws.on('open', () => {
    let duplex = WebSocket.createWebSocketStream(ws, {encoding: 'utf8'});
    let rfile = fs.createReadStream(`./upload/MyFile.txt`);
    rfile.pipe(duplex);
})
ws.on('error', (e) => {console.log(`error: ${e}`)});
setTimeout(() => {ws.close();}, 25000);