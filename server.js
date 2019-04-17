///////////////////////////////////////////////////////
/////////////PHẦN HOAT DONG SERVER/////////////////////
//////////////////////////////////////////////////////
var express = require("express");
var session = require("express-session")
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
app.use(express.static("public"));

let sess;

var server = require("http").Server(app);
var io = require("socket.io")(server);

app.use(cookieParser());
app.use(session({
    secret: 'hahahihi8585',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}))

server.listen(8080, function() {
    console.log('Server is running at port: 8080!')
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

