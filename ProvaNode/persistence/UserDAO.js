﻿var connection = require('./Connection');


module.exports = {
    cercaUtente: function (user, pass, req, res) {
        connection.getConnection(function (err, conn) {
            conn.query('select * from User where Username=? and Password=?', [user, pass], function (error, results) {
                if (results.length == 1) {
                    User = require('../model/User.js');
                    req.session.user = new User(results[0].Id, req.body.username,results.Laboratory);
                    return res.redirect(303, '/');
                } else {
                    req.session.flash = {
                        message: 'username or password are invalid'
                    }
                    return res.redirect(303, '/login');
                }
            });
        })
    },

    getUser: function (user, cb) {
        connection.getConnection(function (err, conn) {
            conn.query('select * from user inner join laboratory on user.Laboratory=laboratory.Id where user.id=?', [user], function (error, results) {
                if (error) throw error;
                if (results.length == 1) {
                    cb(results)
                }
            });
        })
    }
};