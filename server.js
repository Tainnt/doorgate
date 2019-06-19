var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var schedule = require('node-schedule');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var router = require('./router');
var db = require('./database');

var spawn = require('child_process').spawn;
var py = spawn('python', ['test.py']);

var pyshell = require('python-shell');

// var options = {
//     mode: 'text',
//     args: ['--cascade', 'haarcascade_frontalface_default.xml', '--encodings', 'encodings.pickle', '--candidate', '4']
// };
// pyshell.PythonShell.run('script.py', options, function (err, results) {
//     if (err) throw err;
//     console.log('results', results);
// });

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
    console.log('Server is running at port: 8080!');
    db.getTime(function (result) {
        let open = result.open_time.split(':');
        let close = result.close_time.split(':');

        let data = {'hour':open[0],'minute':open[1],'command':'open'};
        setAlarm(data);

        data = {'hour':close[0],'minute':close[1],'command':'close'};
        setAlarm(data);
    });
});

function setAlarm(data) {
    console.log('setAlarm ' + data.command + ': ' + data.hour + ':' + data.minute);
    let my_job = schedule.scheduledJobs[data.command];
    if (my_job != null)
        my_job.cancel();
    schedule.scheduleJob(data.command, {
        hour: data.hour,
        minute: data.minute
    }, function () {
        console.log('alarm door ' + data.command);
        db.getDoorState(function (result) {
            if (result.state != data.command) {
                db.updateDoorState(data.command);
                io.emit('updateDoorState', {
                    state: data.command
                });
                io.emit('cmdToEsp', data.command);
            }
        });
    });
}

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

    socket.on('getDoorTime', function () {
        db.getTime(function (result) {
            let open = result.open_time.split(':');
            let close = result.close_time.split(':');
            io.emit('updateDoorTime', {
                openH: open[0],
                openM: open[1],
                closeH: close[0],
                closeM: close[1],
            });
        });
    });

    socket.on('setAlarm', function (data) {
        if (data.command == 'open') {
            db.updateOpenTime(data.hour + ':' + data.minute);
        } else if (data.command == 'close') {
            db.updateCloseTime(data.hour + ':' + data.minute);
        }
        setAlarm(data);
    });

    socket.on('readTag', function (data) {
        console.log('read tag: ' + data.uid);
        db.validateKey(data.uid, function (isGranted) {
            let result = 'stop';
            if (isGranted) {
                io.emit('updateConsole', {
                    text: data.uid + ' granted'
                });
                db.findKey(data.uid, function (result) {
                    console.log('id_tenant :', result.id_tenant);
                    let options = {
                        mode: 'text',
                        args: ['--cascade', 'haarcascade_frontalface_default.xml', '--encodings', 'encodings.pickle', '--candidate', result.id_tenant]
                    };

                    pyshell.PythonShell.run('pi_face_recognition.py', options, function (err, results) {
                        if (err) throw err;
                        console.log('results', results);
                        if(result[result.length] == 'Step 2 Granted!'){
                            io.emit('updateConsole', {
                                text: 'face recognition CORRECT'
                            });
                            result = 'open';
                        }
                        else if(result[result.length] == 'Step 2 Denied!'){
                            io.emit('updateConsole', {
                                text: 'face recognition UNCORRECT'
                            });
                            result = 'stop';
                        }
                        else{
                            io.emit('updateConsole', {
                                text: 'ERROR'
                            });
                            result = 'stop';
                        }
                    });
                });

            } else {
                io.emit('updateConsole', {
                    text: data.uid + ' denied'
                });
                result = 'stop';
            }
            io.emit('cmdToEsp', result);
            db.updateDoorState(result);
            io.emit('updateDoorState', {
                state: result
            });
        });
    });

    socket.on('insertTag', function (data) {
        console.log('insert tag: ' + data.uid);
        db.findKey(data.uid, function (result) {
            if (result != null) {
                db.insertKey(data.uid);
                io.emit('updateConsole', {
                    text: data.uid + ' insert db succesful'
                });
            } else {
                io.emit('updateConsole', {
                    text: data.uid + ' already exists in the database'
                });
            }
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
            let options = {
                mode: 'text',
                args: ['--cascade', 'haarcascade_frontalface_default.xml', '--encodings', 'encodings.pickle', '--candidate', data.para]
            };

            pyshell.PythonShell.run('pi_face_recognition.py', options, function (err, results) {
                if (err) throw err;
                console.log('results', results);
            });
            ``

        } else if (data.type == 'test') {
            let options = {
                mode: 'text',
                args: ['--cascade', 'haarcascade_frontalface_default.xml', '--encodings', 'encodings.pickle', '--candidate', data.para]
            };

            pyshell.PythonShell.run('test.py', options, function (err, results) {
                if (err) throw err;
                console.log('results', results);
            });
        }
    });

    // socket.on('test', function (data) {
    //     db.getTime(function (result) {
    //         console.log('result :', result.close_time);
    //     });
    // });
});