
//Inizializza gli eventi nella pagina @newLista

initNewLista = function() {
    $(document).ready(function () {
        var btnAddUtente = $('#addUtenteAssociato');
        var btnAddAlimento = $('#addAlimento');
        var radioUtenti = $('input.radioUtenti');
        var selectSuperMer = $('#selectS');
        var contenitore = $('div.utenti.master');
        var divAlimenti = $('#divAlimenti');
        var datalistSupermercati= $('#allSupermercati');
        var datalistAlimenti = $('#allAlimenti');
        var inputAlimenti = $('.inpuntWithList');

        var contenitoreAlimenti = $('div.lista.master');

        //Quando viene premuto il pulsante OK all'interno del div collassabile
        //tutti gli utenti selezionati vengono aggiunti al form e vengono cancellati i precedenti
        $('#confirmUtenti').click(function (e) {
            $(contenitore).empty();
            $(radioUtenti).each(function () {
                if ($(this).is(':checked')) {
                    var nome = $(this).attr('id');
                    var id = $(this).attr('value');
                    var html = '<div class="utente"><input class="utente" type="hidden" readonly="readonly" name="utente" value="' + id + '" /><label class="utente">' + nome + '</label><button type="button" class="utente rmUtenteAssociato"><i class="fa fa-remove rimuovi"></i></button></div>';
                    e.preventDefault();
                    $(contenitore).append(html);
                }
            });
            $('div.utente').hide().show('fast');
            $('.content-collapsible-utenti').slideUp('fast');
        });

        //Quando viene premuto il pulsante cancella, presente in ogni div utente,
        //questo viene cancellato con una breve animazione, viene anche tolta la spunta della checkbox corrispondente
        $(contenitore).on('click', '.rmUtenteAssociato', function (e) {
            e.preventDefault();
            var id = $(this).parent('div.utente').find('input.utente').attr('value');
            $(radioUtenti).each(function(){
                if($(this).attr('value') == id){
                    $(this).prop('checked', false);
                }
            });
            $(this).parent('div.utente').fadeOut('slow', function () {
                $(this).remove();
            });
        });

        $(btnAddUtente).click(function (e){
            e.preventDefault();
            $('.content-collapsible-utenti').slideDown('slow');
        });

        $(contenitoreAlimenti).on('click', '.rmAlimento', function (e) {
            $(this).parent('div.alimento').fadeOut('slow', function () {
                $(this).remove();
            })
        })

        $(inputAlimenti).change(function (e) {
            e.preventDefault();
            let valid = validateSelectInput($(datalistAlimenti), $(this).val());
            if(valid){
                $(this).removeClass().addClass('alimento');
                $(divAlimenti).removeClass().addClass('alimenti actived');
            }else{
                $(this).removeClass().addClass('alimento invalid');
                $(divAlimenti).removeClass().addClass('alimenti blocked');
            }
        })

        $(selectSuperMer).change(function (e) {
            e.preventDefault();
            let valid = validateSelectInput($(datalistSupermercati), $(this).val());
            if(valid){
                /*jconfirm({
                    title: 'Confirm!',
                    content: 'Simple confirm!',
                    buttons: {
                        confirm: function () {
                            $.alert('Confirmed!');
                        },
                        cancel: function () {
                            $.alert('Canceled!');
                        },
                        somethingElse: {
                            text: 'Something else',
                            btnClass: 'btn-blue',
                            keys: ['enter', 'shift'],
                            action: function(){
                                $.alert('Something else?');
                            }
                        }
                    }
                });*/
                $(this).removeClass().addClass('alimento');
                $(divAlimenti).removeClass().addClass('alimento actived');
                recreateDataList('/get/', $(datalistAlimenti), 'oggettiSupermercato', { IDSupermercato : getDatalistId($(datalistSupermercati), $(this).val())})
            }else{
                $(this).removeClass().addClass('alimento invalid');
                $(divAlimenti).removeClass().addClass('alimenti blocked');
            }
        });

        $(btnAddAlimento).click(function (e) {
            var counter = 0;
            var html = '<div class="alimento"><input style="width: 200px;" class="alimento inpuntWithList" name="alimento_' + counter + '" list="allAlimenti"><input class="alimento" style="width: 60px;" list="listaQuantita" name="qtaAlimenti_' + counter + '"><button class="alimento rmAlimento" type="button"><i class="fa fa-remove rimuovi"></i></button></div>';
            e.preventDefault();
            $(contenitoreAlimenti).append(html);
            $('div.alimento:last-child').hide().fadeIn('slow');
        })

        /* $(btnAdd).click(function (e) {
        });*/
    })
}

setAlimenti = function(alimentiT){
    alimenti = alimentiT;
}

validateSelectInput = function (datalist, input) {
    var obj = $(datalist).find('option').filter(function () {
        return $(this).text()==input;
    });
        return obj != null && obj.length > 0;   
}

getDatalistId = function (datalist, search) {
    var obj = $(datalist).find('option').filter(function () {
        return $(this).text()==search;
    });
    return obj.attr('data-value');
}

recreateDataList = function (pageUrl, dataList, request, dati) {
    $(dataList).empty();
    pageUrl += request;
    $.ajax({
        url : pageUrl,
        method : 'POST',
        dataType : 'json',
        data : dati,
        success : function(data) {
            var options= [];
            $.each(data, function(id, oggetto) {
                $('#allAlimenti').append( "<option id='" + oggetto.ID + "'>" + oggetto.Nome + " (" + oggetto.Note + ")</option>" );
            });
          }
    });
}

// Utile per fare il resize dei div utente, in base al contenuto
// Inoltre regola la grandezza della pagina
setInput = function(){
    $('input.utente').css("width", function () {
        return ($(this).val().length + 6)+ "ch";
    });
}

