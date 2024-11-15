const sendmail = require('sendmail')();
const EMAIL = 'bychkovskayavic@gmail.com';

function send(message) {
    return new Promise((resolve, reject) => {
        sendmail({
            from: EMAIL,
            to: EMAIL,
            subject: 'msg',
            html: message,
        }, (err, reply) => {
            if (err) {
                return reject(err);
            }
            resolve(reply);
        });
    });
}

module.exports = { send };