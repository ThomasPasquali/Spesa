
//Inizializza gli eventi nella pagina @newLista

class Ingrediente{

    constructor(nome, note, prezzo, qta){
        this.nome = nome;
        this.note = note;
        this.prezzo = prezzo;
        this.qta = qta;
    }
}

class ListaPower{

    constructor(){
        this.array = [];
    }

    put(key, object){
        if(key in this.array){
            this.array[key].qta += object.qta;
        }else{
            this.array[key] = object;
        }
    }

    remove(key){
        delete this.array[key];
    }

    interable(){
        this.array.entries();
    }
}


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
        var inputAlimenti = $('#inpuntWithList');
        var contenitoreAlimenti = $('div.lista.master');
        var btnAddRicetta = $('#addRicetta');
        var selectRicetta = $('#selectR');
        var confirmR = $('#confirmRicette');
        var ingredientiSelezionati= $('#confirmRicette');

        var savedSelectedSuperMer = 0;
        var savedSelectedGroup = 0;

        let listaSpesa = new ListaPower();

        $('body').on('change', '.alimento.inputWithList', function (e) {
            let valid = validateSelectInput($(datalistAlimenti), $(this).val());
            if(valid){
                $(this).removeClass().addClass('alimento');
                $(divAlimenti).removeClass().addClass('alimenti actived');
                listaSpesa.put(getDatalistIdTwo($(datalistAlimenti), $(this).val()), $(this).val());
                console.log(listaSpesa);
            }else{
                $(this).removeClass().addClass('alimento invalid');
                $(divAlimenti).removeClass().addClass('alimenti blocked');
            }
        });

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
                    savedSelectedGroup = id;
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
                            recreateDataListAlimenti('/get/', 'oggettiSupermercato', { IDSupermercato : getDatalistId($(datalistSupermercati), $(this).val())})
                            savedSelectedSuperMer = getDatalistId($(datalistSupermercati), $(this).val());
                            $(contenitoreAlimenti).empty();
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
            $(contenitoreAlimenti).append(html);
            $('div.alimento:last-child').hide().fadeIn('slow');
        });

        $(btnAddRicetta).click(function(e){
            idGruppo = savedSelectedGroup;
            idSupermercato = savedSelectedSuperMer;
            recreateDataListRicette('/get/', 'ricetteGruppo', { IDGruppo : idGruppo, IDSupermercato : idSupermercato});
            e.preventDefault();
            $('.content-collapsible-ricette').slideDown('slow');
        });

        $(selectRicetta).change(function (e) {
            var idRicetta = getDatalistId($('#allRicette'), $(this).val());
            recreateSetIngredienti('/get/', 'ricettaByID', { IDRicetta : idRicetta})
        });

        $(confirmR).click(function (e) {
            e.preventDefault();
            $(contenitoreAlimenti).empty();
            $(radioUtenti).each(function () {
                if ($(this).is(':checked')) {
                    var nome = $(this).attr('id');
                    var id = $(this).attr('value');
                    var html = '<div class="alimento"><input style="width: 200px;" class="alimento inpuntWithList" value='+ value +' name="alimento_' + counter + '" list="allAlimenti"><input class="alimento" style="width: 60px;" list="listaQuantita" name="qtaAlimenti_' + counter + '"><button class="alimento rmAlimento" type="button"><i class="fa fa-remove rimuovi"></i></button></div>';
                    e.preventDefault();
                    savedSelectedGroup = id;
                    $(contenitoreAlimenti).append(html);
                }
            });
            $('.content-collapsible-ricette').slideUp('fast');
        });

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

getDatalistIdTwo = function (datalist, search) {
    var obj = $(datalist).find('option').filter(function () {
        return $(this).text()==search;
    });
    return obj.attr('id');
}

getDatalistName = function (datalist, search) {
    var obj = $(datalist).find('option').filter(function () {
        return $(this).attr('data-value')==search;
    });
    return obj.val();
}

recreateLista = function (lista) {
    $.each(lista.iterable, function (id , alimento) { 
        html = '<div class="alimento"><input style="width: 200px;" class="alimento inpuntWithList" value='+ id +' name="alimento_' + counter + '" list="allAlimenti"><input class="alimento" style="width: 60px;" list="listaQuantita" name="qtaAlimenti_' + counter + '"><button class="alimento rmAlimento" type="button"><i class="fa fa-remove rimuovi"></i></button></div>';
        $(contenitoreAlimenti).append(html);
    });
}

recreateDataListAlimenti = function (pageUrl, request, dati) {
    $('#allAlimenti').empty();
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

recreateDataListRicette = function (pageUrl, request, dati) {
    $('#allRicette').empty();
    pageUrl += request;
    $.ajax({
        url : pageUrl,
        method : 'POST',
        dataType : 'json',
        data : dati,
        success : function(data) {
            $.each(data, function(id, oggetto) {
                $('#allRicette').append( "<option data-value='" + oggetto.ID + "'>" + oggetto.Nome + " (" + oggetto.Descrizione + ")</option>" );
            });
          }
    });
}

recreateSetIngredienti = function (pageUrl, request, dati) {
    $('#divIngredienti').empty();
    pageUrl += request;
    $.ajax({
        url : pageUrl,
        method : 'POST',
        dataType : 'json',
        data : dati,
        success : function(data) {
            var counter = 0;
            $.each(data, function(id, oggetto) {
                counter++;
                $('#divIngredienti').append( '<span class="utente"><input class="checkIngrediente" type="checkbox" readonly="readonly" name="utente_' + counter + '" value="' + oggetto.ID + '" /><label class="utente">' + oggetto.Nome + '</label></span>' );
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

