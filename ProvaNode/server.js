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

app.get('/search', function (req, res) {
    if (req.session.user == undefined) {
        res.redirect(303, '/')
    } else {
        res.render('search');
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
