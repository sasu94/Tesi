var connection = require('./Connection');


module.exports = {
    allSubject: function (func, exFunc, thousq, thousAfr, thousE, exacf, exaca, exacn, espa, cg46, cosmic, clindis, clinid, clindb, gwasdis, gwasor, chr, start, end, gene, order, common, cb) {
        connection.getConnection(function (err, conn) {
            conn.query('select * from variation where `Func.refgene` in (?) and `ExonicFunc.refgene` in (?)' + thousq + thousAfr + thousE + exacf + exaca + exacn + espa + cg46 + cosmic + clindis + clinid + clindb + gwasdis + gwasor + chr + start + end + gene + common + order, [func, exFunc], function (error, results) {
                if (error) throw error
                cb(results);
            });
        })
    },
    subjects: function (subject, func, exFunc, thousq, thousAfr, thousE, exacf, exaca, exacn, espa, cg46, cosmic, clindis, clinid, clindb, gwasdis, gwasor, chr, start, end, gene, order, common, cb) {
        connection.getConnection(function (err, conn) {
            conn.query('select * from variation where `Func.refgene` in (?) and `ExonicFunc.refgene` in (?)' + thousq + thousAfr + thousE + exacf + exaca + exacn + espa + cg46 + cosmic + clindis + clinid + clindb + gwasdis + gwasor + chr + start + end + gene + ' and subject in (?)'+common + order, [func, exFunc, subject,subject], function (error, results) {
                if (error) throw error
                cb(results);
            });
        })
    },
    families: function (families, func, exFunc, thousq, thousAfr, thousE, exacf, exaca, exacn, espa, cg46, cosmic, clindis, clinid, clindb, gwasdis, gwasor, chr, start, end, gene, order, common, cb) {
        connection.getConnection(function (err, conn) {
            conn.query('select * from variation v inner join subject s on v.Subject=s.Id where s.family in (?) and `Func.refgene` in (?) and `ExonicFunc.refgene` in (?)' + thousq + thousAfr + thousE + exacf + exaca + exacn + espa + cg46 + cosmic + clindis + clinid + clindb + gwasdis + gwasor + chr + start + end + gene + common, order, [families, func, exFunc], function (error, results) {
                if (error) throw error
                cb(results);
            });
        })
    },
    allFunction: function (cb) {
        connection.getConnection(function (err, conn) {
            conn.query('select distinct `Func.refgene` from variation', function (error, results) {
                if (error) throw error
                cb(results);
            });
        })
    },
    filterValues: function (col, cb) {
        connection.getConnection(function (err, conn) {
            conn.query('select distinct ' + col + ' from variation', function (error, results) {
                if (error) throw error
                cb(results);
            });
        })
    }

};