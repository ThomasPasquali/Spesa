function sendRequest(url, data, method="POST") {
    return new Promise((resolve, reject) => {
        $.ajax(url, {
            type: method,
            dataType: "json",
            data: data
        }).done((res) =>{
            resolve(res);
        }).fail((err) => {
            reject(err);
        });
    });
}

function getIDfromDatalist(datalist, search) {
    return $(datalist).find('option').filter(function () {
        return $(this).text()==search;
    }).data('value');
}

$(document).ready(() => {

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
});

function requestUsers(id){
    $.ajax({
        url : '/get/utentiDiUnGruppo',
        data : {
            IDGruppo : id
        },
        method : 'POST',
        dataType: 'json',
        success : function (data) {
            var groups= new Set();
            $.each(data, function(id, utente) {
                groups.add(utente.IDGruppo);
                var html = '<div class="utente"><button type="button" class="utente rmUtenteAssociato"><i class="fa fa-remove rimuovi"></i></button><input class="utente" type="hidden" readonly="readonly" name="utente" value="' + utente.Nome + 
                                        '" /><label class="utente">' + utente.Nome + '</label></div>'
                $('#utenti_' + utente.IDGruppo).append(html);
            });
            var btnDownHTML = '<button type="button"><i class="fa fa-angle-down"></i></button>';
            var newUpHTML = '<button type="button"><i class="fa fa-angle-up"></i></button>';
            groups.forEach(function (IDGruppo) {
                $('#button_' + IDGruppo).empty().append(btnDownHTML);
                $('#button_' + IDGruppo).click(function () {
                    $('#utenti_' + IDGruppo).toggle('slow');
                    changeClass('#button_' + IDGruppo, btnDownHTML, newUpHTML);
                })
            })
        }
    });
}

function changeClass(button, class1, class2){
    if($(button).find('i').attr('class')=='fa fa-angle-up'){
        $(button).empty().append(class1);
    }else{
        $(button).empty().append(class2);
    }
}

function createHTMLScontrino(nomeGruppo, supers, idSuper, nomeLista, listaSpesa, timestampCreazione=null) {
    var supermercato;
    $.each(supers, function (index, superm) {
        if(superm.ID==idSuper){
            supermercato = superm;
        }
    });
    var gruppo = beautifyUndefined(nomeGruppo);
    var timestamp = setTimetampScontrino(timestampCreazione);
    var piva = beautifyUndefined(randomPIVAScontrino());
    var nomeL = beautifyUndefined(nomeLista);
    supermercato = setAttrSupermercatoScontrino(supermercato);
    var html = `<div class='scontrino'><table><row class='scontrino'><p class='scontrinoXXLarge'>${supermercato.Nome}</p></row>`;
    html += `<row class='scontrino'><p class='scontrinoXLarge'>${supermercato.Localita}</p></row>`;
    html += `<row class='scontrino'><p class='scontrinoLarge'>${supermercato.Citta}</p></row>`;
    html += `<row class='scontrino'><p class='scontrinoLarge'>P.IVA ${piva}</p></row>`;
    html += `<row class='scontrino'><p class='scontrinoLarge'>Lista ${nomeL}</p></row>`;
    html += rigaVuota();
    html += "<row class='scontrino'><p class='alignleft scontrinoLarge'>DESCRIZIONE</p><p class='alignright scontrinoLarge'>Prezzo(€)</p></div></div></row>";
    var sommaCalcolata = 0;
    $.each(listaSpesa.getOggetti(), function (id, oggetto) {
        var prezzoTot = oggetto.qta * oggetto.prezzo;
        prezzoTot = Math.round(prezzoTot * 100) / 100;
        sommaCalcolata += prezzoTot;
        var nomeOggetto = oggetto.nome + ' (' + oggetto.note + ')';
        html += `<row><p class='alignleft scontrinoMedium'>${oggetto.qta} X ${nomeOggetto.toUpperCase()}</p><p class='alignright scontrinoMedium'>${prezzoTot}</p></row>`;
    });
    sommaCalcolata = Math.round(sommaCalcolata * 100) / 100;
    html += "<row class='scontrino'><p class='alignleft scontrinoMedium'>-----------</p><p class='alignright scontrinoLarge'>--------</p></row>";
    html += `<row class='scontrino'><p class='alignleft scontrinoXLarge'>TOTALE</p><p class='alignright scontrinoXLarge'>${sommaCalcolata}</p></row>`;
    html += rigaVuota();
    html += `<row class='scontrino'><p class='scontrinoLarge'>${timestamp}</p></row>`;
    html += rigaVuota();
    html += `<row class='scontrino'><p class='scontrinoLarge'>Gruppo ${gruppo}</p></row>`;
    html += `<row class='scontrino'><p class='scontrinoLarge'>DOCUMENTO NON COMMERCIALE</p></row>`;
    html += rigaVuota();
    return html;
}

function setTimetampScontrino(timestamp) {
    if(!timestamp){
        var date = new Date();
        var timestamp = date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear() + '  ' +
                        date.getHours() + ':' + date.getMinutes();
    }
    return timestamp;
}

function rigaVuota() {
    return '<row class="scontrino"><p class="scontrinoLarge"><br></p></row>';
}

function beautifyUndefined(string) {
    var g = string;
    if(!g){
        g = '-';
    }
    return g;
}

function setAttrSupermercatoScontrino(s) {
    if(!s){
        s = {
            Nome:'-',
            Localita:'',
            Citta:''
        }
    }
    return s;
}

function randomPIVAScontrino() {
    var piva = '';
    var step;
    for (step = 0; step < 11; step++) {
        piva += Math.floor(Math.random() * 10)
    }
    return piva;
}

export {getIDfromDatalist, createHTMLScontrino, sendRequest, requestUsers};