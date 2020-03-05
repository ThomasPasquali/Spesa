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
const fs = require('fs');
const ini = require('ini');
global.iniFile = ini.parse(fs.readFileSync('./app.ini', 'utf-8'));
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
  //FIXME PRENDERE DA SESSIONE
  const gruppi = query.getGruppiUtente(user, 4);
  //FIXME PRENDERE DA SESSIONE
  const prefGroup = {ID : 1, Nome : 'Rekkie'};
  
  Promise.all([gruppi, supermercati]).then(function(values) {
    res.render('addLista', {
      title: 'Nuova lista',
      saluto: misc.getSaluto(),
      user: user,
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

/*************SPESA***********/
app.get(/\/spesa\/\d+/, function (req, res) {
  const listaID = req.originalUrl.split('/')[2];
  const lista = query.getLista(listaID);
  lista.then(function(lista) {
    res.render('spesa', {
      lista: lista[0]
    });
  }).catch(function(err) { console.log(err); });
  
});

/*************RUNTIME REQUESTS***********/
app.post(/\/get\/(oggettiSupermercato|oggettiLista|ricetteGruppo|ricettaByID)/, function (req, res) {
  const richiesta = req.originalUrl.split('/')[2];
  let risposta;
  switch (richiesta) {
    case 'oggettiSupermercato': risposta = query.getOggettiSupermercato(req.body.IDSupermercato); break;
    case 'oggettiLista': risposta = query.getOggettiLista(req.body.IDLista); break;
    case 'ricetteGruppo': risposta = query.getRicetteGruppo(req.body.IDGruppo, req.body.IDSupermercato); break;
    case 'ricettaByID' : risposta = query.getOggettiRicetta(req.body.IDRicetta); break;
    default: risposta = null; break;
  }
  risposta.then((data) => {
    res.write(JSON.stringify(data));
    res.end();
  }).catch((err) => {
    res.write(JSON.stringify(err));
    res.end();
  });
  
});

app.post(/\/update\/(acquistaOggetto|annullaAcquistoOggetto|chiudiLista)/, function (req, res) {
  const richiesta = req.originalUrl.split('/')[2];
  let risposta;
  switch (richiesta) {
    case 'acquistaOggetto':
      risposta = query.acquistaOggetto(
        req.body.IDOggetto,
        req.body.IDLista,
        req.body.IDUtente,
        req.body.prezoAcquisto
      );
      io.sockets.emit('acquistato', req.body.IDOggetto);
      break;
    case 'annullaAcquistoOggetto':
        risposta = query.annullaAcquistaOggetto(
          req.body.IDOggetto,
          req.body.IDLista
        );
        io.sockets.emit('annullamentoAcquisto', req.body.IDOggetto);
        break;
    case 'chiudiLista':
      risposta = query.chiudiLista(req.body.IDLista);
      io.sockets.emit('chiusuraLista');
      break;
    default: risposta = null; break;
  }
  risposta.then((data) => {
    res.write(JSON.stringify(null));
    res.end();
  }).catch((err) => {
    res.write(JSON.stringify(err));
    res.end();
  });
  
});

const server = app.listen(PORT);

/************EVENTS EMITTER************/
const io = require('socket.io')(server, {
  path: '/events',
  pingInterval: 10000,
  pingTimeout: 5000
});
