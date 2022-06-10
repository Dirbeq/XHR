'use strict';

const mariadb = require('mariadb');
const connDb = mariadb.createConnection('mariadb://root@localhost:3307/db?database=chat')

var express = require('express');
var app = express();
const path = require('path')
var q = require('q');

app.use(express.static(`${__dirname}/public`));

app.get('/historique', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/indexSSE.html'))
});
app.get('/api', function (req, res) {
   getHistorique().then(row => { res.send(row)});
});
app.listen(3000);

const WebSocketServer = require('ws').Server
const wss = new WebSocketServer({ port: 8081 });

wss.on('connection', ((ws) => {
    ws.on('message', (message) => {
        console.log(`received: ${message}`);
        wss.broadcast(`${message}`)
    });

    ws.on('end', () => {
        console.log('Connection ended...');
    });

    ws.send('Hello Client');

}));

wss.broadcast = function broadcast(msg) {
    console.log(msg);
    wss.clients.forEach(function each(client) {
        client.send(msg);
    });
    saveMessage(msg);
};
function saveMessage(msg) {
    connDb.then(conn => {
        conn.query("INSERT INTO comments (message,date) VALUES (?,NOW())", msg)
            .then(rows => {
                //console.log(rows);
            })
            .catch(err => {
                //console.log(err); 
            });
    })
        .catch(err => {
            //console.log(err);
        });
}
function getHistorique() {

    return new Promise(resolve => {
        connDb.then(conn => {
            conn.query("SELECT * FROM comments;")
                .then(rows => {
                    //console.log(rows);
                    resolve(rows);
                })
                .catch(err => {
                    //console.log(err); 
                });
        })
            .catch(err => {
                //console.log(err);
            });
    })
}
