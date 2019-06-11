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
var spawn = require('child_process').spawn;
var py = spawn('python', ['test.py']);

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

    socket.on('searchDB', function (data) {
        console.log('searchDB: ' + data.argument);
        db.getTenant(data.argument, function (result) {
            console.log('result :', result);
            io.emit('updateDBViewer', {
                argument: result,
                type: 'data'
            });
        });
    });

    socket.on('getTenantField', function (data) {
        console.log('getTenantField');
        db.getTenantFields(function (field) {
            // console.log('field :', field);
            var arr = [];
            for (var i = 0; i < field.length; i++) {
                if (field[i].name != 'id' && field[i].name != 'id_tenant') {
                    if (field[i].type == 3) {
                        arr.push({
                            'name': field[i].name,
                            'len': field[i].length
                        });
                    } else {
                        arr.push({
                            'name': field[i].name,
                            'len': field[i].length / 4
                        });
                    }
                }
            }
            console.log('arr :', arr);
            io.emit('updateDBViewer', {
                argument: arr,
                type: 'length'
            });
        });
    });

    socket.on('validatePassword', function (data) {
        console.log('validatePassword: ' + data.pwd);
        // db.updateDoorState(data.command);
        // io.emit('updateDoorState', {
        //     state: data.command
        // });
        // io.emit('cmdToEsp', data.command);
    });

    socket.on('buttonCmd', function (data) {
        console.log('buttonCmd: ' + data.command);
        db.updateDoorState(data.command);
        io.emit('updateDoorState', {
            state: data.command
        });
        io.emit('cmdToEsp', data.command);
    });

    socket.on('getDoorState', function () {
        db.getDoorState(function (result) {
            io.emit('updateDoorState', {
                state: result.state
            });
        });
    });

    socket.on('setAlarm', function (data) {
        console.log('setAlarm ' + data.command + ': ' + data.hour + ':' + data.minute);
        var date = new Date();
        date.setHours(data.hour, data.minute, 0, 0);
        alarm(date, function () {
            console.log('alarm door ' + data.command);
            socket.emit('buttonCmd', {
                command: data.command
            });
            io.emit('cmdToEsp', data.command);
        });
    });

    socket.on('readTag', function (data) {
        console.log('read tag: ' + data.uid);
        db.validateKey(data.uid, function (isGranted) {
            if (isGranted) {
                io.emit('updateConsole', {
                    text: data.uid + ' granted'
                });
                io.emit('cmdToEsp', 'open');

                // var process = spawn('python', ["./pi_face_recognition.py",
                //     data.para
                // ]);

                // process.stdout.on('data', function (data) {
                //     io.emit('updateConsole', {
                //         text: data.toString()
                //     });
                //     if(data.toString() == 'granted'){
                //         io.emit('cmdToEsp', 'open');
                //     }
                //     else if (data.toString() == 'denied'){
                //         io.emit('cmdToEsp', 'stop');
                //     }
                // });


            } else {
                io.emit('updateConsole', {
                    text: data.uid + ' denied'
                });
                io.emit('cmdToEsp', 'stop');
            }
        });
    });

    socket.on('insertTag', function (data) {
        console.log('insert tag: ' + data.uid);
        db.insertTag(data.uid);
        io.emit('updateConsole', {
            text: data.uid + 'insert db succesful'
        });
    });

    socket.on('doorStop', function (data) {
        console.log('door stop: ' + data.state);
        db.updateDoorState(data.state);
        io.emit('updateDoorState', {
            state: data.state
        });
    });

    socket.on('test', function (data) {
        if (data.type == 'run') {
            var process = spawn('python', ["./pi_face_recognition.py",
                data.para
            ]);

            process.stdout.on('data', function (data) {
                // console.log('data from python file:', data.toString());
                io.emit('updateConsole', {
                    text: data.toString()
                });
            });
        } else if (data.type == 'test') {
            var process = spawn('python', ["./test.py",
                data.para
            ]);

            process.stdout.on('data', function (data) {
                io.emit('updateConsole', {
                    text: data.toString()
                });
            });
        }
    });
});