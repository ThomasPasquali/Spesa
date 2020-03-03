$(document).ready(function() {

    var oggetti = null;
    var divOggettiDaAcquistare = $('#oggetti-da-acquistare');
    var divOggettiAcquistati = $('#oggetti-acquistati');

    $.ajax('/get/oggettiLista', {
        type: "POST",
        dataType: "json",
        data: {IDLista: $('input[type="hidden"][name="listaID"]').val()},
        success: function (res) {
            oggetti = res;
            divOggettiDaAcquistare.empty();
            divOggettiAcquistati.empty();
            for (const oggetto of oggetti) {
                let checkbox = $(`<input type="checkbox" name="oggetto_${oggetto.ID}" value="${oggetto.ID}">`);
                let label = $(`<label>${oggetto.Nome} (${oggetto.Note})</label>`);
                let container = (oggetto.Acquirente?divOggettiAcquistati:divOggettiDaAcquistare);
                container.append(checkbox, label);
            }
        }
    });
    
});