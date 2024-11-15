const http = require('http');

let statusApp = 'norm';

http.createServer(function(request,response){
    if(statusApp != null){
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.end(`<h1>Hello world</h1>`)
    } else
    response.end('Error');
}).listen(3000,"127.0.0.1", function(){
    console.log('server running on potr 3000');
})

process.stdin.setEncoding('utf-8');
process.stdin.on('data', (input) => {
    let trimmedInput = input.trim();
    const states = ['norm', 'read', 'test', 'exit'];

    if (states.includes(trimmedInput)) {
        console.log(`${statusApp} -> ${trimmedInput}`);
        if (trimmedInput === 'exit') {
            process.exit(0);
        } else {
            statusApp = trimmedInput;
        }
    } else {
        console.log('Неизвестный стейт');
    }
});