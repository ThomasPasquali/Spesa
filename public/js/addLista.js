
//Inizializza gli eventi nella pagina @newLista

import Oggetto from './classes/Oggetto.js';
import ListaAddLista from './classes/ListaAddLista.js';
import {validateSelectInput, getDatalistId, getDatalistIdTwo, getDatalistName, recreateSetIngredienti, recreateDataListRicette, recreateDataListAlimenti, createHTMLForPopup} from './functionsAddLista.js';

let listaAlimenti = new ListaAddLista(null,false);

$(document).ready(function () {
        var btnAddUtente = $('#addUtenteAssociato');
        var btnAddAlimento = $('#addAlimento');
        var radioUtenti = $('input.radioUtenti');
        var selectSuperMer = $('#selectS');
        var contenitore = $('div.utenti.master');
        var divAlimenti = $('#divAlimenti');
        var datalistSupermercati= $('#allSupermercati');
        var datalistAlimenti = $('#allAlimenti');
        var inputAlimenti = $('#inpuntWithList');
        var contenitoreAlimenti = $('div.lista.master');
        var btnAddRicetta = $('#addRicetta');
        var selectRicetta = $('#selectR');
        var confirmR = $('#confirmRicette');

        var savedSelectedSuperMer = 0;
        var savedSelectedGroup = null;

        let listaSpesa = new ListaAddLista($(contenitoreAlimenti),true);

        // Aggiunge l'elemento scelto alla lista della spesa, 
        // se esiste già ne incrementa la quantità
        $('body').on('change', '.alimento.inputWithList', function (e) {
            let valid = validateSelectInput($(datalistAlimenti), $(this).val());
            if(valid){
                $(this).removeClass().addClass('alimento');
                $(divAlimenti).removeClass().addClass('alimenti actived');
                var idCurrAl = getDatalistIdTwo($(datalistAlimenti), $(this).val());
                var tempIgr = listaAlimenti.getOggetto(idCurrAl);
                listaSpesa.addOggetto(idCurrAl, tempIgr);
            }else{
                $(this).removeClass().addClass('alimento invalid');
                $(divAlimenti).removeClass().addClass('alimenti blocked');
            }
        });

        // Quando viene premuto il pulsante OK all'interno del div collassabile
        // tutti gli utenti selezionati vengono aggiunti al form e vengono cancellati i precedenti
        $('#confirmUtenti').click(function (e) {
            $(contenitore).empty();
            $(radioUtenti).each(function () {
                if ($(this).is(':checked')) {
                    var nome = $(this).attr('id');
                    var id = $(this).attr('value');
                    var html = '<div class="utente"><input class="utente" type="hidden" readonly="readonly" name="utente" value="' + id + '" /><label class="utente">' + nome + '</label><button type="button" class="utente rmUtenteAssociato"><i class="fa fa-remove rimuovi"></i></button></div>';
                    e.preventDefault();
                    savedSelectedGroup = id;
                    $(contenitore).append(html);
                }
            });
            recreateDataListRicette(savedSelectedGroup, savedSelectedSuperMer);
            $('div.utente').hide().show('fast');
            $('.content-collapsible-utenti').slideUp('fast');
        });

        // Quando viene premuto il pulsante cancella, presente in ogni div utente,
        // questo viene cancellato con una breve animazione, viene anche tolta la spunta della checkbox corrispondente
        $(contenitore).on('click', '.rmUtenteAssociato', function (e) {
            e.preventDefault();
            var id = $(this).parent('div.utente').find('input.utente').attr('value');
            savedSelectedGroup = null;
            $(radioUtenti).each(function(){
                if($(this).attr('value') == id){
                    $(this).prop('checked', false);
                }
            });
            recreateDataListRicette(savedSelectedGroup, savedSelectedSuperMer);
            $(this).parent('div.utente').fadeOut('slow', function () {
                $(this).remove();
            });
        });

        // Apertura menù selezione utenti
        $(btnAddUtente).click(function (e){
            e.preventDefault();
            $('.content-collapsible-utenti').slideDown('slow');
        });

        // Pulsate per eliminare un elemnto dalla lista:
        // lo rimuove da lista spesa e ridisesgna la lista
        $(contenitoreAlimenti).on('click', '.rmAlimento', function (e) {
            e.preventDefault();
            var inputVal = $(this).parent('div.alimento').find('.alimento.inpuntWithList').val();
            var id = getDatalistIdTwo($(datalistAlimenti), inputVal);
            $(this).parent('div.alimento').fadeOut('slow', function () {
                $(this).remove();
                listaSpesa.removeOggetto(id);
            }) 
        });

        $(selectSuperMer).change(function (e) {
            e.preventDefault();

            let validSuperSelected = validateSelectInput($(datalistSupermercati), $(this).val());
            let isPrimaSelezione = savedSelectedSuperMer==0;
            let isSelezionatoNow = getDatalistId($(datalistSupermercati), $(this).val())!=savedSelectedSuperMer;

            if(validSuperSelected){
                if(isSelezionatoNow){
                    if(isPrimaSelezione || window.confirm("Confermando cambierai il tipo di supermercato ma eliminerai tutti gli elementi della lista appena inseriti, continuare?")){
                            // è la prima selezione oppure l'utente ha confermato il cambiamento di supermercato
                            $(this).removeClass().addClass('alimento');
                            $(divAlimenti).removeClass().addClass('alimento actived');
                            recreateDataListAlimenti(listaAlimenti, { IDSupermercato : getDatalistId($(datalistSupermercati), $(this).val())})
                            savedSelectedSuperMer = getDatalistId($(datalistSupermercati), $(this).val());
                            $(contenitoreAlimenti).empty();
                            listaSpesa.svuota();
                            $('#divIngredienti').empty();
                            $('.content-collapsible-ricette').slideUp('fast');
                            $('.content-collapsible-utenti').slideUp('fast');
                    }else{
                        //l'utente non ha confermato il cambiamento di supermercato
                        $(this).attr('value', savedSelectedSuperMer);
                        $(this).val(getDatalistName($(datalistSupermercati), savedSelectedSuperMer));
                    }
                }else{
                    //l'utente per sbaglio a cancellato il supermercato e subito dopo ha inserito lo stesso
                    $(this).removeClass().addClass('alimento');
                    $(divAlimenti).removeClass().addClass('alimento actived');
                    savedSelectedSuperMer = getDatalistId($(datalistSupermercati), $(this).val());
                    }
                }else{
                //l'utente ha selezionato un supermercato non valido    
                $(this).removeClass().addClass('alimento invalid');
                $(divAlimenti).removeClass().addClass('alimenti blocked');
            }
        });

        $(btnAddAlimento).click(function (e) {
            var counter = 0;
            var html = '<div class="alimento"><input style="width: 200px;" class="alimento inputWithList" name="alimento_' + counter + '" list="allAlimenti"><input class="alimento" style="width: 60px;" list="listaQuantita" name="qtaAlimenti_' + counter + '"><button class="alimento rmAlimento" type="button"><i class="fa fa-remove rimuovi"></i></button></div>';
            e.preventDefault();
            $('div.lista.master').append(html);
            $('div.alimento:last-child').hide().fadeIn('slow');
        });

        $(btnAddRicetta).click(function(e){
            var idGruppo = savedSelectedGroup;
            var idSupermercato = savedSelectedSuperMer;
            recreateDataListRicette(idGruppo, idSupermercato);
            e.preventDefault();
            $('.content-collapsible-ricette').slideDown('slow');
        });

        $(selectRicetta).change(function (e) {
            var idRicetta = getDatalistId($('#allRicette'), $(this).val());
            recreateSetIngredienti({ IDRicetta : idRicetta})
        });

        $(confirmR).click(function (e) {
            e.preventDefault();
            $('.alimento.checkIngrediente').each(function () {
                if ($(this).is(':checked')) {
                    var id = $(this).attr('value');
                    var tempIgr = listaAlimenti.getOggetto(id);
                    listaSpesa.addOggetto(id, tempIgr);
                }
            });
            $('.content-collapsible-ricette').slideUp('fast');
        });

        //Apre un popup di conferma
        $('#buttonSubmit').click(function (e) {
            e.preventDefault();
            console.log('heila campione!');
            console.log(listaSpesa);
            $.confirm({
                title: 'Confirm!',
                icon: 'fa fa-shopping-cart',
                animation: 'bottom',
                columnClass: 'medium',
                closeAnimation: 'top',
                theme: 'modern',
                content: createHTMLForPopup(listaSpesa.getOggetti()),
                buttons: {
                    Conferma: {
                        btnClass: 'btn-green',
                        action: function () {
                            $.alert('Confirmed!');
                        }
                    },
                    Cancella: {
                        btnClass: 'btn-red',
                        action: function () {
                            $.alert('Cancellato!');
                        }
                    },
                }
            });
        })
});


