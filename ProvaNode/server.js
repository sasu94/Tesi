var express = require('express');
bodyParser = require('body-parser');
formidable = require('formidable');
var path = require("path");
fs = require('fs');
var parse = require('csv-parse');
var xls = require('json2xls');

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
            },
            if_eq: function (a, b, opts) {
                if (a == b) // Or === depending on your needs
                    return opts.fn(this);
                else
                    return opts.inverse(this);
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
                        if (i == 8) {
                            if (split[j][i] == '.' || split[j][i] == ' ' || split[j][i] == '')
                                split[j][i] = ' ';
                        } else {
                            if (split[j][i] == '.' || split[j][i] == ' ' || split[j][i] == '')
                                split[j][i] = null;
                        }
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
    } else if (req.query.edit != undefined) {
        var db = require('./persistence/SubjectDAO');
        db.getSubject(req.query.edit, function (data) {
            res.render('subjectEdit', { subject: data[0] });
        });

    } else {
        if (req.query.id != undefined) {
            var db = require('./persistence/SubjectDAO');
            var db2 = require('./persistence/SampleDAO');
            var id = req.query.id;
            db.loadSubjects(id, function (subjects) {
                db2.loadProj(req.session.user.id, function (projects) {
                    res.render('subjects', { subjects: subjects, family: req.query.id, projects: projects });
                });
            });


        } else {
            var db = require('./persistence/SubjectDAO');
            var db2 = require('./persistence/SampleDAO');
            db.loadFamilies(function (families) {
                db.getSporadic(function (sporadic) {
                    db2.loadProj(req.session.user.id, function (projects) {
                        res.render('families', { families: families, sporadic: sporadic, projects: projects });
                    });
                });
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

    } else if (req.query.action == 'edit') {
        var db = require('./persistence/SubjectDAO');

        if (req.body.ProtocolNumber == '')
            req.body.protocolNumber = null;
        if (req.body.Status == '')
            req.body.Status = null;
        if (req.body.Sex == '')
            req.body.Sex = null;
        if (req.body.Age == '')
            req.body.Age = null;
        if (req.body.AgeOfOnset == '')
            req.body.AgeOfOnset = null;
        if (req.body.GeneticStatus == '')
            req.body.GeneticStatus = null;

        db.editSubject(req.body.Id, req.body.ProtocolNumber, req.body.Status, req.body.GeneticStatus, req.body.Sex, req.body.Age, req.body.AgeOfOnset, function (data) {
            req.session.flash = {
                message: 'Your subject has been edited successfully'
            }
            res.redirect(303, '/subjects?edit=' + req.body.Id);
        });

    } else if (req.query.action == 'newSporadic') {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var file = files.file;
            var photo = files.photo;
            var ped = files.ped;
            var path = __dirname + '/uploads/';
            var db = require('./persistence/SubjectDAO');
            var db2 = require('./persistence/SampleDAO');
            var id;
            fs.renameSync(ped.path, path + "/photos/ped" + fields.Id + ".jpeg");


            if (fields.ProtocolNumber == '')
                fields.protocolNumber = null;
            if (fields.Status == '')
                fields.Status = null;
            if (fields.Sex == '')
                fields.Sex = null;
            if (fields.Age == '')
                fields.Age = null;
            if (fields.AgeOfOnset == '')
                fields.AgeOfOnset = null;
            if (fields.GeneticStatus == '')
                fields.GeneticStatus = null;


            db.newSubject(fields.Id, fields.ProtocolNumber, fields.Status, fields.Sex, fields.Age, fields.AgeOfOnset, fields.GeneticStatus, null, function () {

                var data = db2.newFile(fields.Id, fields.project, function (data) {
                    fs.renameSync(photo.path, path + "/photos/" + data + ".jpeg");
                    fs.renameSync(file.path, path + "/files/" + data + ".csv");
                    var parser = parse({ delimiter: ',' }, function (err, split) {
                        if (err) throw err;
                        split.splice(0, 1);

                        for (var j = 0; j < split.length; j++) {
                            for (var i = 0; i < split[j].length; i++) {
                                if (i == 8) {
                                    if (split[j][i] == '.' || split[j][i] == ' ' || split[j][i] == '')
                                        split[j][i] = ' ';
                                } else {
                                    if (split[j][i] == '.' || split[j][i] == ' ' || split[j][i] == '')
                                        split[j][i] = null;
                                }
                            }
                            (function (index) {
                                db2.newVariation(split[j], fields.Id, data);
                                if (index == split.length - 1) {
                                    req.session.flash = {
                                        message: 'Your file has been uploaded successfully'
                                    }
                                    res.redirect(303, '/subjects');
                                }
                            })(j);
                        }
                    });
                    fs.createReadStream(path + '/files/' + data + '.csv').pipe(parser);
                });
            });


        });



    } else if (req.query.action == 'newSubject') {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) return res.redirect(303, '/error');
            var file = files.file;
            var photo = files.photo;
            var ped = files.ped;
            var path = __dirname + '/uploads/';
            var db = require('./persistence/SubjectDAO');
            var db2 = require('./persistence/SampleDAO');
            var id;
            fs.renameSync(ped.path, path + "/photos/ped" + fields.Id + ".jpeg");


            if (fields.ProtocolNumber == '')
                fields.protocolNumber = null;
            if (fields.Status == '')
                fields.Status = null;
            if (fields.Sex == '')
                fields.Sex = null;
            if (fields.Age == '')
                fields.Age = null;
            if (fields.AgeOfOnset == '')
                fields.AgeOfOnset = null;
            if (fields.GeneticStatus == '')
                fields.GeneticStatus = null;


            db.newSubject(fields.Id, fields.ProtocolNumber, fields.Status, fields.Sex, fields.Age, fields.AgeOfOnset, fields.GeneticStatus, fields.Family, function () {

                var data = db2.newFile(fields.Id, fields.project, function (data) {
                    fs.renameSync(photo.path, path + "/photos/" + data + ".jpeg");
                    fs.renameSync(file.path, path + "/files/" + data + ".csv");
                    var parser = parse({ delimiter: ',' }, function (err, split) {
                        if (err) throw err;
                        split.splice(0, 1);

                        for (var j = 0; j < split.length; j++) {
                            for (var i = 0; i < split[j].length; i++) {
                                if (i == 8) {
                                    if (split[j][i] == '.' || split[j][i] == ' ' || split[j][i] == '')
                                        split[j][i] = ' ';
                                } else {
                                    if (split[j][i] == '.' || split[j][i] == ' ' || split[j][i] == '')
                                        split[j][i] = null;
                                }
                            }
                            (function (index) {
                                db2.newVariation(split[j], fields.Id, data);
                                if (index == split.length - 1) {
                                    req.session.flash = {
                                        message: 'Your file has been uploaded successfully'
                                    }
                                    res.redirect(303, '/subjects?id=' + fields.Family);
                                }
                            })(j);
                        }
                    });
                    fs.createReadStream(path + '/files/' + data + '.csv').pipe(parser);
                });
            });


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

        //var form = new formidable.IncomingForm();
        //form.parse(req, function (err, fields, files) {
        //    if (err) return res.redirect(303, '/error');
        //    var photo = files.genealogic;
        //    var path = __dirname + '/uploads/';
        //    var db = require('./persistence/SubjectDAO');
        //    var id;
        //    fs.renameSync(photo.path, path + "/photos/" + fields.Id + ".jpeg");
        //    console.log(fields);
        //    db.newSubject(fields.Id, fields.ProtocolNumber, fields.Status, fields.Sex, fields.Age, fields.AgeOfOnset, fields.GeneticStatus, fields.Family, function (data) {
        //        res.json(data)
        //    });




        //});
        console.log(req.body);
        //var db = require('./persistence/SubjectDAO');
        //var data = db.newSubject(req.body.newSubject, req.body.ProtocolNumber, req.body.Status, req.body.Sex, req.body.Age, req.body.AgeOfOnset, req.body.Family, function (data) {
        //    res.json(data);
        //});

    } else if (req.body.loadFamilies != undefined) {
        var db = require('./persistence/SubjectDAO');

        db.loadFamilies(function (families) {
            res.json(families);
        });
    } else if (req.body.removeSub != undefined) {
        var db2 = require('./persistence/SampleDAO');
        var db = require('./persistence/SubjectDAO');
        db.removeSubject(req.body.removeSub, function (data) {
            db2.idBySubject(req.body.removeSub, function (id) {
                console.log(id);
                fs.unlinkSync(__dirname + '/uploads/files/' + id[0].id + '.csv');
                fs.unlinkSync(__dirname + '/uploads/photos/' + id[0].id + '.jpeg');
                fs.unlinkSync(__dirname + '/uploads/photos/ped' + req.body.removeSub + '.jpeg');
                db2.removeSampleByName(req.body.removeSub);

                res.json(data);
            })
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
    var db = require('./persistence/SampleDAO');
    if (req.body.removeProj != undefined) {
        db.samplesByProject(req.body.removeProj, function (samples) {
            if (samples.length > 0)
                samples.forEach(function (item) {
                    fs.unlinkSync(__dirname + '/uploads/photos/' + item.id + '.jpeg');
                    fs.unlinkSync(__dirname + '/uploads/files/' + item.id + '.csv');
                    db.nameByProject(item.id, function (name) {
                        fs.unlinkSync(__dirname + '/uploads/photos/ped' + name[0].name + '.jpeg');
                        db.removeSubjectsBySample(item.id, function () {
                            db.removeProject(req.body.removeProj);
                        });
                    })
                })
            else
                db.removeProject(req.body.removeProj);
        });
    } else if (req.body.removeSample != undefined) {
        db.removeSubjectsBySample(req.body.removeSample, function (data) {
            fs.unlinkSync(__dirname + '/uploads/photos/' + req.body.removeSample + '.jpeg');
            fs.unlinkSync(__dirname + '/uploads/files/' + req.body.removeSample + '.csv');
            db.nameByProject(req.body.removeSample, function (data) {
                fs.unlinkSync(__dirname + '/uploads/photos/ped' + data[0].name + '.jpeg');
                db.removeSample(req.body.removeSample);
            })
        });
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
    } else if (req.query.action == 'chart') {
        var db = require('./persistence/SearchDAO');

        if (req.session.type == 'A') {

            var query = req.session.query.replace('limit ?,15', '').replace('select * ', '').replace('order by', ' group by `Func.refgene` order by');
            if (!(query.indexOf('order by') > -1)) {
                query += ' group by `Func.refgene`';
            }
            db.stats('select count(*) as n, `Func.refgene` as func ' + query, req.session.func, req.session.ExFunc, function (data) {
                var funcs = []; var funcsData = []
                for (i = 0; i < data.length; i++) {
                    funcs.push(data[i].func);
                    funcsData.push(data[i].n);

                }

                query = query.replace('group by `Func.refgene`', 'group by Subject');
                db.stats('select count(*) as n, Subject as s ' + query, req.session.func, req.session.ExFunc, function (data) {
                    var subs = []; var subsData = []
                    for (i = 0; i < data.length; i++) {
                        subs.push(data[i].s);
                        subsData.push(data[i].n);

                    }


                    if (!(query.indexOf('order by') > -1)) {
                        query = query.replace('group by Subject', 'group by `ExonicFunc.refgene` having `ExonicFunc.refgene` != "" order by n desc');
                    } else {
                        query = query.replace('group by Subject', 'group by `ExonicFunc.refgene` having `ExonicFunc.refgene` != ""');
                        query = query.replace('order by', 'order by n desc, ');
                    }
                    db.stats('select count(*) as n, `ExonicFunc.refgene` as r ' + query, req.session.func, req.session.ExFunc, function (data) {
                        var refs = []; var refsData = []
                        for (i = 0; i < data.length; i++) {
                            refs.push(data[i].r);
                            refsData.push(data[i].n);
                        }
                        res.render('chart', { f: funcs, fData: funcsData, s: subs, sData: subsData, r: refs, rData: refsData });

                    });



                });
            });
        } else if (req.session.type == 'S') {
            var query = req.session.query.replace('limit ?,15', '').replace('select * ', '').replace('order by', ' group by `Func.refgene` order by');
            if (!(query.indexOf('order by') > -1)) {
                query += ' group by `Func.refgene`';
            }
            db.subjectsStats('select count(*) as n, `Func.refgene` as func ' + query, req.session.func, req.session.ExFunc, req.session.subjects, function (data) {
                var funcs = []; var funcsData = []
                for (i = 0; i < data.length; i++) {
                    funcs.push(data[i].func);
                    funcsData.push(data[i].n);

                }

                query = query.replace('group by `Func.refgene`', 'group by Subject');
                db.subjectsStats('select count(*) as n, Subject as s ' + query, req.session.func, req.session.ExFunc, req.session.subjects, function (data) {
                    var subs = []; var subsData = []
                    for (i = 0; i < data.length; i++) {
                        subs.push(data[i].s);
                        subsData.push(data[i].n);

                    }


                    if (!(query.indexOf('order by') > -1)) {
                        query = query.replace('group by Subject', ' group by `ExonicFunc.refgene` having `ExonicFunc.refgene` != "" order by n desc ');
                    } else {
                        query = query.replace('group by Subject', ' group by `ExonicFunc.refgene` having `ExonicFunc.refgene` != "" ');
                        query = query.replace('order by', 'order by n desc, ');
                    }
                    db.subjectsStats('select count(*) as n, `ExonicFunc.refgene` as r ' + query, req.session.func, req.session.ExFunc, req.session.subjects, function (data) {
                        var refs = []; var refsData = []
                        for (i = 0; i < data.length; i++) {
                            refs.push(data[i].r);
                            refsData.push(data[i].n);
                        }

                        res.render('chart', { f: funcs, fData: funcsData, s: subs, sData: subsData, r: refs, rData: refsData });
                    });



                });
            });
        } else {
            var query = req.session.query.replace('limit ?,15', '').replace('select * ', '').replace('order by', ' group by `Func.refgene` order by');
            if (!(query.indexOf('order by') > -1)) {
                query += ' group by `Func.refgene`';
            }
            db.familiesStats('select count(*) as n, `Func.refgene` as func ' + query, req.session.func, req.session.ExFunc, req.session.subjects, function (data) {
                var funcs = []; var funcsData = []
                for (i = 0; i < data.length; i++) {
                    funcs.push(data[i].func);
                    funcsData.push(data[i].n);

                }

                query = query.replace('group by `Func.refgene`', 'group by Subject');
                db.familiesStats('select count(*) as n, Subject as s ' + query, req.session.func, req.session.ExFunc, req.session.subjects, function (data) {
                    var subs = []; var subsData = []
                    for (i = 0; i < data.length; i++) {
                        subs.push(data[i].s);
                        subsData.push(data[i].n);

                    }


                    if (!(query.indexOf('order by') > -1)) {
                        query = query.replace('group by Subject', ' group by `ExonicFunc.refgene` having `ExonicFunc.refgene` != "" order by n desc ');
                    } else {
                        query = query.replace('group by Subject', 'group by `ExonicFunc.refgene` having `ExonicFunc.refgene` != ""');
                        query = query.replace('order by', 'order by n desc, ');
                    }
                    db.familiesStats('select count(*) as n, `ExonicFunc.refgene` as r ' + query, req.session.func, req.session.ExFunc, req.session.subjects, function (data) {
                        var refs = []; var refsData = []
                        for (i = 0; i < data.length; i++) {
                            refs.push(data[i].r);
                            refsData.push(data[i].n);
                        }

                        res.render('chart', { f: funcs, fData: funcsData, s: subs, sData: subsData, r: refs, rData: refsData });
                    });



                });
            });
        }
    } else if (req.query.action == 'export') {
        var db = require('./persistence/SearchDAO');
        if (req.session.type == 'A') {
            db.exportAll(req.session.query.replace('limit ?,15', ''), req.session.func, req.session.ExFunc, function (data) {
                var result = [];
                function replacer(key) {
                    if (key.indexOf('.') > -1)
                        key = key.replace('.', ' ');
                };


                for (var i = 0; i < data.length; i++) {
                    var r = {}
                    for (var key in data[i]) {
                        if (key != 'Id' && key != 'Sample') {
                            if (key.indexOf('.') > -1)
                                r[key.replace('.', ' ')] = data[i][key];
                            else
                                r[key] = data[i][key];
                        }

                    }
                    result.push(r);
                }
                var file = xls(result);
                fs.writeFileSync('data.xlsx', file, 'binary');
                res.download('data.xlsx');

            });
        } else if (req.session.type == 'S') {
            db.exportSubjects(req.session.query.replace('limit ?,15', ''), req.session.func, req.session.ExFunc, req.session.subjects, function (data) {
                var result = [];
                function replacer(key) {
                    if (key.indexOf('.') > -1)
                        key = key.replace('.', ' ');
                };


                for (var i = 0; i < data.length; i++) {
                    var r = {}
                    for (var key in data[i]) {
                        if (key != 'Id' && key != 'Sample') {
                            if (key.indexOf('.') > -1)
                                r[key.replace('.', ' ')] = data[i][key];
                            else
                                r[key] = data[i][key];
                        }

                    }
                    result.push(r);
                }
                var file = xls(result);
                fs.writeFileSync('data.xlsx', file, 'binary');
                res.download('data.xlsx');

            });
        } else {
            db.exportFamilies(req.session.query.replace('limit ?,15', ''), req.session.func, req.session.ExFunc, req.session.subjects, function (data) {
                var result = [];
                function replacer(key) {
                    if (key.indexOf('.') > -1)
                        key = key.replace('.', ' ');
                };


                for (var i = 0; i < data.length; i++) {
                    var r = {}
                    for (var key in data[i]) {
                        if (key != 'Id' && key != 'Sample') {
                            if (key.indexOf('.') > -1)
                                r[key.replace('.', ' ')] = data[i][key];
                            else
                                r[key] = data[i][key];
                        }

                    }
                    result.push(r);
                }
                var file = xls(result);
                fs.writeFileSync('data.xlsx', file, 'binary');
                res.download('data.xlsx');

            });

        }


    } else if (req.query.page != undefined) {
        var db = require('./persistence/SearchDAO');
        if (req.session.type == 'A') {
            var page = (parseInt(req.query.page) - 1) * 15;
            var func2 = page;
            if (req.session.common == 'yes') {
                func2 = req.session.func;
            } else if (req.session.common == 'no') {
                func2 = req.session.func;
            }
            db.AllSubjectsPaginated(req.session.query, req.session.func, req.session.ExFunc, page, func2, function (data) {
                if (req.session.comm == true) {
                    var sta = data[0].Start; var ref = data[0].Ref;
                    var r = [];
                    r.push(data[0]);
                    var S = [];
                    S.push(data[0].Subject);
                    for (i = 1; i < data.length; i++) {
                        if (data[i].Start == sta && data[i].Ref == ref)
                            S.push(data[i].Subject);
                        else {
                            r[r.length - 1].Subject = S;
                            r.push(data[i]);
                            S = [];
                            S.push(data[i].Subject);
                            sta = data[i].Start;
                            ref = data[i].Ref;
                        }
                    }
                    r[r.length - 1].Subject = S;
                    res.render('variation', { common: r, pages: req.session.limit, page: req.query.page, total: req.session.total });
                } else {

                    res.render('variation', { result: data, pages: req.session.limit, page: req.query.page, total: req.session.total });
                }

            });
        } else if (req.session.type == 'S') {
            var subjects2 = req.session.subjects;
            if (req.session.comm == 0)
                subjects2 = (parseInt(req.query.page) - 1) * 15;
            db.SubjectsPaginated(req.session.query, req.session.func, req.session.ExFunc, req.session.subjects, subjects2, (parseInt(req.query.page) - 1) * 15, function (data) {
                if (req.session.comm == 1) {

                    var sta = data[0].Start; var ref = data[0].Ref;
                    var r = [];
                    r.push(data[0]);
                    var S = [];
                    S.push(data[0].Subject);
                    for (i = 1; i < data.length; i++) {
                        if (data[i].Start == sta && data[i].Ref == ref)
                            S.push(data[i].Subject);
                        else {
                            r[r.length - 1].Subject = S;
                            r.push(data[i]);
                            S = [];
                            S.push(data[i].Subject);
                            sta = data[i].Start;
                            ref = data[i].Ref;
                        }
                    }
                    r[r.length - 1].Subject = S;
                    res.render('variation', { common: r, pages: req.session.limit, page: req.query.page, total: req.session.total });
                } else {
                    res.render('variation', { result: data, pages: req.session.limit, page: req.query.page, total: req.session.total });
                }
            });
        } else {
            var families2 = req.session.subjects;
            if (req.session.comm == 0)
                families2 = (parseInt(req.query.page) - 1) * 15
            db.FamiliesPaginated(req.session.query, req.session.func, req.session.ExFunc, req.session.subjects, families2, (parseInt(req.query.page) - 1) * 15, function (data) {
                if (req.session.comm == 1) {
                    var sta = data[0].Start; var ref = data[0].Ref;
                    var r = [];
                    r.push(data[0]);
                    var S = [];
                    S.push(data[0].Subject);
                    for (i = 1; i < data.length; i++) {
                        if (data[i].Start == sta && data[i].Ref == ref)
                            S.push(data[i].Subject);
                        else {
                            r[r.length - 1].Subject = S;
                            r.push(data[i]);
                            S = [];
                            S.push(data[i].Subject);
                            sta = data[i].Start;
                            ref = data[i].Ref;
                        }
                    }
                    r[r.length - 1].Subject = S;
                    res.render('variation', { common: r, pages: req.session.limit, page: req.query.page, total: req.session.total });
                } else {
                    res.render('variation', { result: data, pages: req.session.limit, page: req.query.page, total: req.session.total });
                }
            });

        }
    }
    else {
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
        var common = req.body.common;
        var order = ''

        if (common != '') {
            order = ' order by Start,Ref'
            if (req.body.Order != '')
                order += ', ' + req.body.Order;
        } else {
            if (req.body.Order != '')
                order = ' order by ' + req.body.Order;
        }

        var pagination = ' limit ?,15';
        var commonp;
        switch (req.body.All) {
            case 'A':
                commonp = '';
                var init = 'select count(*)/ 15 as num, count(*) as tot ';
                var func2 = 0;
                req.session.common = req.body.common;
                if (req.body.common == 'yes') {
                    common = ' and Start in (Select * from(select Start from variation where `Func.refgene` in (?) and `ExonicFunc.refgene` in (?) group by Start having count(distinct(Subject)) > 1 limit ?,15) as t)';
                    commonp = ' group by Start having count(distinct(Subject)) > 1) as t';
                    pagination = '';
                    init = 'select count(*)/ 15 as num, count(*) as tot from(select * ';
                    func2 = req.body.func;
                }
                else if (req.body.common == 'no') {
                    commonp = common = ' and Start not in (select Start from variation where `Func.refgene` in (?) and `ExonicFunc.refgene` in (?) group by Start having count(distinct(Subject)) > 1)';
                    func2 = req.body.func;
                }

                db.numPagesAll(init, req.body.func, req.body.exFunc, thousA, thousAfr, thousE, exacf, exaca, exacn, espa, cg46, cosmic, clindis, clinid, clindb, gwasdis, gwasor, chr, start, end, gene, order, commonp, function (limit, total) {
                    db.allSubject(req.body.func, req.body.exFunc, thousA, thousAfr, thousE, exacf, exaca, exacn, espa, cg46, cosmic, clindis, clinid, clindb, gwasdis, gwasor, chr, start, end, gene, order, common, pagination, 0, func2, function (data, query, func, ExFunc) {
                        if (req.body.common == 'yes') {
                            console.log(data);
                            if (data[0] != undefined) {
                                var sta = data[0].Start; var ref = data[0].Ref;
                                var r = [];
                                r.push(data[0]);
                                var S = [];
                                S.push(data[0].Subject);
                                for (i = 1; i < data.length; i++) {
                                    if (data[i].Start == sta && data[i].Ref == ref)
                                        S.push(data[i].Subject);
                                    else {
                                        r[r.length - 1].Subject = S;
                                        r.push(data[i]);
                                        S = [];
                                        S.push(data[i].Subject);
                                        sta = data[i].Start;
                                        ref = data[i].Ref;
                                    }
                                }

                                r[r.length - 1].Subject = S;
                            }
                            req.session.type = 'A'
                            req.session.query = query;
                            req.session.func = func;
                            req.session.ExFunc = ExFunc;
                            req.session.limit = limit;
                            req.session.comm = true;
                            req.session.total = total;
                            res.render('variation', { common: r, pages: limit, page: 1, total: total });
                        } else {
                            req.session.type = 'A'
                            req.session.query = query;
                            req.session.func = func;
                            req.session.ExFunc = ExFunc;
                            req.session.limit = limit;
                            req.session.comm = false;
                            req.session.total = total;
                            res.render('variation', { result: data, pages: limit, page: 1, total: total });
                        }
                    });
                });
                break;
            case 'S':
                var subject2 = 0;
                commonp = '';
                req.session.comm = 0;
                var init = 'select count(*)/ 15 as num, count(*) as tot  ';
                if (req.body.common == 'yes') {
                    common = ' and Start in (select * from(select Start from variation where Subject in (?) and `Func.refgene` in (?) and `ExonicFunc.refgene` in (?) group by Start having count(distinct(Subject)) > 1 limit ?,15) as t)';
                    commonp = ' group by Start having count(distinct(Subject)) > 1) as t';
                    pagination = ''
                    subject2 = req.body.subjects;
                    req.session.comm = 1;
                    var init = 'select count(*)/ 15 as num, count(*) as tot  from(select * ';
                }
                else if (req.body.common == 'no') {
                    commonp = common = ' and Start not in (select Start from variation where Subject in (?) and `Func.refgene` in (?) and `ExonicFunc.refgene` in (?) group by Start having count(distinct(Subject)) > 1)';
                    subject2 = req.body.subjects;
                    req.session.comm = 2;
                }
                db.numPagesSubj(init, req.body.subjects, req.body.func, req.body.exFunc, thousA, thousAfr, thousE, exacf, exaca, exacn, espa, cg46, cosmic, clindis, clinid, clindb, gwasdis, gwasor, chr, start, end, gene, order, commonp, function (limit, total) {
                    db.subjects(req.body.subjects, req.body.func, req.body.exFunc, thousA, thousAfr, thousE, exacf, exaca, exacn, espa, cg46, cosmic, clindis, clinid, clindb, gwasdis, gwasor, chr, start, end, gene, order, common, pagination, 0, subject2, function (data, query, func, ExFunc, subjects) {
                        if (req.body.common == 'yes') {
                            if (data[0] != undefined) {
                                var sta = data[0].Start; var ref = data[0].Ref;
                                var r = [];
                                r.push(data[0]);
                                var S = [];
                                S.push(data[0].Subject);
                                for (i = 1; i < data.length; i++) {
                                    if (data[i].Start == sta && data[i].Ref == ref)
                                        S.push(data[i].Subject);
                                    else {
                                        r[r.length - 1].Subject = S;
                                        r.push(data[i]);
                                        S = [];
                                        S.push(data[i].Subject);
                                        sta = data[i].Start;
                                        ref = data[i].Ref;
                                    }
                                }
                                r[r.length - 1].Subject = S;
                            }
                            req.session.type = 'S'
                            req.session.query = query;
                            req.session.func = func;
                            req.session.ExFunc = ExFunc;
                            req.session.subjects = subjects;
                            req.session.limit = limit;
                            req.session.total = total;
                            res.render('variation', { common: r, pages: limit, page: 1, total: total });


                        } else {
                            req.session.type = 'S'
                            req.session.query = query;
                            req.session.func = func;
                            req.session.ExFunc = ExFunc;
                            req.session.subjects = subjects;
                            req.session.limit = limit;
                            req.session.total = total;
                            res.render('variation', { result: data, pages: limit, page: 1, total: total });
                        }
                    });
                });
                break;
            case 'F':
                commonp = '';
                var families = 0;
                req.session.comm = 0;
                var init = 'select count(*)/ 15 as num, count(*) as tot  ';
                if (req.body.common == 'yes') {
                    common = ' and Start in (select * from(select Start from variation v inner join (select id,family from subject where family in (?)) s on v.Subject = s.Id where `Func.refgene` in (?) and `ExonicFunc.refgene` in (?) group by Start having count(distinct(Subject)) > 1 limit ?,15) as t)';
                    pagination = '';
                    commonp = ' group by Start having count(distinct(Subject)) > 1) as t';
                    families = req.body.family;
                    req.session.comm = 1;
                    init = 'select count(*)/ 15 as num, count(*) as tot  from(select Start ';
                } else if (req.body.common == 'no') {
                    commonp = common = ' and Start not in (select Start from variation v inner join (select id,family from subject where family in (?)) s on v.Subject = s.Id where `Func.refgene` in (?) and `ExonicFunc.refgene` in (?) group by Start having count(distinct(Subject)) > 1)';
                    families = req.body.family;
                    req.session.comm = 2;
                }

                db.numPagesFam(init, req.body.family, req.body.func, req.body.exFunc, thousA, thousAfr, thousE, exacf, exaca, exacn, espa, cg46, cosmic, clindis, clinid, clindb, gwasdis, gwasor, chr, start, end, gene, order, commonp, function (limit, total) {
                    db.families(req.body.family, req.body.func, req.body.exFunc, thousA, thousAfr, thousE, exacf, exaca, exacn, espa, cg46, cosmic, clindis, clinid, clindb, gwasdis, gwasor, chr, start, end, gene, order, common, pagination, 0, families, function (data, query, func, ExFunc, families) {
                        if (req.body.common == 'yes') {
                            console.log(query);
                            if (data[0] != undefined) {
                                var sta = data[0].Start; var ref = data[0].Ref;
                                var r = [];
                                r.push(data[0]);
                                var S = [];
                                S.push(data[0].Subject);
                                for (i = 1; i < data.length; i++) {
                                    if (data[i].Start == sta && data[i].Ref == ref)
                                        S.push(data[i].Subject);
                                    else {
                                        r[r.length - 1].Subject = S;
                                        r.push(data[i]);
                                        S = [];
                                        S.push(data[i].Subject);
                                        sta = data[i].Start;
                                        ref = data[i].Ref;
                                    }
                                }
                                r[r.length - 1].Subject = S;
                            }
                            req.session.type = 'F'
                            req.session.query = query;
                            req.session.func = func;
                            req.session.ExFunc = ExFunc;
                            req.session.subjects = families;
                            req.session.limit = limit;
                            req.session.total = total;
                            res.render('variation', { common: r, pages: limit, page: 1, total: total });
                        } else {
                            req.session.type = 'F'
                            req.session.query = query;
                            req.session.func = func;
                            req.session.ExFunc = ExFunc;
                            req.session.subjects = families;
                            req.session.limit = limit;
                            req.session.total = total;
                            res.render('variation', { result: data, pages: limit, page: 1, total: total });
                        }
                    });
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

app.get('/registration', function (req, res) {
    var db = require('./persistence/UserDAO');
    db.getLaboratory(function (data) {
        res.render('registration', { lab: data });
    });
});

app.post('/registration', function (req, res) {
    if (req.body.newLab != undefined) {
        var db = require('./persistence/UserDAO');
        db.newLaboratory(req.body.newLab, function (data) {
            res.json(data)

        })
    } else if (req.body.checkUser != undefined) {
        var db = require('./persistence/UserDAO');
        db.checkUser(req.body.checkUser, function (data) {
            res.json(data);
        });
    } else {
        var db = require('./persistence/UserDAO');
        db.newUser(req.body.username, req.body.password, parseInt(req.body.Lab), function (data) {
            req.session.flash = {
                message: 'Your registration is complete'
            }
            res.redirect(303, '/registration');
        });


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
