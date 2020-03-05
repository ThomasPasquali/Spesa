import Oggetto from './classes/Oggetto.js';   

function validateSelectInput(datalist, input) {
    var obj = $(datalist).find('option').filter(function () {
        return $(this).text()==input;
    });
    return obj != null && obj.length > 0;   
};

function getDatalistId(datalist, search) {
    var obj = $(datalist).find('option').filter(function () {
        return $(this).text()==search;
    });
    return obj.attr('data-value');
};

function getDatalistIdTwo(datalist, search) {
    var obj = $(datalist).find('option').filter(function () {
        return $(this).text()==search;
    });
    return obj.attr('id');
};

function getDatalistName(datalist, search) {
    var obj = $(datalist).find('option').filter(function () {
        return $(this).attr('data-value')==search;
    });
    return obj.val();
};

 function recreateDataListAlimenti(listaAlimenti, dati) {
    $('#allAlimenti').empty();
    var pageUrl = '/get/';
    var request = 'oggettiSupermercato';
    pageUrl += request;
    $.ajax({
        url : pageUrl,
        method : 'POST',
        dataType : 'json',
        data : dati,
        success : function(data) {
            var options= [];
            $.each(data, function(id, oggetto) {
                var o = new Oggetto(oggetto.ID, oggetto.Nome, oggetto.Note, oggetto.Prezzo, 1);
                listaAlimenti.addOggetto(oggetto.ID, o);
                $('#allAlimenti').append( "<option id='" + oggetto.ID + "'>" + oggetto.Nome + "</option>" );
            });
          }
    });
}

function recreateDataListRicette(idGruppo, idSupermercato) {
    var pageUrl = '/get/';
    var request = 'ricetteGruppo';
    if(!idGruppo){
        $('#noUtenze').show();
    }else{
        $('#noUtenze').hide();
    }
    $('#allRicette').empty();
    pageUrl += request;
    $.ajax({
        url : pageUrl,
        method : 'POST',
        dataType : 'json',
        data : { IDGruppo : idGruppo, IDSupermercato : idSupermercato},
        success : function(data) {
            $.each(data, function(id, oggetto) {
                $('#allRicette').append( "<option data-value='" + oggetto.ID + "'>" + oggetto.Nome + " (" + oggetto.Descrizione + ")</option>" );
            });
          }
    });
}

 function recreateSetIngredienti(dati) {
    $('#divIngredienti').empty();
    var pageUrl = '/get/';
    var request = 'ricettaByID';
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
                $('#divIngredienti').append( '<span class="utente"><input class="alimento checkIngrediente" type="checkbox" checked readonly="readonly" name="utente_' + counter + '" value="' + oggetto.ID + '" /><label class="utente">' + oggetto.Nome + '</label></span>' );
            });
          }
    });
}

function createHTMLForPopup(arrayOggetti) {
    var html = "<div class='rigaScontrino'><p class='alignleft scontrino'>DESCRIZIONE</p><p class='alignright scontrino'>Prezzo(€)</p></div></div>";
    $.each(arrayOggetti, function (id, oggetto) {
        var prezzoTot = oggetto.qta * oggetto.prezzo;
        var nome = oggetto.nome;
        var html_temp = `<div class="rigaScontrino"><p style='text-decoration: black;' class='alignleft'>${nome.toUpperCase()}</p><p class='alignright'>${prezzoTot}</p></div></div>`;
        html += html_temp;
    });
    html += ''
    console.log(arrayOggetti);
    console.log(html);
    return html;
    
}

export {validateSelectInput, getDatalistId, getDatalistIdTwo, getDatalistName, recreateSetIngredienti, recreateDataListRicette, recreateDataListAlimenti, createHTMLForPopup};