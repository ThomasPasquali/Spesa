import Oggetto from './classes/Oggetto.js';

function validateSelectInput(datalist, input) {
    var obj = $(datalist).find('option').filter(function() {
        return $(this).text() == input;
    });
    return obj != null && obj.length > 0;
};

function getDatalistId(datalist, search) {
    var obj = $(datalist).find('option').filter(function() {
        return $(this).text() == search;
    });
    return obj.attr('data-value');
};

function getDatalistIdTwo(datalist, search) {
    var obj = $(datalist).find('option').filter(function() {
        return $(this).text() == search;
    });
    return obj.attr('id');
};

function getDatalistIdThree(datalist, search) {
    var obj = $(datalist).find('option').filter(function() {
        return $(this).text() == search;
    });
    return obj.attr('value');
};

function getDatalistName(datalist, search) {
    var obj = $(datalist).find('option').filter(function() {
        return $(this).attr('data-value') == search;
    });
    return obj.val();
};

function recreateDataListAlimenti(listaAlimenti, dati) {
    $('#allAlimenti').empty();
    var pageUrl = '/get/';
    var request = 'oggettiSupermercato';
    pageUrl += request;
    $.ajax({
        url: pageUrl,
        method: 'POST',
        dataType: 'json',
        data: dati,
        success: function(data) {
            var options = [];
            $.each(data, function(id, oggetto) {
                var o = new Oggetto(oggetto.ID, oggetto.Nome, oggetto.Note, oggetto.Prezzo, 1);
                listaAlimenti.addOggetto(oggetto.ID, o);
                $('#allAlimenti').append("<option data-value='" + oggetto.ID + "'>" + oggetto.Nome + "</option>");
            });
        }
    });
}

function recreateDataListRicette(idGruppo, idSupermercato) {
    var pageUrl = '/get/';
    var request = 'ricetteGruppo';
    if (!idGruppo) {
        $('#noUtenze').show();
    } else {
        $('#noUtenze').hide();
    }
    $('#allRicette').empty();
    pageUrl += request;
    $.ajax({
        url: pageUrl,
        method: 'POST',
        dataType: 'json',
        data: { IDGruppo: idGruppo, IDSupermercato: idSupermercato },
        success: function(data) {
            $.each(data, function(id, oggetto) {
                $('#allRicette').append("<option data-value='" + oggetto.ID + "'>" + oggetto.Nome + " (" + oggetto.Descrizione + ")</option>");
            });
        }
    });
}

function is_int(n) {
    if (!is_numeric(n)) return false
    else return (n % 1 == 0);
}

function is_numeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function recreateSetIngredienti(dati) {
    $('#divIngredienti').empty();
    var pageUrl = '/get/';
    var request = 'ricettaByID';
    pageUrl += request;
    $.ajax({
        url: pageUrl,
        method: 'POST',
        dataType: 'json',
        data: dati,
        success: function(data) {
            var counter = 0;
            $.each(data, function(id, oggetto) {
                counter++;
                $('#divIngredienti').append('<span class="utente"><input class="alimento checkIngrediente" type="checkbox" checked readonly="readonly" name="utente_' + counter + '" value="' + oggetto.ID + '" /><label class="utente n1">' + oggetto.Nome + '</label></span>');
            });
        }
    });
}

function isInputEmpty(inputSelector) {
    let contenuto = $(inputSelector).val();
    return contenuto == "";
}

function submitForm(idSuper, idGruppo, nomeLista, dimLista, form, listaSpesa, listaSuper) {
    var htmlContent = $('<div></div>');
    var lista = $('<ul></ul>');

    var errMesgNoSuper = "Non è stato selezionato nessun supermercato";
    var errMesgNoGruppo = "Non è stato associato nessun gruppo alla lista";
    var errMesgemptyList = "Non è possibile creare una lista vuota";
    var errMesgemptyNameList = "Non è possibile creare una lista senza un nome valido";

    if (nomeLista == "") {
        $(lista).append($('<li></li>').append(errMesgemptyNameList));
    }
    if (idSuper == 0) {
        $(lista).append($('<li></li>').append(errMesgNoSuper));
    }
    if (!idGruppo) {
        $(lista).append($('<li></li>').append(errMesgNoGruppo));
    }
    if (dimLista) {
        $(lista).append($('<li></li>').append(errMesgemptyList));
    }
    $(htmlContent).append($(lista));

    if (!idSuper == 0 && idGruppo && !dimLista && !nomeLista == "") {
        $.ajax({
            url: '/insert/nuovaLista',
            method: 'POST',
            dataType: 'json',
            data: {
                nomeLista: String(nomeLista),
                groupLinked: String(idGruppo),
                supermercato: String(idSuper),
                richiedi_prezzi: String(listaSpesa.richiediPrezzi ? 1 : 0)
            },
            error: function(e) {
                console.log(e);
            },
            success: function(res) {
                $.each(listaSpesa.getOggetti(), function(id, oggetto) {
                    $.ajax({
                        url: '/insert/oggettoInNuovaLista',
                        method: 'POST',
                        dataType: 'json',
                        data: {
                            IDLista: res.insertId,
                            IDOggetto: oggetto.id,
                            IDSupermercato: idSuper,
                            qta: oggetto.qta
                        },
                    });
                });
            }
        });
    } else {
        $.confirm({
            icon: 'fa fa-exclamation-triangle',
            title: 'C\'è ancora qualcosa da sistemare...',
            content: htmlContent,
            theme: 'modern',
            type: 'red',
            columnClass: 'medium',
            typeAnimated: true,
            buttons: {
                tryAgain: {
                    text: 'Sistemo subito!',
                    btnClass: 'btn-red',
                }
            }
        });
    }
}


function sendFormString(formString) {
    $.ajax({
        url: '/insert/nuovaLista',
        method: 'POST',
        dataType: 'json',
        data: formString,
        success: function(data) {
            if (data.errno) {
                console.log(data.sqlMessage);
                $.confirm({
                    icon: 'fa fa-frown',
                    title: 'Qualcosa è andato storto',
                    content: data.code,
                    theme: 'modern',
                    type: 'red',
                    columnClass: 'small',
                    typeAnimated: true,
                    buttons: {
                        tryAgain: {
                            text: 'Torna indietro',
                            btnClass: 'btn-red'
                        }
                    }
                })
            } else {
                $.confirm({
                    icon: 'fa fa-check',
                    title: '',
                    content: 'Lista creata con successso!',
                    theme: 'modern',
                    type: 'green',
                    columnClass: 'small',
                    typeAnimated: true,
                    buttons: {
                        tryAgain: {
                            text: 'Torna alla home',
                            btnClass: 'btn-green',
                            action: function() {
                                window.location.href = '\\';
                            }
                        }
                    }
                })
            }
        }
    })
}


function replaceWithId(string, listaSpesa, datalistSuper) {
    var s = string;
    $.each(listaSpesa.getOggetti(), function(id, oggetto) {
        var nome = oggetto.nome;
        nome = nome.replace(' ', '%20');
        s = s.replace(nome, id);
    })
    $(datalistSuper).children('option').each(function() {
        var nome = $(this).val();
        nome = nome.replace(' ', '%20');
        s = s.replace(nome, $(this).attr('data-value'));
    })
    return s;
}

export { validateSelectInput, getDatalistId, getDatalistIdTwo, getDatalistName, recreateSetIngredienti, recreateDataListRicette, recreateDataListAlimenti, is_int, submitForm }