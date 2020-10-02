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

    /*************Elimina oggetto***********/
    $('body').on('click', '.delete-oggetto', function() {
        window.listaSpesa.deleteOggetto($(this).parent().find('input').val());
    });

    /**********REAL-TIME EVENTS*********/
    const server = io(window.location.origin, {path: '/events'});
    server.on('connect', function(){
        
        server.on('acquistato', function(res) {
            if(res.lista == listaSpesa.getID())
                window.listaSpesa.moveToAcquistati(res.oggetto);
        });

        server.on('annullamentoAcquisto', function(res){
            if(res.lista == listaSpesa.getID())
                window.listaSpesa.moveToNonAcquistati(res.oggetto);
        });

        server.on('modificaQtaOggetto', function(res){
            if(res.lista == listaSpesa.getID()) {
                var o = window.listaSpesa.getOggetto(res.oggetto);
                o.qta = res.qta;
                window.listaSpesa.refreshOggetto(o.id, o);
            }
        });

        server.on('inseritoOggettoLista', function(o){
            if(o.lista == listaSpesa.getID()) {
                o = o.oggetto;
                window.listaSpesa.addOggetto(new Oggetto(o.ID,o.Nome,o.Note,o.Prezzo,1,false));
            }
        });
        
        server.on('eliminatoOggettoLista', function(o){
            if(o.lista == listaSpesa.getID())
                window.listaSpesa.removeOggetto(o.oggetto);
        });
        
        server.on('chiusuraLista', function(){
            window.listaSpesa.bloccaPagina();
        });
        
    });

    window.listaSpesa.refreshLista();

    var toRefresh = false;
    function checkInternetConnection(){
        if (navigator.onLine) {
            $('#connectionWarning').addClass("hidden");
            $('.sezione').each(function(){ $(this).css("pointer-events", 'all'); });
            if(toRefresh) location.reload();
        }else {
            $('#connectionWarning').removeClass("hidden");
            $('.sezione').each(function(){ $(this).css("pointer-events", 'none'); });
            toRefresh = true;
        }
        setTimeout(function() {
            checkInternetConnection();
        }, 5000);
    }
    checkInternetConnection();
    
});

