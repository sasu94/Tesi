var express = require('express');
bodyParser = require('body-parser');
formidable = require('formidable');
var path = require("path");
fs = require('fs');
var parse = require('csv-parse');

var app = express();

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/uploads'));


app.use(require('express-session')({
    secret: 'keyboard-cat',
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var handlebars = require('express-handlebars')
    .create({
        defaultLayout: 'main',
        helpers: {
            section: function (name, options) {
                if (!this._sections) this._sections = {};
                this._sections[name] = options.fn(this);
                return null;
            }
        }
    });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', 80);

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.type('text/plain');
    res.status(500);
    res.send('500 - Server Error');
});



app.use(function (req, res, next) {
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
});

app.use(function (req, res, next) {
    res.locals.projects = req.session.projects;
    next();
});

app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    next();
});

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/login', function (req, res) {

    res.render('login');
});

app.get('/submit', function (req, res) {
    if (req.session.user == undefined) {
        res.redirect(303, '/')
    } else {
        var db1 = require('./persistence/SubjectDAO');
        var db = require('./persistence/SampleDAO');
        load = db1.loadAllSubjects(function (subjects) {
            db.loadProj(req.session.user.id, function (projects) {
                res.render('submit', { projects: projects, subject: subjects });
            });
        });

    }
});

app.post('/submit', function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) return res.redirect(303, '/error');
        var file = files.file;
        var photo = files.photo;
        var path = __dirname + '/uploads/';
        var db = require('./persistence/SampleDAO');
        var id;
        var data = db.newFile(fields.name, fields.project, function (data) {
            fs.renameSync(file.path, path + "/files/" + data + ".csv");
            fs.renameSync(photo.path, path + "/photos/" + data + ".jpeg");

            var parser = parse({ delimiter: ',' }, function (err, split) {
                if (err) throw err;
                split.splice(0, 1);

                for (var j = 0; j < split.length; j++) {
                    for (var i = 0; i < split[j].length; i++) {
                        if (split[j][i] == '.' || split[j][i] == ' ' || split[j][i] == '')
                            split[j][i] = null;
                    }
                    (function (index) {
                        db.newVariation(split[j], fields.subject, data);
                        if (index == split.length - 1) {
                            req.session.flash = {
                                message: 'Your file has been uploaded successfully'
                            }
                            res.redirect(303, '/submit');
                        }
                    })(j);
                }
            });
            fs.createReadStream(path + '/files/' + data + '.csv').pipe(parser);
        });




    });

});

app.get('/subjects', function (req, res) {
    if (req.session.user == undefined) {
        res.redirect(303, '/')
    } else {
        if (req.query.id != undefined) {
            var db = require('./persistence/SubjectDAO');
            var id = req.query.id;
            db.loadSubjects(id, function (subjects) {
                res.render('subjects', { subjects: subjects, family: req.query.id });
            });


        } else {
            var db = require('./persistence/SubjectDAO');

            db.loadFamilies(function (families) {
                res.render('families', { families: families });
            });
        }

    }


});

app.post('/subjects', function (req, res) {
    if (req.query.action == 'newFamily') {
        var db = require('./persistence/SubjectDAO');
        db.newFamily(req.body.name, function () {
            res.redirect(303, '/subjects');

        });

    } else if (req.query.action == 'newSubject') {
        var db = require('./persistence/SubjectDAO');
        db.newSubject(req.body.Id, req.body.ProtocolNumber, req.body.Status, req.body.Sex, req.body.Age, req.body.AgeOfOnset, req.body.Family, function () {
            res.redirect(303, '/subjects?id=' + req.body.Family);

        });
    } else if (req.body.checkFamily != undefined) {
        var db = require('./persistence/SubjectDAO');
        db.checkFamily(req.body.checkFamily, function (data) {
            res.json(data);

        });
    } else if (req.body.checkSubject != undefined) {
        var db = require('./persistence/SubjectDAO');
        db.checkSubject(req.body.checkSubject, function (data) {
            res.json(data);
        });

    } else if (req.body.newSubject != undefined) {
        var db = require('./persistence/SubjectDAO');
        var data = db.newSubject(req.body.newSubject, req.body.ProtocolNumber, req.body.Status, req.body.Sex, req.body.Age, req.body.AgeOfOnset, req.body.Family, function (data) {
            res.json(data);
        });

    } else if (req.body.loadFamilies != undefined) {
        var db = require('./persistence/SubjectDAO');

        db.loadFamilies(function (families) {
            res.json(families);
        });
    } else if (req.body.removeSub != undefined) {
        var db = require('./persistence/SubjectDAO');
        db.removeSubject(req.body.removeSub, function (data) {
            res.json(data);
        });
    } else if (req.body.removeFam != undefined) {
        var db = require('./persistence/SubjectDAO');
        db.removeFamily(req.body.removeFam, function (data) {
            res.json(data);
        });
    }
});

app.get('/projects', function (req, res) {
    if (req.session.user == undefined) {
        res.redirect(303, '/')
    } else {
        var db = require('./persistence/SampleDAO');

        db.loadProj(req.session.user.id, function (projects) {
            req.session.projects = projects;
            res.render('projects', { projects: projects });
        });
    }
});

app.post('/projects', function (req, res) {
    if (req.body.remove != undefined) {
        var db = require('./persistence/SampleDAO');
        db.removeProject(req.body.remove);
    }
});

app.get('/samples', function (req, res) {
    if (req.session.user == undefined) {
        res.redirect(303, '/')
    } else {
        var db = require('./persistence/SampleDAO');

        db.loadSamples(req.query.id, function (samples) {
            var project;
            req.session.projects.forEach(function (element) {
                if (element.Id == req.query.id)
                    project = element;
            });
            res.render('samples', { samples: samples, project: project });
        });
    }
});

app.get('/profile', function (req, res) {
    if (req.session.user == undefined) {
        res.redirect(303, '/')
    } else {
        var db = require('./persistence/UserDAO');
        db.getUser(req.session.user.id, function (data) {
            res.render('profile', { user: data[0] });
        })
    }
});

app.post('/profile', function (req, res) {
    if (req.body.newPassword != undefined) {
        if (req.session.user.password != req.body.oldPassword)
            res.json(false);
        else {
            var db = require('./persistence/UserDAO');
            db.changePassword(req.body.newPassword, req.session.user.id, function () {
                req.session.user.password = req.body.newPassword;
                res.json(true);
            });
        }


    }
});

app.get('/search', function (req, res) {
    if (req.session.user == undefined) {
        res.redirect(303, '/')
    } else {
        var db = require('./persistence/SubjectDAO');
        db.loadAllSubjects(function (subjects) {
            db.loadFamilies(function (families) {
                res.render('search', { subject: subjects, family: families });
            });
        });
    }
});

app.post('/search', function (req, res) {
    var db = require('./persistence/SearchDAO');
    if (req.query.action == 'search') {
        if (req.body.FuncCheck == 'A')
            req.body.func = ['intronic', 'intergenic', 'exonic', 'UTR5', 'UTR3', 'ncRNA_intronic', 'ncRNA_exonic', 'ncRNA_exonic', 'ncRNA_intronic', 'upstream', 'downstream', 'splicing', 'exonic;splicing', 'upstream;downstream'];
        if (req.body.ExFuncCheck == 'A')
            req.body.exFunc = ['frameshift insertion', 'frameshift deletion', 'nonframeshift insertion', 'nonframeshift deletion', 'nonsynonymous SNV', 'synonymous SNV', 'stopgain SNV', 'stoploss SNV', ' '];
        var thousA = req.body['1000G_ALL'][0];
        if (!(thousA.indexOf('null') > -1))
            thousA += req.body['1000G_ALL'][1];
        var thousAfr = req.body['1000G_AFR'][0];
        if (!(thousAfr.indexOf('null') > -1))
            thousAfr += req.body['1000G_AFR'][1];
        var thousE = req.body['1000G_EUR'][0];
        if (!(thousE.indexOf('null') > -1))
            thousE += req.body['1000G_EUR'][1];

        var exacf = req.body['ExAC_Freq'][0];
        if (!(exacf.indexOf('null') > -1))
            exacf += req.body['ExAC_Freq'][1];
        var exaca = req.body['ExAC_AMR'][0];
        if (!(exaca.indexOf('null') > -1))
            exaca += req.body['ExAC_AMR'][1];
        var exacn = req.body['ExAC_NFE'][0];
        if (!(exacn.indexOf('null') > -1))
            exacn += req.body['ExAC_NFE'][1];
        var espa = req.body['ESP6500si_ALL'][0];
        if (!(espa.indexOf('null') > -1))
            espa += req.body['ESP6500si_ALL'][1];
        var cg46 = req.body['CG46'][0];
        if (!(cg46.indexOf('null') > -1))
            cg46 += req.body['CG46'][1];
        var cosmic = req.body['COSMIC_ID'][0];
        if (!(cosmic.indexOf('null') > -1))
            cosmic += req.body['COSMIC_ID'][1];
        var clindis = req.body['ClinVar_DIS'][0];
        if (!(clindis.indexOf('null') > -1))
            clindis += req.body['ClinVar_DIS'][1];
        var clinid = req.body['ClinVar_ID'][0];
        if (!(clinid.indexOf('null') > -1))
            clinid += req.body['ClinVar_ID'][1];
        var clindb = req.body['ClinVar_DBID'][0];
        if (!(clindb.indexOf('null') > -1))
            clindb += req.body['ClinVar_DBID'][1];
        var gwasdis = req.body['GWAS_DIS'][0];
        if (!(gwasdis.indexOf('null') > -1))
            gwasdis += req.body['GWAS_DIS'][1];
        var gwasor = req.body['GWAS_OR'][0];
        if (!(gwasor.indexOf('null') > -1))
            gwasor += req.body['GWAS_OR'][1];
        var chr = req.body['Chr'];
        if (chr == 'all')
            chr = ''
        else {
            chr = 'and chr=\'' + chr + '\'';
        }
        var gene = ''
        if (req.body.Gene != '')
            gene = ' and `Gene.refgene`=\'' + req.body.Gene + '\'';
        var start = req.body['Start'][0];
        if (!(start.indexOf('>=0') > -1))
            start = ' and start' + start + req.body['Start'][1];
        var end = req.body['End'][0];
        if (!(end.indexOf('>=0') > -1))
            end = ' and end' + start + req.body['End'][1];

        var order = ''
        if (req.body.Order != '')
            order = ' order by ' + req.body.Order;
        var common = req.body.common;
        
        switch (req.body.All) {
            case 'A':
                if (req.body.common != '')
                    common = ' and ' + req.body.common + ' in (select ' + req.body.common + ' from variation group by ' + req.body.common + ' having count(distinct(Subject)) > 1)';

                db.allSubject(req.body.func, req.body.exFunc, thousA, thousAfr, thousE, exacf, exaca, exacn, espa, cg46, cosmic, clindis, clinid, clindb, gwasdis, gwasor, chr, start, end, gene, order, common, function (data) {
                    req.session.search = data;
                    res.render('variation', { result: data });
                });
                break;
            case 'S':
                if (req.body.common != '')
                    common = ' and ' + req.body.common + ' in (select ' + req.body.common + ' from variation where Subject in (?) group by ' + req.body.common + ' having count(distinct(Subject)) > 1)';

                db.subjects(req.body.subjects, req.body.func, req.body.exFunc, thousA, thousAfr, thousE, exacf, exaca, exacn, espa, cg46, cosmic, clindis, clinid, clindb, gwasdis, gwasor, chr, start, end, gene, order, common, function (data) {
                    req.session.search = data;
                    res.render('variation', { result: data });
                });
                break;
            case 'F':
                db.families(req.body.family, req.body.func, req.body.exFunc, thousA, thousAfr, thousE, exacf, exaca, exacn, espa, cg46, cosmic, clindis, clinid, clindb, gwasdis, gwasor, chr, start, end, gene, order,common, function (data) {
                    req.session.search = data;
                    res.render('variation', { result: data });
                });
                break;
        }
    } else if (req.query.action == 'filter') {
        var index = req.body.filtering;
        var tab = req.session.search;
        var count = [];
        db.filterValues(index, function (data) {
            data.forEach(function (element) {
                count[element[index]] = [];
                tab.forEach(function (row) {
                    if (!(element[index].indexOf(row['Subject']) > -1)) {
                        if (element[index] == row[index]) {
                            count[element[index]].push(row['Subject']);
                        }
                    }

                });

            });
            console.log(count);

            count.forEach(function (element) {
                if (element.length > 1)
                    console.log(element);
            });


            res.render('variation', { result: req.session.search });
        })

    }
});



app.post('/newProject', function (req, res) {
    var db = require('./persistence/SampleDAO');

    db.newProj(req.body.name, req.session.user.id, function () {
        res.redirect(303, '/projects');
    });

});

app.post('/newProjectAJAX', function (req, res) {
    var db = require('./persistence/SampleDAO');
    var data = db.newProj(req.body.newProject, req.session.user.id, function (data) {
        res.json(data);
    });
});

app.post('/newSubject', function (req, res) {

});



app.post('/form', function (req, res) {
    require('./login.js').post(req, res);
    res.redirect(303, '/');
});

app.post('/login', function (req, res) {
    var db = require('./persistence/UserDAO');
    var result;
    db.cercaUtente(req.body.username, req.body.password, req, res);
});

app.get('/logout', function (req, res) {
    delete req.session.user;
    return res.redirect(303, '/');
});

app.use(function (req, res) {
    res.status(404);
    res.render('404');
});

app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate.');
});
