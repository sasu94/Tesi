var connection = require('./Connection');

module.exports = {
    loadFamilies: function (cb) {
        connection.getConnection(function (err, conn) {
            conn.query('select * from Family', function (error, results) {
                if (results.length >= 1) {
                    cb(results);
                }
            });
        })

    },
    newFamily: function (name, cb) {
        connection.getConnection(function (err, conn) {
            conn.query('insert into Family (Name) values (?)', name, function (error, results) {
                if (error) throw error;
                cb(results);

            });
        })
    },
    loadSubjects: function (id, cb) {
        connection.getConnection(function (err, conn) {
            conn.query('select * from Subject where Family=?', id, function (error, results) {
                cb(results);
            });
        })
    },

    loadAllSubjects(cb) {
        connection.getConnection(function (err, conn) {
            conn.query('select * from Subject', function (error, results) {
                if (results.length >= 1) {
                    cb(results);
                }
            });
        })
    },

    newSubject: function (id, protocolNumber, status, sex, age, ageOfOnset, family, cb) {
        connection.getConnection(function (err, conn) {
            conn.query('insert into Subject (Id,ProtocolNumber,Status,Sex,Age,AgeOfOnset,Family) values (?,?,?,?,?,?,?)', [id, protocolNumber, status, sex, age, ageOfOnset, family], function (error, results) {
                if (error) { console.log(error); cb(false); }
                else
                    cb(results.insertId);

            });
        })
    },

    checkFamily: function (name, cb) {
        connection.getConnection(function (err, conn) {
            conn.query('select * from Family where Name=?', name, function (error, results) {
                if (results.length >= 1)
                    cb(false);
                else
                    cb(true);
            });
        })
    },
    checkSubject: function (name, cb) {
        connection.getConnection(function (err, conn) {
            conn.query('select * from Subject where Id=?', name, function (error, results) {
                if (results.length >= 1)
                    cb(false);
                else
                    cb(true);
            });
        })
    }
};