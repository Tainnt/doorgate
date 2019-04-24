var express = require("express");
var router = express.Router();

router.get('/', function (req, res) {
    // sess = req.session;
    // console.log('req.session: ' + req.sessionID);
    if (req.session.pageIndex == 'monitor')
        res.redirect('/monitor');
    else
        res.sendFile(__dirname + '/views/login.html');
});

router.get('/management', function (req, res) {
    // sess = req.session;    
    res.sendFile(__dirname + '/views/management.html');
});

router.get('/monitor', function (req, res) {
    // sess = req.session;
    // console.log('req.session: ' + req.session.id);
    if (req.session.pageIndex == 'monitor')
        res.sendFile(__dirname + '/views/monitor.html');
    else
        res.redirect('/');
});

router.get('/logout', function (req, res) {
    // sess = req.session;
    // console.log('req.session: ' + req.session.id);
    req.session.pageIndex = 'login';
    res.redirect('/');
});

router.post('/login', function (req, res) {
    // console.log(req.body);
    if (req.body.username == 'a' && req.body.password == 'a') {
        req.session.pageIndex = 'monitor';
        res.send({
            status: 'granted',
            id: req.session.id
        });
    } else {
        res.send({
            status: 'denied',
            id: null
        });
    }
});

module.exports.router = router;