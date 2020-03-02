const http = require('http');
const express = require('express');
const session = require('express-session');
const path = require('path');
const body_parser = require('body-parser');
const url = require('url');
const Cookies = require('cookies');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const favicon = require('serve-favicon');
const query = require('./lib/query.js');
const misc = require('./lib/misc.js');
const app = express();

app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const PORT = 3000;
const SALT_ROUNDS = 3;

/**********CONTROLLO LOGIN (su tutte le pagine tranne login)*********/
app.use(function(req, res, next) {
  next();
  //FIXME ELIMINAMIIIIIIII
  /*if(req.session.username || req.originalUrl == '/login')
    next();
  else
    res.redirect('/login');*/
});

/***********REDIRECT HOME***********/
app.get('/', function (req, res) { res.redirect('/home'); });

/***********LOGIN***********/
app.get('/login', function (req, res) { res.render('login', {title: 'Loggati babbano'}); });
app.post('/login', function (req, res) {
  let username = req.body.usr;
  let password = req.body.psw;
  if(username && password)
    query.getDatiUtente(username).then(dati => {
      dati = dati[0];
      if(bcrypt.compareSync(password, dati['Password'])) {
        req.session.username = username;
        req.session.prefs = JSON.parse(dati['Preferenze']);
        res.redirect('/home');
      }else
        res.render('login', {
          title: 'DANGER',
          errNotValidUsrOrPass: 'Username o password errati'
        });
    }).catch(err => { console.log(err); });
  else
    res.render('login', {
      title: 'DANGER',
      errNotValidUsrOrPass: 'Username o password errati'
    });
});

/***********GENERATORE HASH PER PASSWORD***********/
app.get('/hash', function (req, res) {
  res.setHeader('Content-Type', 'text/plain');
  let password = req.query.p;
  if(password)
    res.write(bcrypt.hashSync(password, SALT_ROUNDS));
  else
    res.write('Utilizzo: http://<server>/hash?p=<password>');
  res.end();
});

/***********NUOVA LISTA***********/
app.get('/newLista', function (req, res) {
  //FIXME user da sessione
  const user = 'Berga';
  const supermercati = query.getSupermercati();
  const gruppi = query.getGruppiUtente(user);
  //FIXME PRENDERE DA SESSIONE
  const prefGroup = {ID : 1, Nome : 'Rekkie'};

  Promise.all([gruppi, supermercati]).then(function(values) {
    res.render('addLista', {
      title: 'Nuova lista',
      saluto: misc.getSaluto(),
      user: req.session.username,
      displayTitle: '',
      displaySearchBar: 'none;',
      displayConfirmB: '',
      prefGroup: prefGroup,
      allGroups: values[0],
      allSupermercati: values[1]
    });
  }).catch(function(err) { console.log(err); });

});

/*************HOME PAGE***********/
app.get('/home', function (req, res) {
  //FIXME user da sessione
  const user = 'Berga';
  const listeUtente = query.getListeUtente(user);
  listeUtente.then(function(liste) {
    res.render('home', {
      title: 'Casa pagina',
      saluto: misc.getSaluto(),
      user: user,
      displayTitle: '',
      displaySearchBar: '',
      displayConfirmB: '',
      listeUtente: liste
    });
  }).catch(function(err) { console.log(err); });
  
});

app.listen(PORT);

