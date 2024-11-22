let rpcWSS = require('rpc-websockets').Server;

let server = new rpcWSS({port:4000, host: 'localhost'});

server.event('A');
server.event('B');
server.event('C');

process.stdin.setEncoding('utf8');
process.stdin.on('readable', () => {
    let data = null;
    while((data = process.stdin.read()) !== null){
        switch (data.trim().toUpperCase()){
            case 'A':
                server.emit('A', 'its event A');
                break;
            case 'B':
                server.emit('B', 'its event B');
                break;
            case 'C':
                server.emit('C', 'its event C');
                break;
            default: 
                console.log('There is no such event')
        }
    }
});