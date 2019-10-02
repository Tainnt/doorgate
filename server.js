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
var pyshell = require('python-shell');

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

server.listen(8000, '0.0.0.0', function () {
    console.log('Server is running at port: ' + server.address().port);
    db.getInfo(function (result) {
        let open = result.open_time.split(':');
        let close = result.close_time.split(':');
        let turnOn = result.camera_on_time.split(':');
        let turnOff = result.camera_off_time.split(':');

        let data = [{
                hour: open[0],
                minute: open[1],
                command: 'open'
            },
            {
                hour: close[0],
                minute: close[1],
                command: 'close'
            }, {
                hour: turnOn[0],
                minute: turnOn[1],
                command: 'turnOn'
            }, {
                hour: turnOff[0],
                minute: turnOff[1],
                command: 'turnOff'
            }
        ];
        setSchedule(data);
        setSnapshotTime(result.snapshot_time);
    });
});

function setSnapshotTime(time) {
    console.log('setSnapshotTime :', time,'hour');
    let my_job = schedule.scheduledJobs['snapshot'];
    if (my_job != null)
        my_job.cancel();
    // every 5 sec
    // schedule.scheduleJob('snapshot', '*/5 * * * * *', function () {
    //     console.log('take snapshot');
    // });
    // every [time] hour
    schedule.scheduleJob('snapshot', '0 */' + time + ' * * *', function () {
        //TODO: adding python code take snapshot
        console.log('take snapshot');
    });
}

function setSchedule(data) {
    for (let i = 0; i < data.length; i++) {
        console.log('setSchedule ' + data[i].command + ': ' + data[i].hour + ':' + data[i].minute);
        let my_job = schedule.scheduledJobs[data[i].command];
        if (my_job != null)
            my_job.cancel();
        schedule.scheduleJob(data[i].command, {
            hour: data[i].hour,
            minute: data[i].minute
        }, function () {
            console.log('schedule ' + data[i].command);
            switch (data[i].command) {
                case 'open':
                case 'close':
                    db.getDoorState(function (result) {
                        if (result.state != data[i].command) {
                            updateDoorState(data[i].command, 'automatic');
                        }
                    });
                    break;
                case 'turnOn':
                    //TODO: adding python code turn on camera here
                    console.log('turn on camera');
                    break;
                case 'turnOff':
                    //TODO: adding python code turn off camera here
                    console.log('turn off camera');
                    break;
                default:
                    console.log('setSchedule error');
                    break;
            }
        });
    }
}

function updateDoorState(command, type) {
    //TODO: uncomment insertDoorLog
    // let d = new Date();
    // db.insertDoorLog(command + ' by ' + type, d.toLocaleString());
    io.emit('cmdToEsp', command);
    db.updateDoorState(command);
    io.emit('updateDoorState', {
        state: command
    });

}

io.on('connection', function (socket) {
    console.log('-----------------Connected id: ' + socket.id + '--------------------');

    socket.on('disconnect', function () {
        console.log('##### Disconnected id: ' + socket.id + ' #####');
    });

    socket.on('searchDB', function (data) {
        console.log('searchDB: ' + data.argument);
        db.getTenant(data.argument, function (result) {
            console.log('result :', result);
            io.emit('updateDBViewer', {
                argument: result
            });
        });
    });

    socket.on('validatePassword', function (data) {
        //TODO: testing with ESP32 and update here
        console.log('validatePassword: ' + data.pwd);
        // updateDoorState(data.command);

    });

    socket.on('buttonCmd', function (data) {
        console.log('buttonCmd: ' + data.command);
        updateDoorState(data.command, 'manual');
    });

    socket.on('getDoorState', function () {
        db.getDoorState(function (result) {
            io.emit('updateDoorState', {
                state: result.state
            });
        });
    });

    socket.on('getDoorTime', function () {
        db.getInfo(function (result) {
            io.emit('updateDoorTime', {
                open: result.open_time.split(':'),
                close: result.close_time.split(':'),
                turnOn: result.camera_on_time.split(':'),
                turnOff: result.camera_off_time.split(':'),
                snapshot: result.snapshot_time,
                mode: result.validate_mode,
            });
        });
    });

    socket.on('setSnapshotTime', function (data) {
        db.updateSnapshotTime(data.time);
        setSnapshotTime(data.time);
    });

    socket.on('setValidateMode', function (data) {
        db.updateValidateMode(data.mode);
        //TODO: process mode
    });

    socket.on('setSchedule', function (data) {
        db.updateOpenTime(data[0].hour + ':' + data[0].minute);
        db.updateCloseTime(data[1].hour + ':' + data[1].minute);
        db.updateOnTime(data[2].hour + ':' + data[2].minute);
        db.updateOffTime(data[3].hour + ':' + data[3].minute);
        setSchedule(data);
    });

    socket.on('readTag', function (data) {
        console.log('read tag: ' + data.uid);
        db.validateKey(data.uid, function (isGranted) {
            if (isGranted) {
                io.emit('updateControlConsole', {
                    text: data.uid + ' granted'
                });
                db.findKey(data.uid, function (result) {
                    console.log('id_tenant :', result.id_tenant);
                    let options = {
                        mode: 'text',
                        args: ['--cascade', 'haarcascade_frontalface_default.xml', '--encodings', 'encodings.pickle', '--candidate', result.id_tenant]
                    };

                    pyshell.PythonShell.run('pi_face_recognition.py', options, function (err, pythonResult) {
                        if (err) throw err;
                        console.log('results: ', pythonResult);
                        if (pythonResult[pythonResult.length - 1] == "Step 2 Granted!") {
                            io.emit('updateControlConsole', {
                                text: 'face recognition CORRECT'
                            });
                            updateDoorState('open', 'validate in');
                        } else if (pythonResult[pythonResult.length - 1] == "Step 2 Denied!") {
                            io.emit('updateControlConsole', {
                                text: 'face recognition UNCORRECT'
                            });
                            updateDoorState('stop', 'invalid id');
                        } else {
                            io.emit('updateControlConsole', {
                                text: 'ERROR'
                            });
                        }
                    });
                });

            } else {
                io.emit('updateControlConsole', {
                    text: data.uid + ' denied'
                });
                updateDoorState('stop', 'invalid id');
            }

        });
    });

    socket.on('insertTag', function (data) {
        console.log('insert tag: ' + data.uid);
        db.findKey(data.uid, function (result) {
            if (result == null) {
                db.insertKey(data.uid);
                io.emit('updateControlConsole', {
                    text: data.uid + ' insert db succesful'
                });
            } else {
                console.log(data.uid + ' already exists in the database');
                io.emit('updateControlConsole', {
                    text: data.uid + ' already exists in the database'
                });
            }
        });
    });

    socket.on('doorStop', function (data) {
        //TODO adding stop by obstacl in ESP32
        // let d = new Date();
        // db.insertDoorLog(data.state, d.toLocaleString());
        console.log('door stop: ' + data.state);
        db.updateDoorState(data.state);
        io.emit('updateDoorState', {
            state: data.state
        });
    });

    socket.on('keypad', function (data) {
        console.log('data :', data);
        // console.log('data.password :', data.password);
    });

    socket.on('pythonTest', function (data) {
        // TODO: python testing
        if (data.type == 'run') {
            let options = {
                mode: 'text',
                pythonOptions: ['-u'],
                args: ['--cascade', 'haarcascade_frontalface_default.xml', '--encodings', 'encodings.pickle', '--candidate', data.para]
            };

            pyshell.PythonShell.run('pi_face_recognition.py', options, function (err, results) {
                if (err) throw err;
                console.log('python print', results);
            });

        } else if (data.type == 'test') {
            let options = {
                mode: 'text',
                pythonOptions: ['-u'],
                args: ['--cascade', 'haarcascade_frontalface_default.xml', '--encodings', 'encodings.pickle', '--candidate', data.para]
            };

            pyshell.PythonShell.run('test.py', options, function (err, results) {
                if (err) throw err;
                console.log('python print', results);
            });
        }
    });

    socket.on('androidLogin', function (data) {
        console.log('data :', data);
        db.getTenant(data.username, function (result) {
            let res, username, roomNumber;
            if (result != null) {
                res = data.password == result.password ? true : false;
                username = result.name;
                roomNumber = result.room_number;
            } else {
                res = false;
            }
            socket.emit('androidLoginState', {
                state: res,
                name: username,
                room: roomNumber
            });
        });
    });

    socket.on('androidPayment', function (data) {
        let d = new Date();
        db.findPayment(data.name, d.getMonth() + 1, function (cur, pre) {
            if (cur == null) {
                db.insertPayment(d.getMonth() + 1, data.elc, data.wtr, d.toLocaleString(), data.name);
            } else {
                db.updatePayment(d.getMonth() + 1, data.elc, data.wtr, d.toLocaleString(), data.name);
            }
        });
    });

    socket.on('getPayment', function (data) {
        let d = new Date();
        console.log('getPayment: ' + data.roomNumber);
        db.findPayment(data.roomNumber, d.getMonth() + 1, function (cur, pre) {
            db.getRoomDetail(function (result) {
                let total;
                if (cur != null && pre != null) {
                    total = (cur.electric_numeral - pre.electric_numeral) * result.electric_price +
                        (cur.water_numeral - pre.water_numeral) * result.water_price +
                        result.garbage_price +
                        cur.room_charge;
                } else {
                    total = null
                }
                io.emit('updatePaymentViewer', {
                    current: cur,
                    previous: pre,
                    totalCharge: total
                });
            });
        });
    });

    socket.on('updatePaymentDB', function (data) {
        console.log('data :', data);
        let d = new Date();
        db.updatePaymentCharge(d.getMonth() + 1, data.roomNumber, data.roomCharge, data.totalCharge, d.toLocaleString());
    });

    socket.on('searchDoorLog', function (data) {
        console.log('data :', data);
        db.getDoorLog(data.state, function (result) {
            io.emit('updateLogConsole', {
                res: result
            });
        });
    });
});