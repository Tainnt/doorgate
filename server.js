var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
var routerModule = require('./router');

app.use(express.static("public"));
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
app.use('/', routerModule.router);

server.listen(8080, function () {
    console.log('Server is running at port: 8080!')
});

io.on("connection", function (socket) {
    console.log('-----------------Connected id: ' + socket.id + '--------------------');
    socket.on('buttonCmd', function (data) {
        console.log(data.command);
        // socket.emit("cmdToEsp", { arr: gamepadArr, ss: checkID, id: userGamepad });
    });
});