var mysql = require('mysql');

var pool = mysql.createConnection({
    host: 'db4free.net',
    user: 'tainnt',
    password: '123454321',
    database: 'doorgate',
});

// var pool = mysql.createConnection({
//     host: 'doorgate.tk',
//     user: 'test',
//     password: 'testing',
//     database: 'computerized_nhatro',
// });

module.exports = {
    insertTag: function (rfid) {
        var sql = 'INSERT INTO rfid_tenant(rfid) VALUES (?)';
        pool.query(sql, [rfid], function (err) {
            if (err)
                throw err;
            console.log('Insert tag successful');
        });
    },
    // insert: function (name, pass) {
    //     var sql = 'INSERT INTO player(username,password) VALUES (?,?)';
    //     pool.query(sql, [name, pass], function (err) {
    //         if (err)
    //             throw err;
    //         console.log('Insert successful');
    //     });
    // },

    deleteTag: function (rfid) {
        var sql = 'DELETE FROM player WHERE username = ?';
        pool.query(sql, [rfid], function (err) {
            if (err)
                throw err;
            console.log('Delete tag successful');
        });
    },

    updateTag: function (newRfid, oldRfid) {
        var sql = 'UPDATE player SET password = ? WHERE username = ?';
        pool.query(sql, [newRfid, oldRfid], function (err) {
            if (err)
                throw err;
            console.log('Update tag successful');
        });
    },

    findTag: function (rfid, callback) {
        var sql = 'SELECT id FROM player WHERE username= ?';
        pool.query(sql, [rfid], function (err, result, fields) {
            if (err)
                throw err;
            if (result[0] == null) {
                callback(false);
            } else {
                callback(true);
            }
        });
    },

    validateTag: function (rfid, callback) {
        var sql = 'SELECT id FROM rfid_tenant WHERE rfid = ?';
        pool.query(sql, [rfid], function (err, result, fields) {
            if (err)
                throw err;
            if (result[0] == null) {
                callback(false);
            } else {
                callback(true);
            }
        });
    },

    updateDoorState: function (doorState, callback) {
        var sql = 'UPDATE door_info SET state = ? WHERE id = 1';
        pool.query(sql, [doorState], function (err, result, fields) {
            if (err)
                throw err;
            console.log('Update door state successful');
        });
    },

    updateOpenTime: function (openTime) {
        var sql = 'UPDATE door_info SET open_time = ? WHERE id = 1';
        pool.query(sql, [openTime]);
    },

    updateCloseTime: function (closeTime) {
        var sql = 'UPDATE door SET close_time = ? WHERE id = 1';
        pool.query(sql, [closeTime]);
    },
};