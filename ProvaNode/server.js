var express = require('express');
bodyParser = require('body-parser');
formidable = require('formidable');
var path = require("path");
fs = require('fs');
var parse = require('csv-parse');

var app = express();

app.use(express.static(__dirname + '/public'));


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
        res.redirect(303,'/')
    }else{
        var db = require('./persistence/SampleDAO');
        load = db.loadSubjects(function (subjects) {
            db.loadProj(req.session.user.id, function (projects) {
                res.render('submit', { projects: projects,subject:subjects });
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
        var data = db.newFile(fields.name, fields.project, function(data){
            fs.renameSync(file.path, path + "/files/" + data + ".csv");
            fs.renameSync(photo.path, path + "/photos/" + data + ".jpeg");

            var parser = parse({ delimiter: ',' }, function (err, split) {
                if (err) throw err;
                split.splice(0, 1);
                count = 0;
                total = split.length - 1;

               for (var j = 0; j < split.length-1; j++) {
                        for (var i = 0; i < split[j].length; i++) {
                            if (split[j][i] == '.' || split[j][i] == ' ' || split[j][i] == '')
                                split[j][i] = null;
                        }
                        count++
                        db.newVariation(split[j], fields.subject, data);
                }  
            });
            fs.createReadStream(path + '/files/' + data + '.csv').pipe(parser);
        });

        req.session.flash = {
            message: 'Your file has been uploaded successfully'
        }
        res.redirect(303, '/submit');
        
       
    });

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
