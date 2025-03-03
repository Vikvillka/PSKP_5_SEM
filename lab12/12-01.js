const http = require('http');
const fs = require('fs');
const url = require('url');
const path_e = require('path');
const WebSocket = require('ws');

const STUDENT_LIST = 'StudentList.json';
const BACKUP_DIR = 'backups';

function loadStudents() {
    if (!fs.existsSync(STUDENT_LIST)) {
        return { error: 1, message: 'ошибка чтения файла StudentList.json' };
    }
    let data = fs.readFileSync(STUDENT_LIST);
    return JSON.parse(data);
}

function saveStudents(students) {
    fs.writeFileSync(STUDENT_LIST, JSON.stringify(students, null, 4));
}

function backupStudents() {
    let timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
    let backupFile = path_e.join(BACKUP_DIR, `${timestamp}_StudentList.json`);
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR);
    }
    fs.copyFileSync(STUDENT_LIST, backupFile);
    return backupFile;
}

let server = http.createServer((req, res) => {
    let path = url.parse(req.url, true);
    let method = req.method;

    if (method === 'GET' && path.pathname === '/') {
        let students = loadStudents();
        if (students.error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(students));
            return;
        }
    
        let page = parseInt(path.query.page) || 1; 
        let limit = parseInt(path.query.limit) || 2; 
    
        if (page <= 0 || limit <= 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: 5,
                message: 'Параметры page и limit должны быть положительными числами'
            }));
            return;
        }
    
        let startIndex = (page - 1) * limit;
        let endIndex = startIndex + limit;
        let paginatedStudents = students.slice(startIndex, endIndex);
    
        if (paginatedStudents.length === 0 && students.length > 0) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: 6,
                message: `Страница ${page} за пределами доступного диапазона`
            }));
            return;
        }
    
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            page,
            limit,
            total: students.length,
            data: paginatedStudents
        }));
    }
     else if (method === 'POST' && path.pathname === '/') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            // Проверка на пустое тело запроса
            if (!body) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    error: 1,
                    message: 'Тело запроса не должно быть пустым' 
                }));
                return;
            }
    
            let newStudent;
            try {
                newStudent = JSON.parse(body);
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    error: 2,
                    message: 'Недопустимый JSON' 
                }));
                return;
            }
    
            // Проверка на обязательные поля (например, id и name)
            if (!newStudent.id || !newStudent.name) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    error: 3,
                    message: 'Недостаточно данных: id и name обязательны' 
                }));
                return;
            }
    
            let students = loadStudents();
            if (students.error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(students));
                return;
            }
    
            if (students.some(s => s.id === newStudent.id)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    error: 4,
                    message: `Студент с id ${newStudent.id} уже существует` 
                }));
            } else {
                students.push(newStudent);
                saveStudents(students);
                notifyAll();
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(newStudent));
            }
        });
    
    } else if (method === 'PUT' && path.pathname === '/') {
        console.log('put');
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            let updatedStudent = JSON.parse(body);
            let students = loadStudents();
            if (students.error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(students));
                return;
            }
            let index = students.findIndex(s => s.id === updatedStudent.id);
            if (index !== -1) {
                students[index] = updatedStudent;
                saveStudents(students);
                notifyAll();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(updatedStudent));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                                            error: 2,
                                            message: `студент с id ${updatedStudent.id} не найден`
                                        }));
            }
        });
    } else if (method === 'DELETE' && /^\/\d+$/.test(path.pathname)) {
        let id = parseInt(path.pathname.split('/')[1]);
        let students = loadStudents();
        if (students.error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(students));
            return;
        }
        let index = students.findIndex(s => s.id === id);
        if (index !== -1) {
            let deletedStudent = students.splice(index, 1)[0];
            saveStudents(students);
            notifyAll();
            res.writeHead(204, { 'Content-Type': 'application/json' });
            res.end();
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                                        error: 2,
                                        message: `студент с id ${id} не найден`
                                    }));
        }
    } else if (method === 'POST' && path.pathname === '/backup') {
        setTimeout(() => {
            let backupFile = backupStudents();
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Backup created', backup_file: backupFile }));
        }, 2000);
    } else if (method === 'DELETE' && /^\/backup\/\d{8}$/.test(path.pathname)) {
        let cutoffDate = new Date(
            parseInt(path.pathname.split('/')[2].slice(0, 4)),
            parseInt(path.pathname.split('/')[2].slice(4, 6)),
            parseInt(path.pathname.split('/')[2].slice(6, 8)) 
        );
        fs.readdir(BACKUP_DIR, (err, files) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({    
                                            error: 1,
                                            message: 'ошибка чтения директории backups' 
                                        }));
                return;
            }
            files.forEach(file => {
                let filePath = path_e.join(BACKUP_DIR, file);
                let fileStats = fs.statSync(filePath);
                if (fileStats.mtime < cutoffDate) {
                    fs.unlinkSync(filePath);
                }
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'устаревшие бэкапы были удалены' }));
        });
    } else if (method === 'GET' && path.pathname === '/backup') {
        fs.readdir(BACKUP_DIR, (err, files) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({    
                                            error: 1,
                                            message: 'ошибка чтения директории backups' 
                                        }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(files));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({    error: 4, 
                                    message: 'Недопустимая точка запроса' 
                                }));
    }
});

let wss = new WebSocket.Server({ server });

function notifyAll() {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ message: 'StudentList.json был обновлён' }));
        }
    });
}

wss.on('connection', (ws) => {
    console.log('подключен новый клиент');
    ws.on('close', () => {
        console.log('клиент отключился');
    });
});

server.listen(3000, () => {
    console.log("http://localhost:3000");
});