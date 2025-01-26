const mongoose = require('mongoose');
let http = require('http');
let url = require('url');

const uri = 'mongodb://localhost:27017/BSTU';

const facultySchema = new mongoose.Schema({
    faculty: String,
    faculty_name: String,
}, { collection: 'faculty' });

const Faculty = mongoose.models.Faculty || mongoose.model('Faculty', facultySchema);

const pulpitSchema = new mongoose.Schema({
    pulpit: String,
    pulpit_name: String,
    faculty: {
        type: String,
        required: true,
        validate: {
            validator: async function(v) {
                const count = await Faculty.countDocuments({ faculty: v });
                return count > 0;
            },
            message: props => `${props.value} does not exist in Faculty!`
        }
    }
}, { collection: 'pulpit' });

const Pulpit = mongoose.models.Pulpit || mongoose.model('Pulpit', pulpitSchema);

http.createServer((req, res) => {
    let pathname = url.parse(req.url).pathname;
    let path = pathname.split('/')[1] + '/' + pathname.split('/')[2];
    let code = pathname.split('/')[3];

    let method = req.method;

    if (method === 'GET' && path === 'api/faculties') {
        mongoose.connect(uri)
            .then(() => {
                console.log('MongoDB: connect successful');
                return Faculty.find({});
            })
            .then(list => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(list));
            })
            .catch(err => {
                console.error('Error:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify('Internal Server Error'));
            })
            .finally(() => {
                mongoose.connection.close();
            });
    } 
    else if (method === 'GET' && path === 'api/pulpits') {
        mongoose.connect(uri)
            .then(() => {
                console.log('MongoDB: connect successful');
                return Pulpit.find({});
            })
            .then(list => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(list));
            })
            .catch(err => {
                console.error('Error:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify('Internal Server Error'));
            })
            .finally(() => {
                mongoose.connection.close();
            });
    } 
    else if (method === 'POST' && path === 'api/faculties') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const newFaculty = JSON.parse(body);

            mongoose.connect(uri)
                .then(() => {
                    console.log('MongoDB: connect successful');
                    return Faculty.create(newFaculty);
                })
                .then(doc => {
                    console.log('New Faculty Document:', doc);
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(doc));
                })
                .catch(err => {
                    console.error('Error:', err);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal Server Error');
                })
                .finally(() => {
                    mongoose.connection.close();
                });
        });
    } 
    else if (method === 'POST' && path === 'api/pulpits') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const newPulpit = JSON.parse(body);

            mongoose.connect(uri)
                .then(() => {
                    console.log('MongoDB: connect successful');
                    return Pulpit.create(newPulpit);
                })
                .then(doc => {
                    console.log('New Pulpit Document:', doc);
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(doc));
                })
                .catch(err => {
                    console.error('Error:', err);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal Server Error');
                })
                .finally(() => {
                    mongoose.connection.close();
                });
        });
    } else if (method === 'PUT' && path === 'api/faculties') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const updatedFaculty = JSON.parse(body);
            const facultyToUpdate = updatedFaculty.faculty;

            mongoose.connect(uri)
                .then(() => {
                    console.log('MongoDB: connect successful');
                    return Faculty.findOneAndUpdate(
                        { faculty: facultyToUpdate },
                        updatedFaculty,
                        { new: true }
                    );
                })
                .then(doc => {
                    if (!doc) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify('Faculty not found'));
                        return;
                    }
                    console.log('Updated Faculty Document:', doc);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(doc));
                })
                .catch(err => {
                    console.error('Error:', err);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal Server Error');
                })
                .finally(() => {
                    mongoose.connection.close();
                });
        });
    } 
    else if (method === 'PUT' && path === 'api/pulpits') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const updatedPulpit = JSON.parse(body);
            const pulpitToUpdate = updatedPulpit.pulpit;

            mongoose.connect(uri)
                .then(() => {
                    console.log('MongoDB: connect successful');
                    return Pulpit.findOneAndUpdate(
                        { pulpit: pulpitToUpdate },
                        updatedPulpit,
                        { new: true }
                    );
                })
                .then(doc => {
                    if (!doc) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify('Pulpit not found'));
                        return;
                    }
                    console.log('Updated Pulpit Document:', doc);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(doc));
                })
                .catch(err => {
                    console.error('Error:', err);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Internal Server Error');
                })
                .finally(() => {
                    mongoose.connection.close();
                });
        });
    } else if (method === 'DELETE' && path === 'api/faculties' && code) {
        mongoose.connect(uri)
            .then(() => {
                console.log('MongoDB: connect successful');
                return Faculty.deleteOne({ faculty: code });
            })
            .then(result => {
                if (result.deletedCount === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify('Faculty not found'));
                    return;
                }
                console.log('Faculty deleted');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify('Faculty deleted successfully'));
            })
            .catch(err => {
                console.error('Error:', err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            })
            .finally(() => {
                mongoose.connection.close();
            });
    } 
    else if (method === 'DELETE' && path === 'api/pulpits' && code) {
        mongoose.connect(uri)
            .then(() => {
                console.log('MongoDB: connect successful');
                return Pulpit.deleteOne({ pulpit: code });
            })
            .then(result => {
                if (result.deletedCount === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify('Pulpit not found'));
                    return;
                }
                console.log('Pulpit deleted');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify('Pulpit deleted successfully'));
            })
            .catch(err => {
                console.error('Error:', err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            })
            .finally(() => {
                mongoose.connection.close();
            });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify('Not Found'));
    }
}).listen(3000, () => console.log('http://localhost:3000'));