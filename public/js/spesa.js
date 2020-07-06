import ListaSpesa from './classes/ListaSpesa.js';
import Oggetto from './classes/Oggetto.js';

$(document).ready(function() {

    window.listaSpesa = new ListaSpesa(
        window.IDLista,
        window.aperta,
        window.richiedi_prezzi,
        window.IDsupermercato,
        $('#oggetti-acquistati'),
        $('#oggetti-da-acquistare'),
        $('#chiudi'));

    /**************EVENT HANDLERS*************/
    /*********Acquisto oggetto**********/
    $('body').on('change', '#oggetti-da-acquistare .oggetto', function() {
        window.listaSpesa.acquistaOggetto($(this).val());
    });

    /*********Annullamento acquisto oggetto**********/
    $('body').on('change', '#oggetti-acquistati .oggetto', function() {
        window.listaSpesa.annullaAcquistoOggetto($(this).val());
    });

    /*************Chiusura lista***********/
    $('body').on('click', '#chiudi', function() {
        window.listaSpesa.chiudiLista();
    });

    /*************Nuovo oggetto***********/
    $('body').on('click', '#add', function() {
        window.listaSpesa.nuovoOggetto();
    });

    /**********REAL-TIME EVENTS*********/
    const server = io(window.location.origin, {path: '/events'});
    server.on('connect', function(){
        
        server.on('acquistato', function(IDOggetto) {
            window.listaSpesa.moveToAcquistati(IDOggetto);
        });

        server.on('annullamentoAcquisto', function(IDOggetto){
            window.listaSpesa.moveToNonAcquistati(IDOggetto);
        });

        server.on('modificaQtaOggetto', function(res){
            var o = window.listaSpesa.getOggetto(res.oggetto);
            o.qta = res.qta;
            window.listaSpesa.refreshOggetto(o.id, o);
        });

        server.on('inseritoOggettoLista', function(o){
            window.listaSpesa.addOggetto(new Oggetto(o.ID,o.Nome,o.Note,o.Prezzo,1,false));
        });
        
        server.on('chiusuraLista', function(){
            window.listaSpesa.bloccaPagina();
        });

    });

    window.listaSpesa.refreshLista();

    function checkInternetConnection(){
        if (navigator.onLine) $('#connectionWarning').addClass("hidden");
        else $('#connectionWarning').removeClass("hidden");
        setTimeout(function() {
            checkInternetConnection();
        }, 5000);
    }
    checkInternetConnection();
    
});

