$(document).ready(function() {

    var oggetti = null;
    var divOggettiDaAcquistare = $('#oggetti-da-acquistare');
    var divOggettiAcquistati = $('#oggetti-acquistati');
    var chiediPrezzo = async function() {
        return $.confirm({
            title: 'Inserire il prezzo del prodotto',
            content: '<input type="number" min="1" placeholder="Prezzo..." required>',
            buttons: {
                formSubmit: {
                    text: 'Conferma',
                    btnClass: 'btn-blue',
                    action: function () {
                        var prezzo = this.$content.find('input').val();
                        if(!prezzo){
                            $.alert('Inserire un prezzo valido');
                            return false;
                        }else
                            return prezzo;
                    }
                },
                cancel: function () {
                    return null;
                },
            }
        });
    }

    /**
     * Refresh oggetti lista
     */
    $.ajax('/get/oggettiLista', {
        type: "POST",
        dataType: "json",
        data: {IDLista: $('input[type="hidden"][name="listaID"]').val()},
        success: function (res) {
            oggetti = res;
            divOggettiDaAcquistare.empty();
            divOggettiAcquistati.empty();
            for (const oggetto of oggetti) {
                let ID = oggetto.ID;
                let lista = $('input[type="hidden"][name="listaID"]').val();
                let comprato = oggetto.Acquirente!=null;
                let checkbox = $(`<input id="oggetto_${ID}" class="oggetto" type="checkbox" name="oggetto_${ID}" value="${ID}"" ${(comprato?'checked':'')}>`);
                let label = $(`<label for="oggetto_${ID}">${oggetto.Nome} (${oggetto.Note})</label>`);
                let container = (comprato?divOggettiAcquistati:divOggettiDaAcquistare);
                container.append($('<div></div>').append(checkbox, label));
            }
        }
    });

    /**************EVENT HANDLERS*************/
    /**
     * Collapsibles
     */
    $('body').on('click', '.dropdown-control', function() {
        let target = $($(this).data('target'));
        if(target.is(':visible')) {
            target.removeClass().addClass('hidden');
            $(this).children('i').removeClass().addClass('fas fa-caret-up')
        }else {
            target.removeClass().addClass('flex-vertical');
            $(this).children('i').removeClass().addClass('fas fa-caret-down')
        }
    });

    $('body').on('change', '#oggetti-da-acquistare .oggetto', async function() {
        let element = $(this);
        //FIXME utente da sessione
        let utente = 'Berga';
        console.log(chiediPrezzo);
        let prezzo = await chiediPrezzo();
        //var prezzo = ;
        //if($('input[type="hidden"][name="richiedi_prezzi"]').val())
            //prezzo = 
        console.log('avanti');
        let oggetto = element.val();
        let lista = $('input[type="hidden"][name="listaID"]').val();
        $.ajax('/update/acquistaOggetto', {
            type: "POST",
            dataType: "json",
            data: {IDOggetto:oggetto,IDLista:lista,IDUtente:utente,prezoAcquisto:prezzo},
            success: function(res) {
                if(res){
                    alert('EVVOVE POVCA CAVOTA')
                    console.log(res);
                }else
                    element.parent().prependTo($('#oggetti-acquistati'));
            }
        });
    });

    $('body').on('change', '#oggetti-acquistati .oggetto', function() {
        let element = $(this);
        //FIXME utente da sessione
        let utente = 'Berga';
        let oggetto = element.val();
        let lista = $('input[type="hidden"][name="listaID"]').val();
        $.ajax('/update/annullaAcquistaOggetto', {
            type: "POST",
            dataType: "json",
            data: {IDOggetto:oggetto,IDLista:lista},
            success: function(res) {
                if(res){
                    alert('EVVOVE POVCA CAVOTA')
                    console.log(res);
                }else
                    element.parent().prependTo($('#oggetti-da-acquistare'));
            }
        });
    });

});

