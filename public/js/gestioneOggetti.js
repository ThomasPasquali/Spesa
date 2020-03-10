import {sendRequest} from './misc.js';

$(document).ready(async function() {

    var table = new Tabulator('#table', {
        layout: 'fitColumns',
        movableRows: true,
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
            {title: 'Nome', field: 'Nome', editor: 'input'},
            {title: 'Note', field: 'Note', editor: 'input'},
            {title: 'Prezzo', field: 'Prezzo', editor: 'number', editorParams: {min: 0.05, max: 999.99, step: 0.05}},
        ],
        cellEdited: (cell) => {
            sendRequest('/update/oggetto', cell._cell.row.data);
        },
        ajaxURL: 'get/oggetti',
        ajaxConfig: 'POST',
        tabEndNewRow: true
    });

    sendRequest('/get/supermercati', null).then((supermercati) => {
        for (const supermercato of supermercati)
            $('#newOggetto select').append($(`<option value="${supermercato.ID}">${supermercato.Descrizione}</option>`));
    });

    $('body').on('click', '#newOggetto input[type="submit"]', (e) => {
        e.preventDefault();
        let form = $('#newOggetto');
        sendRequest('/insert/oggetto', form.serialize()).then((res) => {
            table.addData(res[0]);
            form.trigger('reset');
        });
    });

});