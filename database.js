var mysql = require('mysql');

var pool = mysql.createConnection({
    host: 'db4free.net',
    user: 'tainnt',
    password: '123454321',
    database: 'doorgate',
});

// var pool = mysql.createConnection({
//     host: 'doorgate.tk',
//     user: 'mradmin',
//     password: 'taometroinha',
//     database: 'doorgate',
// });

module.exports = {
    insertKey: function (rfid, password) {
        var sql = 'INSERT INTO tenant_key(rfid) VALUES (?)';
        pool.query(sql, [rfid], function (err) {
            if (err)
                throw err;
            console.log('Insert key successful');
        });
    },

    deleteKey: function (rfid) {
        var sql = 'DELETE FROM tenant_key WHERE rfid = ?';
        pool.query(sql, [rfid], function (err) {
            if (err)
                throw err;
            console.log('Delete key successful');
        });
    },

    updateUidTag: function (oldRfid, newRfid) {
        var sql = 'UPDATE tenant_key SET rfid = ? WHERE rfid = ?';
        pool.query(sql, [newRfid, oldRfid], function (err) {
            if (err)
                throw err;
            console.log('Update uid tag successful');
        });
    },

    updatePassword: function (rfid, password) {
        var sql = 'UPDATE tenant_key SET password = ? WHERE rfid = ?';
        pool.query(sql, [password, rfid], function (err) {
            if (err)
                throw err;
            console.log('Update password successful');
        });
    },

    updateFlashAddress: function (rfid, address) {
        var sql = 'UPDATE tenant_key SET address = ? WHERE rfid = ?';
        pool.query(sql, [address, rfid], function (err) {
            if (err)
                throw err;
            console.log('Update flash address successful');
        });
    },

    updateKey: function (rfid, newRfid, password, address) {
        var sql = 'UPDATE tenant_key SET ';
        if (newRfid != null)
            console.log('newRfid is null');
        if (password == null)
            console.log('newRfid is null');
        if (address == null)
            console.log('newRfid is null');
        // var sql = 'UPDATE tenant_key SET rfid = ?, password = ?, flash_address = ? WHERE rfid = ?';
        // pool.query(sql, [newRfid, password, address, rfid], function (err) {
        //     if (err)
        //         throw err;
        //     console.log('Update key successful');
        // });
    },

    validateKey: function (rfid, callback) {
        var sql = 'SELECT id FROM tenant_key WHERE rfid = ?';
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

    // findTag: function (rfid, callback) {
    //     var sql = 'SELECT * FROM tenant_key WHERE rfid = ?';
    //     pool.query(sql, [rfid], function (err, result, fields) {
    //         if (err)
    //             throw err;
    //         if (result[0] != null) {
    //             callback(result[0]);
    //         }
    //     });
    // },

    getTableRow: function (tableName, callback) {
        var sql = 'SELECT * FROM ' + tableName;
        pool.query(sql, function (err, result, fields) {
            if (err)
                throw err;
            if (result[0] != null) {
                callback(result[0]);
            }
        });
    },

    getAllTenant: function (callback) {
        var sql = 'SELECT * ' +
            'FROM tenant_info INNER JOIN tenant_key ON tenant_info.id = tenant_key.id_tenant ';
        pool.query(sql, function (err, result, fields) {
            if (err)
                throw err;
            if (result[0] != null) {
                callback(result);
            }
        });
    },

    getTenant: function (tennantName, callback) {
        var sql = 'SELECT * ' +
            'FROM tenant_info INNER JOIN tenant_key ON tenant_info.id = tenant_key.id_tenant ' +
            'WHERE name = ?';
        pool.query(sql, [tennantName], function (err, result, fields) {
            if (err)
                throw err;
            if (result[0] != null) {
                callback(result[0]);
            }
        });
    },

    updateDoorState: function (doorState) {
        var sql = 'UPDATE door_info SET state = ? WHERE id = 1';
        pool.query(sql, [doorState], function (err, result, fields) {
            if (err)
                throw err;
            console.log('Update door state successful');
        });
    },

    getDoorState: function (callback) {
        var sql = 'UPDATE door_info SET state = ? WHERE id = 1';
        var sql = 'SELECT state FROM door_info';
        pool.query(sql, function (err, result, fields) {
            if (err)
                throw err;
            callback(result[0]);
            console.log('Read door state successful');
        });
    },

    updateOpenTime: function (openTime) {
        var sql = 'UPDATE door_info SET open_time = ? WHERE id = 1';
        pool.query(sql, [openTime], function (err, result, fields) {
            if (err)
                throw err;
            console.log('Update open time successful');
        });
    },

    updateCloseTime: function (closeTime) {
        var sql = 'UPDATE door SET close_time = ? WHERE id = 1';
        pool.query(sql, [closeTime], function (err, result, fields) {
            if (err)
                throw err;
            console.log('Update close time successful');
        });
    },
};