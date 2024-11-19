const WebSocket = require('ws');

const wsserver = new WebSocket.Server({port: 4000, host: 'localhost', path: '/wsserver'})

wsserver.on('connection', ws =>{
    console.log('Connection to webSocket server')
    ws.on('message', message =>{
      wsserver.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN){
            client.send('server: ' + message)
        }
      })  
    })
    ws.on('close', () => {
        console.log('Socket closed');
    })
})

wsserver.on('error', (e) =>{
    console.log('ws server error', e)
})

console.log(`ws server: host: ${wss.options.host}, port: ${wss.options.port}, path: ${wss.options.path}`);
