var express = require("express");
var router = express.Router();

router.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/login.html');
});

router.get('/management', function (req, res) {
    res.sendFile(__dirname + '/views/management.html');
});

router.get('/monitor', function (req, res) {
    res.sendFile(__dirname + '/views/monitor.html');
});

router.post('/login', function (req, res) {
    console.log(req.body);
    if (req.body.username == 'a' && req.body.password == 'a') {
        res.send({
            status: 'granted'
        });
    } else {
        res.send({
            status: 'denied'
        });
    }
});

module.exports = router;