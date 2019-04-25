var mysql = require('mysql');

// var pool = mysql.createConnection({
//     host: 'db4free.net',
//     user: 'tainnt',
//     password: '12345678',
//     database: 'battle_ship',
// });

var pool = mysql.createConnection({
    host: 'sql12.freemysqlhosting.net',
    user: 'sql12270334',
    password: 'fbws2QvVig',
    database: 'sql12270334',
});

module.exports = {
    insert: function (name, pass) {
        var sql = 'INSERT INTO player(username,password) VALUES (?,?)';
        pool.query(sql, [name, pass], function (err) {
            if (err)
                throw err;
            console.log('Insert successful');
        });
    },

    delete: function (name) {
        var sql = 'DELETE FROM player WHERE username = ?';
        pool.query(sql, [name], function (err) {
            if (err)
                throw err;
            console.log('Delete successful');
        });
    },

    update: function (name, pass) {
        var sql = 'UPDATE player SET password = ? WHERE username = ?';
        pool.query(sql, [pass, name], function (err) {
            if (err)
                throw err;
            console.log('Update successful');
        });
    },

    find: function (name, callback) {
        var sql = 'SELECT id FROM player WHERE username= ?';
        pool.query(sql, [name], function (err, result, fields) {
            if (err)
                throw err;
            if (result[0] == null) {
                callback(false);
            } else {
                callback(true);
            }
        });
    },

    validate: function (name, pass, callback) {
        var sql = 'SELECT id FROM player WHERE username= ? AND password= ?';
        pool.query(sql, [name, pass], function (err, result, fields) {
            if (err)
                throw err;
            if (result[0] == null) {
                callback(false);
            } else {
                callback(true);
            }
        });
    },
};