var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    // console.log('req.session.id: ' + req.sessionID);
    if (req.session.pageIndex == 'dashboard')
        res.redirect('/dashboard');
    else
        res.sendFile(__dirname + '/views/login.html');
});

router.get('/dashboard', function (req, res) {
    // if (req.session.pageIndex == 'dashboard')
    if (1)
        res.sendFile(__dirname + '/views/dashboard.html');
    else
        res.redirect('/');
});

router.get('/dbviewer', function (req, res) {
    // if (req.session.pageIndex == 'monitor')
    if (1)
        res.sendFile(__dirname + '/views/dbviewer.html');
    else
        res.redirect('/');
});

router.get('/monitor', function (req, res) {
    // console.log('req.session.id: ' + req.session.id);
    // if (req.session.pageIndex == 'monitor')
    if (1)
        res.sendFile(__dirname + '/views/monitor.html');
    else
        res.redirect('/');
});

router.get('/logout', function (req, res) {
    // console.log('req.session.id: ' + req.session.id);
    req.session.pageIndex = 'login';
    res.redirect('/');
});

router.post('/login', function (req, res) {
    // console.log(req.body);
    if (req.body.username == 'a' && req.body.password == 'a') {
        req.session.pageIndex = 'dashboard';
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

module.exports = router;