var express = require('express');
bodyParser = require('body-parser');


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
        helpers:{
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
// custom 404 page
// custom 500 page
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.type('text/plain');
    res.status(500);
    res.send('500 - Server Error');
});

app.get('/', function (req, res) {
    req.session.nome = 'ao';
    res.render('home');
});

app.post('/form', function (req, res) {
    require('./login.js').post(req, res);
    res.redirect(303, '/');
});

app.use(function (req, res) {
    res.status(404);
    res.render('404');
});

app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate.');
});
