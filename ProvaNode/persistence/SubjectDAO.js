
var connection = require('./Connection');

module.exports = {
    loadFamilies: function (cb) {
        connection.getConnection(function (err, conn) {
            conn.query('select * from Family', function (error, results) {
                conn.release()
                cb(results);
            });
        })

    },
    newFamily: function (name, cb) {
        connection.getConnection(function (err, conn) {
            conn.query('insert into Family (Name) values (?)', name, function (error, results) {
                conn.release()
                if (error) throw error;
                cb(results);

            });
        })
    },
    loadSubjects: function (id, cb) {
        connection.getConnection(function (err, conn) {
            conn.query('select * from Subject where Family=?', id, function (error, results) {
                conn.release()
                cb(results);
            });
        })
    },

    loadAllSubjects(cb) {
        connection.getConnection(function (err, conn) {
            conn.query('select * from Subject', function (error, results) {
                conn.release()
                if (results.length >= 1) {
                    cb(results);
                }
            });
        })
    },

    newSubject: function (id, protocolNumber, status, sex, age, ageOfOnset, geneticStatus, family, cb) {
        connection.getConnection(function (err, conn) {
            conn.query('insert into Subject (Id,ProtocolNumber,Status,Sex,Age,AgeOfOnset,GeneticStatus,Family) values (?,?,?,?,?,?,?,?)', [id, protocolNumber, status, sex, age, ageOfOnset, geneticStatus, family], function (error, results) {
                conn.release()
                if (error) {
                    throw error
                } else
                    cb(results.insertId);

            });
        })
    },

    checkFamily: function (name, cb) {
        connection.getConnection(function (err, conn) {
            conn.query('select * from Family where Name=?', name, function (error, results) {
                conn.release()
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
                conn.release()
                if (results.length >= 1)
                    cb(false);
                else
                    cb(true);
            });
        })
    },
    removeSubject: function (id, cb) {
        connection.getConnection(function (err, conn) {
            conn.release()
            conn.query('delete from Subject where Id=?', id, function (error, results) {
                cb(true);
            });
        })
    },

    removeFamily: function (name, cb) {
        connection.getConnection(function (err, conn) {
            conn.release()
            conn.query('delete from Family where name=?', name, function (error, results) {
                cb(true);
            });
        })
    }
};
