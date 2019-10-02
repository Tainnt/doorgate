var mysql = require('mysql');

var pool = mysql.createConnection({
    host: 'db4free.net',
    user: 'tainnt',
    password: '123454321',
    database: 'doorgate',
});

// var pool = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'doorgate',
// });

// var pool = mysql.createConnection({
//     host: 'localhost',
//     user: 'mradmin',
//     password: 'taometroinha',
//     database: 'doorgate',
// });

module.exports = {
    // insertKey: function (rfid, password) {
    //     let sql = 'INSERT INTO tenant_key(rfid) VALUES (?)';
    //     pool.query(sql, [rfid], function (err) {
    //         if (err)
    //             throw err;
    //         console.log('Insert key successful');
    //     });
    // },

    insertKey: function (rfid) {
        let sql = 'INSERT INTO tenant_key(rfid) VALUES (?)';
        pool.query(sql, [rfid], function (err) {
            if (err)
                throw err;
            console.log('Insert key successful');
        });
    },

    findKey: function (rfid, callback) {
        let sql = 'SELECT * FROM tenant_key WHERE rfid = ?';
        pool.query(sql, [rfid], function (err, result, fields) {
            if (err)
                throw err;
            // if (result.length != 0) {
            //     callback(true);
            // }
            // else{
            //     callback(false);
            // }
            callback(result[0]);
        });
    },

    deleteKey: function (rfid) {
        let sql = 'DELETE FROM tenant_key WHERE rfid = ?';
        pool.query(sql, [rfid], function (err) {
            if (err)
                throw err;
            console.log('Delete key successful');
        });
    },

    updateUidTag: function (oldRfid, newRfid) {
        let sql = 'UPDATE tenant_key SET rfid = ? WHERE rfid = ?';
        pool.query(sql, [newRfid, oldRfid], function (err) {
            if (err)
                throw err;
            console.log('Update uid tag successful');
        });
    },

    updatePassword: function (rfid, password) {
        let sql = 'UPDATE tenant_key SET password = ? WHERE rfid = ?';
        pool.query(sql, [password, rfid], function (err) {
            if (err)
                throw err;
            console.log('Update password successful');
        });
    },

    updateFlashAddress: function (rfid, address) {
        let sql = 'UPDATE tenant_key SET address = ? WHERE rfid = ?';
        pool.query(sql, [address, rfid], function (err) {
            if (err)
                throw err;
            console.log('Update flash address successful');
        });
    },

    updateKey: function (rfid, newRfid, password, address) {
        let sql = 'UPDATE tenant_key SET ';
        if (newRfid != null)
            console.log('newRfid is null');
        if (password == null)
            console.log('newRfid is null');
        if (address == null)
            console.log('newRfid is null');
        // let sql = 'UPDATE tenant_key SET rfid = ?, password = ?, flash_address = ? WHERE rfid = ?';
        // pool.query(sql, [newRfid, password, address, rfid], function (err) {
        //     if (err)
        //         throw err;
        //     console.log('Update key successful');
        // });
    },

    validateKey: function (rfid, callback) {
        let sql = 'SELECT id FROM tenant_key WHERE rfid = ?';
        pool.query(sql, [rfid], function (err, result, fields) {
            if (err)
                throw err;
            if (result.length != 0) {
                callback(true);
            } else {
                callback(false);
            }
        });
    },

    getTableRow: function (tableName, callback) {
        let sql = 'SELECT * FROM ' + tableName;
        pool.query(sql, function (err, result, fields) {
            if (err)
                throw err;
            if (result.length != 0) {
                callback(result[0]);
            }
        });
    },

    getAllTenant: function (callback) {
        let sql = 'SELECT * ' +
            'FROM tenant INNER JOIN tenant_key ON tenant.id = tenant_key.id_tenant ';
        pool.query(sql, function (err, result, fields) {
            if (err)
                throw err;
            if (result.length != 0) {
                callback(result);
            }
        });
    },

    getTenant: function (tennantName, callback) {
        let sql = 'SELECT * ' +
            'FROM tenant INNER JOIN tenant_key ON tenant.id = tenant_key.id_tenant ' +
            'WHERE name = ?';
        pool.query(sql, [tennantName], function (err, result, fields) {
            if (err)
                throw err;
            if (result.length != 0) {
                callback(result[0]);
            } else {
                callback(null);
            }
        });
    },

    insertPayment: function (month, elc, wtr, date_mdf, name) {
        let sql = 'INSERT INTO room(room_number,month,electric_numeral,water_numeral,date_modified) ' +
            'VALUES ( (SELECT room_number FROM tenant WHERE name = ?), ?, ?, ?, ?)';
        pool.query(sql, [name, month, elc, wtr, date_mdf], function (err, result, fields) {
            if (err)
                throw err;
            console.log('Insert payment successful');
        });
        sql = 'UPDATE room ' +
            'SET room_charge = (SELECT room_charge FROM room WHERE room_number = (SELECT room_number FROM tenant WHERE name = ?) AND month = ?) ' +
            'WHERE room_number = (SELECT room_number FROM tenant WHERE name = ?) AND month = ?';
        pool.query(sql, [name, month - 1, name, month], function (err, result, fields) {
            if (err)
                throw err;
            console.log('Update room_charge successful');
        });
    },

    updatePayment: function (month, elc, wtr, date_mdf, name) {
        let sql = 'UPDATE room ' +
            'SET electric_numeral = ?, water_numeral = ?, date_modified = ? ' +
            'WHERE room_number = (SELECT room_number FROM tenant WHERE name = ?) AND month = ?';
        pool.query(sql, [elc, wtr, date_mdf, name, month], function (err, result, fields) {
            if (err)
                throw err;
            console.log('Update payment successful');
        });
    },

    updatePaymentCharge: function (month, room_number, room_charge, total_charge, date_cfm) {
        let sql = 'UPDATE room ' +
            'SET room_charge = ?, total_charge = ?, date_confirmed = ? ' +
            'WHERE room_number = ? AND month = ?';
        pool.query(sql, [room_charge, total_charge, date_cfm, room_number, month], function (err, result, fields) {
            if (err)
                throw err;
            console.log('Update payment charge successful');
        });
    },

    findPayment: function (roomNumber, month, callback) {
        let sql = 'SELECT * ' +
            'FROM room ' +
            'WHERE room_number = ? ' +
            'AND (month = ? OR month = ?) ' +
            'ORDER BY month DESC ';
        pool.query(sql, [roomNumber, month, month - 1], function (err, result, fields) {
            if (err)
                callback(null, null);
            if (result.length >= 2)
                callback(result[0], result[1]);
            else
                callback(null, null);
        });
    },

    getRoomDetail: function (callback) {
        let sql = 'SELECT * ' +
            'FROM room_detail ' +
            'WHERE id = 1';
        pool.query(sql, [], function (err, result, fields) {
            if (err)
                throw err;
            if (result.length != 0)
                callback(result[0]);
            else
                callback(null);
        });
    },

    updateDoorState: function (doorState) {
        let sql = 'UPDATE door_info SET state = ? WHERE id = 1';
        pool.query(sql, [doorState], function (err, result, fields) {
            if (err)
                throw err;
            console.log('Update door state successful');
        });
    },

    getDoorState: function (callback) {
        let sql = 'SELECT state FROM door_info';
        pool.query(sql, function (err, result, fields) {
            if (err)
                throw err;
            callback(result[0]);
            console.log('Get door state successful');
        });
    },

    updateOpenTime: function (openTime) {
        let sql = 'UPDATE door_info SET open_time = ? WHERE id = 1';
        pool.query(sql, [openTime], function (err, result, fields) {
            if (err)
                throw err;
            console.log('Update open time successful');
        });
    },

    updateCloseTime: function (closeTime) {
        let sql = 'UPDATE door_info SET close_time = ? WHERE id = 1';
        pool.query(sql, [closeTime], function (err, result, fields) {
            if (err)
                throw err;
            console.log('Update close time successful');
        });
    },

    updateOnTime: function (onTime) {
        let sql = 'UPDATE door_info SET camera_on_time = ? WHERE id = 1';
        pool.query(sql, [onTime], function (err, result, fields) {
            if (err)
                throw err;
            console.log('Update camera on time successful');
        });
    },

    updateOffTime: function (offTime) {
        let sql = 'UPDATE door_info SET camera_off_time = ? WHERE id = 1';
        pool.query(sql, [offTime], function (err, result, fields) {
            if (err)
                throw err;
            console.log('Update camera off time successful');
        });
    },

    updateSnapshotTime: function (snapshotTime) {
        let sql = 'UPDATE door_info SET snapshot_time = ? WHERE id = 1';
        pool.query(sql, [snapshotTime], function (err, result, fields) {
            if (err)
                throw err;
            console.log('Update snapshot time successful');
        });
    },

    updateValidateMode: function (validateMode) {
        let sql = 'UPDATE door_info SET validate_mode = ? WHERE id = 1';
        pool.query(sql, [validateMode], function (err, result, fields) {
            if (err)
                throw err;
            console.log('Update validate mode successful');
        });
    },

    getInfo: function (callback) {
        let sql = 'SELECT * FROM door_info WHERE id = 1';
        pool.query(sql, function (err, result, fields) {
            if (err)
                throw err;
            callback(result[0]);
            console.log('Get time successful');
        });
    },

    insertDoorLog: function (state, datetime) {
        // TODO: adding type when control door in arduino code
        let sql = 'INSERT INTO door_log(state,datetime) VALUES (?,?)';
        pool.query(sql, [state, datetime], function (err, result, fields) {
            if (err)
                throw err;
            console.log('Insert door log successful');
        });
    },

    getDoorLog: function (state, callback) {
        let sql;
        let argument;
        if (state == 'All') {
            sql = 'SELECT * '+
            'FROM (SELECT * FROM door_log ORDER BY id DESC LIMIT 10) sub ' +
            'ORDER BY id ASC';
            argument = [];
        } else {
            sql = 'SELECT * '+
            'FROM (SELECT * FROM door_log ORDER BY id DESC LIMIT 10) sub ' +
            'WHERE state = ? '+
            'ORDER BY id ASC';
            argument = [state];
        }
        pool.query(sql, argument, function (err, result, fields) {
            if (err)
                throw err;
            if (result.length != 0) {
                callback(result);
                console.log('Get door log successful');
            } else {
                callback(null);
                console.log('object null');
            }

        });
    },
};