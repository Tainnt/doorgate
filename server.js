var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var alarm = require('alarm');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var router = require('./router');
var db = require('./database');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json())
app.use(cookieParser());
app.use(session({
    secret: 'gatedoor',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 //setting a cookie to last 24 hour
    }
}));
app.use('/', router);

server.listen(8080, function () {
    console.log('Server is running at port: 8080!')
});

io.on('connection', function (socket) {
    console.log('-----------------Connected id: ' + socket.id + '--------------------');
    socket.on('buttonCmd', function (data) {
        console.log(data.command);
        io.emit('cmdToEsp', data.command);
    });

    socket.on('readTag', function (data) {
        console.log('read tag: ' + data.uid);
        db.validateTag(data.uid, function (isCorrect) {
            if (isCorrect)
                io.emit('updateMonitor', {
                    text: data.uid + ' correct'
                });
            else
                io.emit('updateMonitor', {
                    text: data.uid + ' incorrect'
                });
        });
    });

    socket.on('insertTag', function (data) {
        console.log('insert tag: ' + data.uid);
        db.insertTag(data.uid);
        io.emit('updateMonitor', {
            text: 'insert tag: ' + data.uid
        });
    });

    socket.on('alarm', function (data) {
        var date = new Date();
        date.setHours(14, 41, 0, 0);
        alarm(date, function () {
            console.log('alarm callback');
        });
    });

    // socket.on('test', function (data) {
    //     // db.insertTag('12345678');
    //     db.validateTag(data.content, function (isCorrect) {
    //         if (isCorrect)
    //             io.emit('updateMonitor', {
    //                 text: 'correct'
    //             });
    //         else
    //             io.emit('updateMonitor', {
    //                 text: 'incorrect'
    //             });
    //     });
    // });
});