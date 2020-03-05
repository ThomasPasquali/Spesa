import Oggetto from './classes/Oggetto.js';
import ListaSpesa from './classes/ListaSpesa.js';

$(document).ready(function() {

    window.listaSpesa = new ListaSpesa(
        window.IDLista,
        window.aperta,
        window.richiedi_prezzi,
        $('#oggetti-acquistati'),
        $('#oggetti-da-acquistare'),
        $('#confirmButton'));

    /**************EVENT HANDLERS*************/
    /*********Acquisto oggetto**********/
    $('body').on('change', '#oggetti-da-acquistare .oggetto', function() {
        let obj = $(this);
        obj.prop('checked', false);
        //FIXME utente da sessione
        let utente = 'Berga';
        let IDOggetto = obj.val();
        let fieldPrezzo = $('<input type="number" min="0.05" max="999.99" step="0.05" placeholder="Prezzo..." required>');
        fieldPrezzo.val(obj.data('prezzo'));
        fieldPrezzo.focusin(function(){ $(this).select(); });

        if(window.listaSpesa.getRichiediPrezzi())
            $.confirm({
                title: 'Inserire il prezzo del prodotto',
                content: fieldPrezzo,
                buttons: {
                    submit: {
                        text: 'Conferma',
                        btnClass: 'btn-blue',
                    },
                    cancel: {
                        text: 'Annulla',
                        btnClass: 'btn-gray',
                    }
                },
                onOpen: () => { fieldPrezzo.focusin(); },
                onAction: function(action){
                    let prezzo = parseFloat(fieldPrezzo.val());
                    if(action == 'submit')
                        if(!prezzo || prezzo > 999.99)
                            $.alert('Inserire un prezzo valido');
                        else
                            window.listaSpesa.acquistaOggetto(IDOggetto, utente, prezzo);
                }
            });
        else
            listaSpesa.acquistaOggetto(IDOggetto, utente, null);
    });

    /*********Annullamento acquisto oggetto**********/
    $('body').on('change', '#oggetti-acquistati .oggetto', function() {
        window.listaSpesa.annullaAcquistoOggetto($(this).val());
    });

    $('body').on('click', '#confirmButton', function() {
        if(window.listaSpesa.isTuttoAcquistato())
            window.listaSpesa.chiudiLista();
        else
            $.alert('Non sono stati acquistati tutti gli oggetti');
    });

    

    /**********REAL-TIME EVENTS*********/
    const server = io(window.location.origin, {path: '/events'});
    server.on('connect', function(){
        
        server.on('acquistato', function(IDOggetto) {
            window.listaSpesa.moveToAcquistati(IDOggetto);
            if(window.listaSpesa.isTuttoAcquistato())
                $('#confirmButton').show();
        });

        server.on('annullamentoAcquisto', function(IDOggetto){
            window.listaSpesa.moveToNonAcquistati(IDOggetto);
            $('#confirmButton').hide();
        });
        
        server.on('chiusuraLista', function(){
            window.listaSpesa.bloccaPagina();
        });

    });

    window.listaSpesa.refreshLista();
    
});

