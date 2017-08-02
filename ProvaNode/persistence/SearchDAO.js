var connection = require('./Connection');


module.exports = {
    allSubject: function (func, exFunc, thousq, thousAfr, thousE, exacf, exaca, exacn, espa, cg46, cosmic, clindis, clinid, clindb, gwasdis, gwasor, chr, start, end, gene, order, common,limit, cb) {
        connection.getConnection(function (err, conn) {
            var query='select * from variation where `Func.refgene` in (?) and `ExonicFunc.refgene` in (?)' + thousq + thousAfr + thousE + exacf + exaca + exacn + espa + cg46 + cosmic + clindis + clinid + clindb + gwasdis + gwasor + chr + start + end + gene + common + order;
            conn.query('select * from variation where `Func.refgene` in (?) and `ExonicFunc.refgene` in (?)' + thousq + thousAfr + thousE + exacf + exaca + exacn + espa + cg46 + cosmic + clindis + clinid + clindb + gwasdis + gwasor + chr + start + end + gene + common + order+' limit 0,15', [func, exFunc], function (error, results) {
                conn.release()
                if (error) throw error
                cb(results,query,func,exFunc);
            });
        })
    },
    subjects: function (subject, func, exFunc, thousq, thousAfr, thousE, exacf, exaca, exacn, espa, cg46, cosmic, clindis, clinid, clindb, gwasdis, gwasor, chr, start, end, gene, order, common,limit, cb) {
        connection.getConnection(function (err, conn) {
            var query = 'select * from variation where `Func.refgene` in (?) and `ExonicFunc.refgene` in (?)' + thousq + thousAfr + thousE + exacf + exaca + exacn + espa + cg46 + cosmic + clindis + clinid + clindb + gwasdis + gwasor + chr + start + end + gene + ' and subject in (?)' + common + order;
            conn.query('select * from variation where `Func.refgene` in (?) and `ExonicFunc.refgene` in (?)' + thousq + thousAfr + thousE + exacf + exaca + exacn + espa + cg46 + cosmic + clindis + clinid + clindb + gwasdis + gwasor + chr + start + end + gene + ' and subject in (?)' + common + order + ' limit 0,15' , [func, exFunc, subject,subject], function (error, results) {
                conn.release()
                if (error) throw error
                cb(results, query, func, exFunc,subject);
            });
        })
    },
    families: function (families, func, exFunc, thousq, thousAfr, thousE, exacf, exaca, exacn, espa, cg46, cosmic, clindis, clinid, clindb, gwasdis, gwasor, chr, start, end, gene, order, common, limit,cb) {
        connection.getConnection(function (err, conn) {
            var query = 'select * from variation v inner join subject s on v.Subject=s.Id where s.family in (?) and `Func.refgene` in (?) and `ExonicFunc.refgene` in (?) ' + thousq + thousAfr + thousE + exacf + exaca + exacn + espa + cg46 + cosmic + clindis + clinid + clindb + gwasdis + gwasor + chr + start + end + gene + common + order;
            conn.query('select * from variation v inner join subject s on v.Subject=s.Id where s.family in (?) and `Func.refgene` in (?) and `ExonicFunc.refgene` in (?) ' + thousq + thousAfr + thousE + exacf + exaca + exacn + espa + cg46 + cosmic + clindis + clinid + clindb + gwasdis + gwasor + chr + start + end + gene + common + order+' limit 0,15', [families, func, exFunc,families], function (error, results) {
                conn.release()
                if (error) throw error
                cb(results, query, func, exFunc, families);
            });
        })
    },
    allFunction: function (cb) {
        connection.getConnection(function (err, conn) {
            conn.query('select distinct `Func.refgene` from variation', function (error, results) {
                conn.release()
                if (error) throw error
                cb(results);
            });
        })
    },
    numPagesAll: function (func, exFunc, thousq, thousAfr, thousE, exacf, exaca, exacn, espa, cg46, cosmic, clindis, clinid, clindb, gwasdis, gwasor, chr, start, end, gene, order, common, cb) {
        connection.getConnection(function (err, conn) {
            conn.query('select count(*)/ 15 as num from variation where `Func.refgene` in (?) and `ExonicFunc.refgene` in (?)' + thousq + thousAfr + thousE + exacf + exaca + exacn + espa + cg46 + cosmic + clindis + clinid + clindb + gwasdis + gwasor + chr + start + end + gene + common, [func, exFunc], function (error, results) {
                conn.release()
                if (error) throw error
                cb(Math.ceil(results[0]['num']));
            });
        })
    },
    numPagesSubj: function (subject, func, exFunc, thousq, thousAfr, thousE, exacf, exaca, exacn, espa, cg46, cosmic, clindis, clinid, clindb, gwasdis, gwasor, chr, start, end, gene, order, common, cb) {
        connection.getConnection(function (err, conn) {
            conn.query('select count(*)/15 as num from variation where `Func.refgene` in (?) and `ExonicFunc.refgene` in (?)' + thousq + thousAfr + thousE + exacf + exaca + exacn + espa + cg46 + cosmic + clindis + clinid + clindb + gwasdis + gwasor + chr + start + end + gene + ' and subject in (?)' + common, [func, exFunc, subject, subject], function (error, results) {
                conn.release()
                if (error) throw error
                console.log(results);
                cb(Math.ceil(results[0]['num']));
            });
        })
    },
    numPagesFam: function (families, func, exFunc, thousq, thousAfr, thousE, exacf, exaca, exacn, espa, cg46, cosmic, clindis, clinid, clindb, gwasdis, gwasor, chr, start, end, gene, order, common, cb) {
        connection.getConnection(function (err, conn) {
            conn.query('select count(*)/15 as num from variation v inner join subject s on v.Subject=s.Id where s.family in (?) and `Func.refgene` in (?) and `ExonicFunc.refgene` in (?)' + thousq + thousAfr + thousE + exacf + exaca + exacn + espa + cg46 + cosmic + clindis + clinid + clindb + gwasdis + gwasor + chr + start + end + gene + common, [families, func, exFunc,families], function (error, results) {
                conn.release()
                if (error) throw error
                cb(Math.ceil(results[0]['num']));
            });
        })
    },
    filterValues: function (col, cb) {
        connection.getConnection(function (err, conn) {
            conn.query('select distinct ' + col + ' from variation', function (error, results) {
                conn.release()
                if (error) throw error
                cb(results);
            });
        })
    },

    AllSubjectsPaginated: function (query, func, ExFunc, page,cb) {
        connection.getConnection(function (err, conn) {
            conn.query(query + ' limit ' + 15 * (page - 1) + ' ,15', [func, ExFunc], function (error, results) {
                console.log(query + '\n' + func + '\n' + ExFunc + '\n' + page);
                conn.release()
                if (error) throw error
                cb(results);
            });
        })
    },

    SubjectsPaginated: function (query, func, ExFunc, subjects,page, cb) {
        connection.getConnection(function (err, conn) {
            conn.query(query + ' limit ' + 15 * (page - 1) + ' ,15', [func, ExFunc, subjects, subjects], function (error, results) {
                console.log(query + '\n' + func + '\n' + ExFunc + '\n' + page);
                conn.release()
                if (error) throw error
                cb(results);
            });
        })
    },

    FamiliesPaginated: function (query, func, ExFunc, families, page, cb) {
        connection.getConnection(function (err, conn) {
            conn.query(query + ' limit ' + 15 * (page - 1) + ' ,15', [families,func, ExFunc, families], function (error, results) {
                console.log(query + '\n' + func + '\n' + ExFunc + '\n' + page);
                conn.release()
                if (error) throw error
                cb(results);
            });
        })
    }
};