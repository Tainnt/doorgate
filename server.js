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
    console.log('Kiểm tra thời gian trước khi set báo thức, nếu inputTime < currentTime => set báo thức cho ngày hôm sau');
    // db.getTime(function (result) {
    //     let open = result.open_time.split(':');
    //     let close = result.close_time.split(':');

    //     var openTime = new Date();
    //     openTime.setHours(open[0], open[1], 0, 0);
    //     console.log('setAlarm open door ' + ': ' + open[0] + ':' + open[1]);
    //     alarm(openTime, function () {
    //         console.log('alarm open door');
    //         io.emit('buttonCmd', {
    //             command: 'open'
    //         });
    //         io.emit('cmdToEsp', 'open');
    //     });

    //     var closeTime = new Date();
    //     closeTime.setHours(close[0], close[1], 0, 0);
    //     console.log('setAlarm open door ' + ': ' + close[0] + ':' + close[1]);
    //     alarm(closeTime, function () {
    //         console.log('alarm close door');
    //         io.emit('buttonCmd', {
    //             command: 'close'
    //         });
    //         io.emit('cmdToEsp', 'close');
    //     });
    // });
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

    socket.on('getDoorTime', function () {
        db.getTime(function (result) {
            // console.log('open :', result.open_time);
            // console.log('close :', result.close_time);
            let open = result.open_time.split(':');
            let close = result.close_time.split(':');
            io.emit('updateDoorTime', {
                openH: open[0],
                openM: open[1],
                closeH: close[0],
                closeM: close[1],
            });

            // var openTime = new Date();
            // openTime.setHours(open[0], open[1], 0, 0);
            // alarm(openTime, function () {
            //     console.log('alarm open door');
            //     socket.emit('buttonCmd', {
            //         command: 'open'
            //     });
            //     io.emit('cmdToEsp', 'open');
            // });

            // var closeTime = new Date();
            // closeTime.setHours(close[0], close[1], 0, 0);
            // alarm(closeTime, function () {
            //     console.log('alarm close door');
            //     socket.emit('buttonCmd', {
            //         command: 'close'
            //     });
            //     io.emit('cmdToEsp', 'close');
            // });
        });
    });

    socket.on('setAlarm', function (data) {
        console.log('setAlarm ' + data.command + ': ' + data.hour + ':' + data.minute);
        // if (data.command == 'open') {
        //     db.updateOpenTime(data.hour + ':' + data.minute);
        // } else if (data.command == 'close') {
        //     db.updateCloseTime(data.hour + ':' + data.minute);
        // }
        // var date = new Date();
        // date.setHours(data.hour, data.minute, 0, 0);
        // alarm(date, function () {
        //     console.log('alarm door ' + data.command);
        //     io.emit('buttonCmd', {
        //         command: data.command
        //     });
        //     io.emit('cmdToEsp', data.command);
        // });
        let my_job = schedule.scheduledJobs[data.command];
        if (my_job != null)
            my_job.cancel();
        schedule.scheduleJob(data.command, {
            hour: data.hour,
            minute: data.minute
        }, function () {
            console.log('Time for work!');
        });
        // setAlarm = schedule.scheduleJob({
        //         hour: data.hour,
        //         minute: data.minute
        //     },
        //     function () {
        //         console.log('Time for work!');
        //     });

        // scheduleJob = schedule.scheduleJob({
        //     hour: data.hour,
        //     minute: data.minute
        // }, function () {
        //     console.log('Time for woFrk!');
        // });
    });

    socket.on('readTag', function (data) {
        console.log('read tag: ' + data.uid);
        db.validateKey(data.uid, function (isGranted) {
            let result = 'stop';
            if (isGranted) {
                io.emit('updateConsole', {
                    text: data.uid + ' granted'
                });
                result = 'open';
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
        db.findKey(data.uid,function (result) {
            if(!result){
                db.insertKey(data.uid);
                io.emit('updateConsole', {
                    text: data.uid + ' insert db succesful'
                });
            }
            else{
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

    // socket.on('test', function (data) {
    //     db.getTime(function (result) {
    //         console.log('result :', result.close_time);
    //     });
    // });
});