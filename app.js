const http = require('http');
const fs = require('fs');
const GamesController = new (require('./server/GamesController'))();

const PORT = process.env.PORT || 3001;
const DIR = __dirname + '/client';
const ENTRY_POINT = DIR + '/index.html';

http.createServer(function(req, res) {
    const pathReq = (req.url.match(/(.*)\?/) || [])[1] || req.url;

    switch (pathReq) {
        case '/':
            fs.readFile(ENTRY_POINT, function (err, data) {
                res.setHeader('Content-Type', 'charset=utf-8');
                res.end(data);
            });
            break;

        case '/battleshipListener':
            GamesController.connectPlayer(req, res);
            break;

        case '/battleship':
            GamesController.notifyEvent(req, res);
            break;

        default:
            fs.readFile(DIR + '/build' + pathReq, function (err, data) {
                res.end(data);
            });
    }
}).listen(PORT);
