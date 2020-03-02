
//Inizializza gli eventi nella pagina @newLista

initNewLista = function() {
    $(document).ready(function () {
        var btnAddUtente = $('#addUtenteAssociato');
        var btnAddAlimento = $('#addAlimento');
        var contenitore = $('div.utenti.master');
        var contenitoreAlimenti = $('div.lista.master');

        //Quando il pulsante 'seleziona tutti' cambia stato cambiano di stato
        //anche le checkBox degli utenti definiti come 'Preferiti'
        $('#allPreferiti').change(
            function(){
                if ($(this).is(':checked')) {
                    $('.prefsChecks').prop('checked', true);
                }else{
                    $('.prefsChecks').prop('checked', false);
                }
        });

        //Quando viene premuto il pulsante OK all'interno del div collassabile
        //tutti gli utenti selezionati vengono aggiunti al form e vengono cancellati i precedenti
        $('#confirmUtenti').click(function (e) {
            var countUtenti = 1;
            $(contenitore).empty();
            $('input.prefsChecks').each(function () {
                if ($(this).is(':checked')) {
                    var nome = $(this).attr('value');
                    var id = $(this).attr('id');
                    var html = '<div class="utente"><input class="utente" type="hidden" readonly="readonly" name="utente_' + countUtenti + '" value="' + id + '" /><label class="utente">' + nome + '</label><button type="button" class="utente rmUtenteAssociato"><i class="fa fa-remove rimuovi"></i></button></div>';
                    e.preventDefault();
                    $(contenitore).append(html);
                    setInput();
                }
                countUtenti++;
            });
            $('input.genChecks').each(function () {
                if ($(this).is(':checked')) {
                    var nome = $(this).attr('value');
                    var id = $(this).attr('id');
                    var html = '<div class="utente"><input class="utente" type="hidden" readonly="readonly" name="utente_' + countUtenti + '" value="' + id + '" /><label class="utente">' + nome + '</label><button class="utente rmUtenteAssociato"><i class="fa fa-remove rimuovi"></i></button></div>';
                    e.preventDefault();
                    $(contenitore).append(html);
                    setInput();
                }
                countUtenti++;
            });
            $('div.utente').hide().show('fast');
            $('.content-collapsible-utenti').slideUp('fast');
        });

        //Quando viene premuto il pulsante cancella, presente in ogni div utente,
        //questo viene cancellato con una breve animazione, viene anche tolta la spunta della checkbox corrispondente
        $(contenitore).on('click', '.rmUtenteAssociato', function (e) {
            e.preventDefault();
            var id = $(this).parent('div.utente').find('input.utente').attr('value');
            $('.prefsChecks').each(function(){
                if($(this).attr('id') == id){
                    $(this).prop('checked', false);
                }
            });
            $('.genChecks').each(function(){
                if($(this).attr('id') == id){
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

        $(btnAddAlimento).click(function (e) {
            var counter = 0;
            var html = '<div class="alimento"><input style="width: 200px;" class="alimento" name="alimento_' + counter + '" list="allAlimenti"><input class="alimento" style="width: 60px;" list="listaQuantita" name="qtaAlimenti_' + counter + '"><button class="alimento rmAlimento" type="button"><i class="fa fa-remove rimuovi"></i></button></div>';
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

// Utile per fare il resize dei div utente, in base al contenuto
// Inoltre regola la grandezza della pagina
setInput = function(){
    $('input.utente').css("width", function () {
        return ($(this).val().length + 6)+ "ch";
    });
}

