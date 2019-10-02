var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    // console.log('req.session.id: ' + req.sessionID);
    res.sendFile(__dirname + '/views/login.html');
});

router.get('/log', function (req, res) {
    // if (req.session.pageIndex == 'log')
    if (1)
        res.sendFile(__dirname + '/views/logViewer.html');
    else
        res.redirect('/');
});

router.get('/setting', function (req, res) {
    // if (req.session.pageIndex == 'setting')
    if (1)
        res.sendFile(__dirname + '/views/doorSetting.html');
    else
        res.redirect('/');
});

router.get('/dbViewer', function (req, res) {
    // if (req.session.pageIndex == 'doorController')
    if (1)
        res.sendFile(__dirname + '/views/dbViewer.html');
    else
        res.redirect('/');
});

router.get('/doorController', function (req, res) {
    // console.log('req.session.id: ' + req.session.id);
    // if (req.session.pageIndex == 'doorController')
    if (1)
        res.sendFile(__dirname + '/views/doorController.html');
    else
        res.redirect('/');
});

router.get('/payment', function (req, res) {
    // console.log('req.session.id: ' + req.session.id);
    // if (req.session.pageIndex == 'payment')
    if (1)
        res.sendFile(__dirname + '/views/payment.html');
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