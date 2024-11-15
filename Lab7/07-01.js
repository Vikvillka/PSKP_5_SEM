const http = require('http');
const FileServer = require('./m07_01');

const fileServer = FileServer('./static');

const requestHandler = (req, res) => {
    if (fileServer.isValidExtension('html', req.url)) {
        fileServer.serveFile(req, res, {'Content-Type': 'text/html; charset=utf-8'});
    } else if (fileServer.isValidExtension('css', req.url)) {
        fileServer.serveFile(req, res, {'Content-Type': 'text/css; charset=utf-8'});
    } else if (fileServer.isValidExtension('js', req.url)) {
        fileServer.serveFile(req, res, {'Content-Type': 'application/javascript'});
    } else if (fileServer.isValidExtension('png', req.url)) {
        fileServer.serveFile(req, res, {'Content-Type': 'image/png'});
    } else if (fileServer.isValidExtension('docx', req.url)) {
        fileServer.serveFile(req, res, {'Content-Type': 'application/msword'});
    } else if (fileServer.isValidExtension('json', req.url)) {
        fileServer.serveFile(req, res, {'Content-Type': 'application/json'});
    } else if (fileServer.isValidExtension('xml', req.url)) {
        fileServer.serveFile(req, res, {'Content-Type': 'application/xml'});
    } else if (fileServer.isValidExtension('mp4', req.url)) {
        fileServer.serveFile(req, res, {'Content-Type': 'video/mp4'});
    } else {
        fileServer.send404(res);
    }
};

const server = http.createServer(requestHandler);
server.listen(5000, () => {
    console.log(`Server is running at http://localhost:5000/index.html`);
});