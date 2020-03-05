import Oggetto from './Oggetto.js';
import Lista from './Lista.js';

export default class ListaSpesa extends Lista{

    /**
     * @param {int} id 
     * @param {boolean} aperta 
     * @param {boolean} richiediPrezzi 
     * @param {object} divOggettiAcquistati 
     * @param {object} divOggettiDaAcquistare 
     * @param {object} bottoneChiusura 
     */
    constructor(id, aperta, richiediPrezzi = null, divOggettiAcquistati, divOggettiDaAcquistare, bottoneChiusura) {
        super(id, richiediPrezzi);
        if(!aperta) this.bloccaPagina();
        this.aperta = aperta;
        this.divOggettiAcquistati = divOggettiAcquistati;
        this.divOggettiDaAcquistare = divOggettiDaAcquistare;
        this.bottoneChiusura = bottoneChiusura;
    }

    addOggetto(oggetto) {
        super.addOggetto(oggetto);

        let checkbox = $(`<input class="oggetto" type="checkbox">`);
        checkbox.attr('id', `oggetto_${oggetto.id}`)
        checkbox.prop('checked', oggetto.acquistato);
        checkbox.val(oggetto.id);
        checkbox.data('prezzo', oggetto.prezzo);
        checkbox.data('qta', oggetto.qta);

        let label = $(`<label for="oggetto_${oggetto.id}"> ()</label>`);
        label.text(`${oggetto.nome}${(oggetto.note?' ('+oggetto.note+')':'')} ${oggetto.qta}Pz.`);

        oggetto.element= $('<div></div>').append(checkbox, label);
        (oggetto.acquistato?this.divOggettiAcquistati:this.divOggettiDaAcquistare).append(oggetto.element);
    }

    acquistaOggetto(id, utente, prezzo) {
        var o = super.getOggetto(id);
        if(o)
            $.ajax('/update/acquistaOggetto', {
                type: "POST",
                dataType: "json",
                data: {IDOggetto:o.id,IDLista:super.getID(),IDUtente:utente,prezoAcquisto:prezzo},
                success: function(res) {
                    if(res) {
                        alert('EVVOVE POVCA CAVOTA')
                        console.log(res);
                    }else
                        o.acquistato = true;
                }
            });
    }
    
    moveToAcquistati(id) {
        var o = super.getOggetto(id);
        o.acquistato = true;
        if(o) {
            o.element.find('input[type="checkbox"]').prop('checked', true);
            o.element.prependTo(this.divOggettiAcquistati);
        }
    }

    moveToNonAcquistati(id) {
        var o = super.getOggetto(id);
        o.acquistato = false;
        if(o) {
            o.element.find('input[type="checkbox"]').prop('checked', false);
            o.element.prependTo(this.divOggettiDaAcquistare);
        }
    }

    annullaAcquistoOggetto(id) {
        var o = super.getOggetto(id);
        if(o)
            $.ajax('/update/annullaAcquistoOggetto', {
                type: "POST",
                dataType: "json",
                data: {IDOggetto:o.id,IDLista:super.getID()},
                success: function(res) {
                    if(res){
                        alert('EVVOVE POVCA CAVOTA')
                        console.log(res);
                    }else
                        o.acquistato = false;
                }
            });
    }

    refreshLista() {
        $.ajax('/get/oggettiLista', {
            type: "POST",
            dataType: "json",
            context: this,
            data: {IDLista: window.listaSpesa.getID()},
            success: function (oggetti) {
                this.divOggettiDaAcquistare.empty();
                this.divOggettiAcquistati.empty();
                for (const oggetto of oggetti)
                    window.listaSpesa.addOggetto(new Oggetto(
                        oggetto.ID, 
                        oggetto.Nome,
                        oggetto.Note,
                        oggetto.Prezzo,
                        oggetto.Quantita,
                        (oggetto.Acquirente?true:false)
                    ));
                if(this.isTuttoAcquistato())
                    this.bottoneChiusura.show();
                else
                    this.bottoneChiusura.hide();
            }
        });
    }

    chiudiLista() {
        $.ajax('/update/chiudiLista', {
            type: "POST",
            dataType: "json",
            data: {IDLista:super.getID()},
            success: function(res) {
                if(res){
                    alert('EVVOVE POVCA CAVOTA')
                    console.log(res);
                }
            }
        });
    }

    isTuttoAcquistato() {
        let oggetti = this.getOggetti()
        for(let id in oggetti) {
            if(!oggetti[id].acquistato)
                return false;}
        return true;
    }

    bloccaPagina() {
        this.aperta = false;
        $('body').empty().append($('<h1>La lista non &egrave; pi&ugrave; modificabile</h1>'))
    }

}