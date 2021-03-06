const http = require('http');
const express = require('express');
const session = require('express-session');
const path = require('path');
const body_parser = require('body-parser');
const url = require('url');
const Cookies = require('cookies');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const favicon = require('serve-favicon');
const fs = require('fs');
const ini = require('ini');
global.iniFile = ini.parse(fs.readFileSync('./app.ini', 'utf-8'));
const query = require('./lib/query.js');
const misc = require('./lib/misc.js');
const app = express();

app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
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

const PORT = global.iniFile.app.port;
const SALT_ROUNDS = 3;

/**********CONTROLLO LOGIN (su tutte le pagine tranne login)*********/
app.use(function(req, res, next) {
    next(); req.session.username = 'Thomas'/*
    if(req.session.username || req.originalUrl == '/login'){
        next();
    }else
        res.redirect('/login');*/
});

/***********REDIRECT HOME***********/
app.get('/', function(req, res) { res.redirect('/home'); });

/***********LOGIN***********/
app.get('/login', function(req, res) { res.render('login', { title: 'Loggati SDM' }); });
app.post('/login', function(req, res) {
    let username = req.body.usr;
    let password = req.body.psw;
    if (username && password)
        query.getDatiUtente(username).then(dati => {
            dati = dati[0];
            if (dati && bcrypt.compareSync(password, dati['Password'])) {
                req.session.username = username;
                req.session.role = dati['Ruolo'];
                req.session.prefs = JSON.parse(dati['Preferenze']);
                res.redirect('/home');
            } else
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

/***********LOGOUT***********/
app.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/login');
});

/***********GENERATORE HASH PER PASSWORD***********/
app.get('/hash', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    let password = req.query.p;
    if (password)
        res.write(bcrypt.hashSync(password, SALT_ROUNDS));
    else
        res.write('Utilizzo: http://<server>/hash?p=<password>');
    res.end();
});

//TODO DELETEME
/***********TEST***********/
app.get('/test', function(req, res) {
    res.render('test', {
        var1: 'var1',
        var2: 2,
        var3: [{ a: 1 }, 2], // per acccedere a 1  --> var3[0].a
        var4: { id: 1, nome: 'dsdd' } //per accedere --> var4.nome
    });
});

/***********NUOVA LISTA***********/
app.get('/newLista', function(req, res) {
    const supermercati = query.getSupermercati();
    const gruppi = query.getGruppiUtente(req.session.username);

    Promise.all([gruppi, supermercati]).then(function(values) {
        res.render('addLista', {
            title: 'Nuova lista',
            saluto: misc.getSaluto(),
            user: req.session.username,
            displayTitle: '',
            displaySearchBar: 'none;',
            displayConfirmB: '',
            prefGroup: '',
            allGroups: values[0],
            allSupermercati: values[1]
        });
    }).catch(function(err) { console.log(err); });

});

/*************HOME PAGE***********/
app.get('/home', function(req, res) {
    const listeUtente = query.getListeUtente(req.session.username);
    listeUtente.then(function(liste) {
        res.render('home', {
            saluto: misc.getSaluto(),
            user: {
                name: req.session.username,
                role: req.session.role
            },
            displayTitle: '',
            displaySearchBar: '',
            displayConfirmB: '',
            listeUtente: liste
        });
    }).catch(function(err) { console.log(err); });

});

/*************GESTIONE OGGETTI***********/
app.get('/gestioneOggetti', function(req, res) {
    res.render('gestioneOggetti', {
        saluto: misc.getSaluto(),
        user: req.session.username,
    });
});

/*************GESTIONE UTENTE***********/
app.get('/gestioneUtenze', function(req, res) {
    const allGroups = query.getGruppi();
    allGroups.then(function(groups) {
        res.render('gestioneUtenti', {
            saluto: misc.getSaluto(),
            user: req.session.username,
            groups: groups
        });
    }).catch(function(err) { console.log(err); });
});

/*************GESTIONE RICETTE***********/
app.get('/gestioneRicette', function(req, res) {
    const ricetteUtente = query.getRicetteUtente('Thomas');//FIXME req.session.username);
    ricetteUtente.then(function(ricette) {
        res.render('gestioneRicette', {
            saluto: misc.getSaluto(),
            user: req.session.username,
            ricette: ricette
        });
    }).catch(function(err) { console.log(err); });
});

/*************SPESA***********/
app.get(/\/spesa\/\d+/, function(req, res) {
    const listaID = req.originalUrl.split('/')[2];
    const lista = query.getLista(listaID);
    lista.then(function(lista) {
        res.render('spesa', {
            lista: lista[0]
        });
    }).catch(function(err) { console.log(err); });

});

/*************RUNTIME REQUESTS***********/
app.post(/\/get\/(oggettiSupermercato|oggettiLista|ricetteGruppo|ricettaByID|supermercati|oggetti|utentiDiUnGruppo|utenti)/, function(req, res) {
    const richiesta = req.originalUrl.split('/')[2];
    let risposta;
    switch (richiesta) {
        case 'oggettiSupermercato':
            risposta = query.getOggettiSupermercato(req.body.IDSupermercato);
            break;
        case 'oggettiLista':
            risposta = query.getOggettiLista(req.body.IDLista);
            break;
        case 'ricetteGruppo':
            risposta = query.getRicetteGruppo(req.body.IDGruppo, req.body.IDSupermercato);
            break;
        case 'ricettaByID':
            risposta = query.getOggettiRicetta(req.body.IDRicetta);
            break;
        case 'supermercati':
            risposta = query.getSupermercati();
            break;
        case 'oggetti':
            risposta = query.getOggetti();
            break;
        case 'utentiDiUnGruppo':
            risposta = query.getUsersByGruppo(req.body.IDGruppo);
            break;
        case 'utenti':
            console.log(req.body);
            risposta = query.getUtentiManacanti(req.body.IDG);
            break;
        default:
            risposta = null;
            break;
    }
    risposta.then((data) => {
        res.write(JSON.stringify(data));
        res.end();
    }).catch((err) => {
        res.write(JSON.stringify(err));
        res.end();
    });

});

app.post(/\/update\/(acquistaOggetto|annullaAcquistoOggetto|chiudiLista|qtaOggetto|oggetto|ricetta)/, function(req, res) {
    const richiesta = req.originalUrl.split('/')[2];
    let risposta;
    switch (richiesta) {
        case 'acquistaOggetto':
            risposta = query.acquistaOggetto(
                req.body.IDOggetto,
                req.body.IDLista,
                req.session.username,
                req.body.prezoAcquisto
            );
            io.sockets.emit('acquistato', { 'oggetto': req.body.IDOggetto, 'lista': req.body.IDLista });
            break;
        case 'annullaAcquistoOggetto':
            risposta = query.annullaAcquistaOggetto(
                req.body.IDOggetto,
                req.body.IDLista
            );
            io.sockets.emit('annullamentoAcquisto', { 'oggetto': req.body.IDOggetto, 'lista': req.body.IDLista });
            break;
        case 'chiudiLista':
            risposta = query.chiudiLista(req.body.IDLista);
            io.sockets.emit('chiusuraLista');
            break;
        case 'qtaOggetto':
            risposta = query.modificaQtaOggetto(req.body.IDOggetto, req.body.IDLista, req.body.qta);
            io.sockets.emit('modificaQtaOggetto', { oggetto: req.body.IDOggetto, qta: req.body.qta, lista: req.body.IDLista });
            break;
        case 'oggetto':
            risposta = query.updateOggetto(req.body.ID, req.body.Nome, req.body.Note, req.body.Prezzo);
            break;
        case 'ricetta':
            risposta = query.updateRicetta(req.body.ID, req.body.Descrizione);
            break;
        default:
            risposta = null;
            break;
    }
    risposta.then((data) => {
        res.write(JSON.stringify(null));
        res.end();
    }).catch((err) => {
        res.write(JSON.stringify(err));
        res.end();
    });

});

app.post(/\/insert\/(oggettoLista|oggetto|nuovaLista|utenteInGruppo|gruppoUtenti|oggettoInNuovaLista|oggettoRicetta)/, function(req, res) {
    const richiesta = req.originalUrl.split('/')[2];
    let risposta;
    switch (richiesta) {
        case 'oggettoLista':
            risposta = query.insertOggettoLista(req.body.IDOggetto, req.body.IDLista, req.body.IDSupermercato, (req.body.qta ? 1 : req.body.qta));
            query.getOggetto(req.body.IDOggetto).then((o) => {
                io.sockets.emit('inseritoOggettoLista', { 'oggetto': o[0], 'lista': req.body.IDLista });
            });
            break;
        case 'oggetto':
            risposta = query.insertOggetto(req.body.nome, req.body.note, req.body.prezzo, req.body.supermercato);
            break;
        case 'nuovaLista':
            risposta = query.addLista(req.body.nomeLista, req.body.groupLinked, req.body.supermercato, req.body.richiedi_prezzi)
                .catch((err) => { return err; });
            break;
        case 'oggettoInNuovaLista':
            query.insertOggettoLista(req.body.IDOggetto, req.body.IDLista, req.body.IDSupermercato, req.body.qta).catch((err) => { console.log(err); });
            break;
        case 'utenteInGruppo':
            risposta = query.insertUtenteInGruppo(req.body.IDG, req.body.IDU).catch((err) => { console.log(err); });
            break;
        case 'gruppoUtenti':
            query.insertGruppoUtenti(req.body.nome).then((succ) => {
                res.redirect('/gestioneUtenze');
            }).catch((err) => {
                console.log(err);
                res.write('Errore!');
            });
            break;
        case 'oggettoRicetta':
            risposta = query.insertOggettoRicetta(req.body.ricetta, req.body.oggetto, req.body.supermercato);
            break;
        default:
            risposta = null;
            break;
    }
    if (risposta)
        risposta.then((data) => {
            console.log(data);
            res.write(JSON.stringify(data));
            res.end();
        }).catch((err) => {
            console.log(err);
            res.write(JSON.stringify(err));
            res.end();
        });

});

app.post(/\/delete\/(oggetto|utente|oggettoLista|oggettoRicetta)/, function(req, res) {
    const richiesta = req.originalUrl.split('/')[2];
    let risposta;
    switch (richiesta) {
        case 'oggetto':
            risposta = query.deleteOggetto(req.body.ID);
            break;
        case 'utente':
            risposta = query.deleteUtenteFromGruppo(req.body.IDG, req.body.IDU);
            break;
        case 'oggettoLista':
            risposta = query.deleteOggettoLista(req.body.oggetto, req.body.lista);
            risposta.then(() => {
                io.sockets.emit('eliminatoOggettoLista', { 'oggetto': req.body.oggetto, 'lista': req.body.lista });
            })
            break;
        case 'oggettoRicetta':
            risposta = query.deleteOggettoRicetta(req.body.oggetto, req.body.ricetta);
            break;
        default:
            risposta = null;
            break;
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