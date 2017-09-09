var connection = require('./Connection');


module.exports = {
    allSubject: function (func, exFunc, thousq, thousAfr, thousE, exacf, exaca, exacn, espa, cg46, cosmic, clindis, clinid, clindb, gwasdis, gwasor, chr, start, end, gene, order, common, pagination, page, func2, cb) {
        connection.getConnection(function (err, conn) {
            var query = 'select * from variation where `Func.refgene` in (?) and `ExonicFunc.refgene` in (?)' + thousq + thousAfr + thousE + exacf + exaca + exacn + espa + cg46 + cosmic + clindis + clinid + clindb + gwasdis + gwasor + chr + start + end + gene + common + order + pagination;
            conn.query('select * from variation where `Func.refgene` in (?) and `ExonicFunc.refgene` in (?)' + thousq + thousAfr + thousE + exacf + exaca + exacn + espa + cg46 + cosmic + clindis + clinid + clindb + gwasdis + gwasor + chr + start + end + gene + common + order + pagination, [func, exFunc, func2, exFunc, page], function (error, results) {
                conn.release()
                if (error) throw error
                cb(results, query, func, exFunc);
            });
        })
    },
    subjects: function (subject, func, exFunc, thousq, thousAfr, thousE, exacf, exaca, exacn, espa, cg46, cosmic, clindis, clinid, clindb, gwasdis, gwasor, chr, start, end, gene, order, common, pagination, page, subject2, cb) {
        connection.getConnection(function (err, conn) {
            var query = 'select * from variation where `Func.refgene` in (?) and `ExonicFunc.refgene` in (?)' + thousq + thousAfr + thousE + exacf + exaca + exacn + espa + cg46 + cosmic + clindis + clinid + clindb + gwasdis + gwasor + chr + start + end + gene + ' and subject in (?)' + common + order + pagination;
            conn.query('select * from variation where `Func.refgene` in (?) and `ExonicFunc.refgene` in (?)' + thousq + thousAfr + thousE + exacf + exaca + exacn + espa + cg46 + cosmic + clindis + clinid + clindb + gwasdis + gwasor + chr + start + end + gene + ' and subject in (?)' + common + order + pagination, [func, exFunc, subject, subject2, func, exFunc, page], function (error, results) {
                conn.release()
                if (error) throw error
                cb(results, query, func, exFunc, subject);
            });
        })
    },
    families: function (families, func, exFunc, thousq, thousAfr, thousE, exacf, exaca, exacn, espa, cg46, cosmic, clindis, clinid, clindb, gwasdis, gwasor, chr, start, end, gene, order, common, pagination, page, families2, cb) {
        connection.getConnection(function (err, conn) {
            var query = 'select * from variation v inner join subject s on v.Subject=s.Id where s.family in (?) and `Func.refgene` in (?) and `ExonicFunc.refgene` in (?) ' + thousq + thousAfr + thousE + exacf + exaca + exacn + espa + cg46 + cosmic + clindis + clinid + clindb + gwasdis + gwasor + chr + start + end + gene + common + order + pagination;
            conn.query('select * from variation v inner join subject s on v.Subject=s.Id where s.family in (?) and `Func.refgene` in (?) and `ExonicFunc.refgene` in (?) ' + thousq + thousAfr + thousE + exacf + exaca + exacn + espa + cg46 + cosmic + clindis + clinid + clindb + gwasdis + gwasor + chr + start + end + gene + common + order + pagination, [families, func, exFunc, families2, func, exFunc, page], function (error, results) {
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
    numPagesAll: function (init, func, exFunc, thousq, thousAfr, thousE, exacf, exaca, exacn, espa, cg46, cosmic, clindis, clinid, clindb, gwasdis, gwasor, chr, start, end, gene, order, common, cb) {
        connection.getConnection(function (err, conn) {
            conn.query(init + 'from variation where `Func.refgene` in (?) and `ExonicFunc.refgene` in (?)' + thousq + thousAfr + thousE + exacf + exaca + exacn + espa + cg46 + cosmic + clindis + clinid + clindb + gwasdis + gwasor + chr + start + end + gene + common, [func, exFunc, func, exFunc], function (error, results) {
                conn.release()
                if (error) throw error
                cb(Math.ceil(results[0]['num']), results[0].tot);
            });
        })
    },
    numPagesSubj: function (init, subject, func, exFunc, thousq, thousAfr, thousE, exacf, exaca, exacn, espa, cg46, cosmic, clindis, clinid, clindb, gwasdis, gwasor, chr, start, end, gene, order, common, cb) {
        connection.getConnection(function (err, conn) {
            conn.query(init + 'from variation where `Func.refgene` in (?) and `ExonicFunc.refgene` in (?)' + thousq + thousAfr + thousE + exacf + exaca + exacn + espa + cg46 + cosmic + clindis + clinid + clindb + gwasdis + gwasor + chr + start + end + gene + ' and subject in (?)' + common, [func, exFunc, subject, subject, func, exFunc], function (error, results) {
                conn.release()
                if (error) throw error
                cb(Math.ceil(results[0]['num']), results[0].tot);
            });
        })
    },
    numPagesFam: function (init, families, func, exFunc, thousq, thousAfr, thousE, exacf, exaca, exacn, espa, cg46, cosmic, clindis, clinid, clindb, gwasdis, gwasor, chr, start, end, gene, order, common, cb) {
        connection.getConnection(function (err, conn) {
            conn.query(init + 'from variation v inner join subject s on v.Subject=s.Id where s.family in (?) and `Func.refgene` in (?) and `ExonicFunc.refgene` in (?)' + thousq + thousAfr + thousE + exacf + exaca + exacn + espa + cg46 + cosmic + clindis + clinid + clindb + gwasdis + gwasor + chr + start + end + gene + common, [families, func, exFunc, families, func, exFunc], function (error, results) {
                conn.release()
                if (error) throw error
                cb(Math.ceil(results[0]['num']), results[0].tot);
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

    AllSubjectsPaginated: function (query, func, ExFunc, page,func2, cb) {
        connection.getConnection(function (err, conn) {
            conn.query(query, [func, ExFunc, func2, ExFunc, page], function (error, results) {
                conn.release()
                if (error) throw error
                cb(results);
            });
        })
    },

    SubjectsPaginated: function (query, func, ExFunc, subjects, subjects2, page, cb) {
        connection.getConnection(function (err, conn) {
            conn.query(query, [func, ExFunc, subjects, subjects2, func, ExFunc, page], function (error, results) {
                console.log(query + '\n' + func + '\n' + ExFunc + '\n' + page);
                conn.release()
                if (error) throw error
                cb(results);
            });
        })
    },

    FamiliesPaginated: function (query, func, ExFunc, families, families2, page, cb) {
        connection.getConnection(function (err, conn) {
            conn.query(query, [families, func, ExFunc, families2, func, ExFunc, page], function (error, results) {
                console.log(query + '\n' + func + '\n' + ExFunc + '\n' + page);
                conn.release()
                if (error) throw error
                cb(results);
            });
        })
    },
    exportAll: function (query, func, ExFunc, cb) {
        connection.getConnection(function (err, conn) {
            conn.query(query, [func, ExFunc, func, ExFunc], function (error, results) {
                conn.release()
                if (error) throw error
                cb(results);
            });
        })

    },
    exportSubjects: function (query, func, ExFunc, subjects, cb) {
        connection.getConnection(function (err, conn) {
            conn.query(query, [func, ExFunc, subjects, subjects, func, ExFunc], function (error, results) {
                conn.release()
                if (error) throw error
                cb(results);
            });
        })

    },
    exportFamilies: function (query, func, ExFunc, families, cb) {
        connection.getConnection(function (err, conn) {
            conn.query(query, [families, func, ExFunc, families, func, ExFunc], function (error, results) {
                conn.release()
                if (error) throw error
                cb(results);
            });
        })
    },
    stats: function (query, func, ExFunc, cb) {
        connection.getConnection(function (err, conn) {
            conn.query(query, [func, ExFunc, func, ExFunc], function (error, results) {
                conn.release()
                if (error) throw error
                cb(results);
            });
        });
    },
    subjectsStats: function (query, func, ExFunc, subjects, cb) {
        connection.getConnection(function (err, conn) {
            conn.query(query, [func, ExFunc, subjects, subjects, func, ExFunc], function (error, results) {
                conn.release()
                if (error) throw error
                cb(results);
            });
        });

    },
    familiesStats: function (query, func, ExFunc, families, cb) {
        connection.getConnection(function (err, conn) {
            conn.query(query, [families, func, ExFunc, families, func, ExFunc], function (error, results) {
                conn.release()
                if (error) throw error
                cb(results);
            });
        });

    }
};