var ricette = {};

function addRicetta(id, nome, descrizione, supermercato) {
    ricette[id] = {
        nome: nome,
        descrizione: descrizione,
        supermercato: supermercato,
        oggetti: {}
    }
    
    $('#ricette').append(
        $(`<div class="sezione attive">
            <div class="flex dropdown-control" data-target="#ricetta${id}">
                <i class="fas fa-caret-down"></i>
                <h2>${nome}</h2>
            </div>
            <div class="flex-vertical" id="ricetta${id}" data-ricetta="${id}" data-supermercato="${supermercato}">
                <p class="descrizione">${descrizione?descrizione:'...'}</p>
                <div class="aggiungi-oggetto">
                    <label>Aggiungi oggetto: </label>
                    <input list="supermercato${supermercato}">
                </div>
            </div>
        </div>`));
}

function addOggettoRicetta(idRicetta, idOggetto, nome, note) {
    if(ricette[idRicetta]) {
        ricette[idRicetta].oggetti[idOggetto] = {nome: nome, note: note};
        $('#ricetta'+idRicetta).append(
            $(`<div class="oggetto">
                    <p data-oggetto="${idOggetto}">${nome} (${note})</p>
                    <a class="delete-oggetto" onclick="deleteOggetto($(this))">🗑️</a>
                </div>`));
    } else
        console.error('Ricetta '+idRicetta+' not found');
}

function deleteOggetto(el) {
    let ricetta = el.parent().parent().data('ricetta');
    let oggetto = el.parent().find('p').data('oggetto');
    sendRequest('/delete/oggettoRicetta', {
        ricetta: ricetta,
        oggetto: oggetto
    }).then((res) => {
        delete ricette[ricetta][oggetto];
        el.parent().remove();
    }).catch((err) => { alert('EVVOVE'); console.log(err); });
}

jQuery(function() {

    sendRequest('/get/supermercati').then((res) => {
        for (const supermercato of res)
            sendRequest('/get/oggettiSupermercato', {
                IDSupermercato: supermercato.ID
            }).then((oggetti) => {
                let list = $(`<datalist id="supermercato${supermercato.ID}"></datalist>`);
                for (const oggetto of oggetti)
                    list.append($(`<option value="${oggetto.ID}">${oggetto.Nome} (${oggetto.Note})</option>`));
                $('body').append(list);
            }).catch((err) => { alert('EVVOVE'); console.log(err); });
    }).catch((err) => { alert('EVVOVE'); console.log(err); });

    /**********HANDLERS*********/

    function modificaDescrizione(p) {
        let input = $(`<input type="text" value="${p.text()}">`);
        let modifica = (el) => {
            sendRequest('/update/ricetta', {
                ID: el.parent().data('ricetta'),
                Descrizione: el.val()
            }).then((oggetti) => {
                let p = $(`<p class="descrizione">${el.val()}</p>`);
                p.on('click', function() { modificaDescrizione(p); });
                el.replaceWith(p);
            }).catch((err) => { alert('EVVOVE'); console.log(err); });
        };

        input.on('focusout', function(){ modifica($(this)); });
        input.on('keypress',function(e) { if(e.key == 'Enter') modifica($(this)); });

        p.replaceWith(input);
    }
    $('.descrizione').on('click', function() { modificaDescrizione($(this)); });
    
    $('.aggiungi-oggetto input').on('change', function() {
        let ricetta = $(this).parent().parent().data('ricetta');
        let supermercato = $(this).parent().parent().data('supermercato')
        let desc = $(`#supermercato${supermercato} option[value="${$(this).val()}"]`).text().match(/(.*) \((.*)\)$/);
        let oggetto = {
            id: $(this).val(),
            nome: desc[1],
            note: desc[2]
        };
        sendRequest('/insert/oggettoRicetta', {
            ricetta: ricetta,
            oggetto: oggetto.id,
            supermercato: supermercato
        }).then((res) => {
            addOggettoRicetta(ricetta, oggetto.id, oggetto.nome, oggetto.note);
            $(this).val('');
        }).catch((err) => { alert('EVVOVE'); console.log(err); });
    });

});

function sendRequest(url, data={}, method = "POST") {
    return new Promise((resolve, reject) => {
        $.ajax(url, {
            type: method,
            dataType: "json",
            data: data
        }).done((res) => {
            resolve(res);
        }).fail((err) => {
            reject(err);
        });
    });
}