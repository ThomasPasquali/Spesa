import {sendRequest} from './misc.js';
import {getIDfromDatalist, replaceAll} from './misc.js';

$(document).ready(async function() {

    var table = new Tabulator('#table', {
        layout: 'fitColumns',
        movableRows: false,
        groupBy: 'SupermercatoID',
        headerSort: false,
        groupStartOpen: false,
        groupToggleElement: 'header',
        groupHeader: (val, count, data, group) => {
            return data[0].Supermercato;
        },
        columns: [
            {field: 'SupermercatoID', visible: false},
            {field: 'ID', visible: false},
            {field: 'Supermercato', visible: false},
            {title: 'Nome', field: 'Nome', editor: 'input', widthGrow:5},
            {title: 'Note', field: 'Note', editor: 'input', minWidth: '80px'},
            {title: 'Prezzo €', field: 'Prezzo', editor: 'number', editorParams: {min: 0.05, max: 999.99, step: 0.05}, minWidth: '80px'},
            {title: 'Elimina', field: 'Elimina', cellClick:function(e, cell) {
                sendRequest('/delete/oggetto', {'ID':cell.getRow().getCell("ID").getValue()});
                cell.getRow().delete();
            }},
        ],
        ajaxResponse:function(url, params, data){
            for (const row of data) row.Elimina = "🗑️";
            return data;
        },
        cellEdited: (cell) => {
            sendRequest('/update/oggetto', cell._cell.row.data);
        },
        ajaxURL: 'get/oggetti',
        ajaxConfig: 'POST',
        tabEndNewRow: true,
        addRowPos: "top"
    });

    sendRequest('/get/supermercati', null).then((supermercati) => {
        $('#newOggetto').append($("<datalist id='allSupermercati'>"));
        for (const supermercato of supermercati)
            $('#allSupermercati').append($(`<option data-value="${supermercato.ID}">${supermercato.Descrizione}</option>`));
    });

    $('body').on('click', '#newOggetto input[type="submit"]', (e) => {
        e.preventDefault();
        let form = $('#newOggetto');
        let superm = form.serialize().split("=")[1].split("&")[0];
        let parsed = replaceAll(superm,"%20"," ");
        let id = getIDfromDatalist($('#allSupermercati'),parsed);
        let s = form.serialize().replace(superm,id);
        sendRequest('/insert/oggetto', s).then((res) => {
            res[0].Elimina = "🗑️";
            table.addData(res[0]);
            form.trigger('reset');
        });
    });

});