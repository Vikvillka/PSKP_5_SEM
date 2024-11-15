const fs = require('fs');
const path = require('path');

class FileServer {
    constructor(staticDir = './static') {
        this.staticDir = staticDir;
    }

    getFullPath(filePath) {
        return path.join(this.staticDir, filePath);
    }

    send404(res) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Resource not found');
    }

    streamFile(req, res, headers) {
        res.writeHead(200, headers);
        fs.createReadStream(this.getFullPath(req.url)).pipe(res);
    }

    isValidExtension(ext, requestedPath) {
        const regex = new RegExp(`^\/.+\.${ext}$`);
        return regex.test(requestedPath);
    }

    serveFile(req, res, headers) {
        fs.access(this.getFullPath(req.url), fs.constants.R_OK, (error) => {
            if (error) {
                this.send404(res);
            } else {
                this.streamFile(req, res, headers);
            }
        });
    }
}

module.exports = (dir) => new FileServer(dir);