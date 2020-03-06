import Oggetto from './Oggetto.js';
import Lista from './Lista.js';
import {getIDfromDatalist} from '../misc.js';

export default class ListaSpesa extends Lista{

    /**
     * @param {int} id 
     * @param {boolean} aperta 
     * @param {boolean} richiediPrezzi 
     * @param {int} richiediPrezzi 
     * @param {object} divOggettiAcquistati 
     * @param {object} divOggettiDaAcquistare 
     * @param {object} bottoneChiusura 
     */
    constructor(id, aperta, richiediPrezzi, idSupermercato, divOggettiAcquistati, divOggettiDaAcquistare, bottoneChiusura) {
        super(id, richiediPrezzi, idSupermercato);
        if(!aperta) this.bloccaPagina();
        this.aperta = aperta;
        this.divOggettiAcquistati = divOggettiAcquistati;
        this.divOggettiDaAcquistare = divOggettiDaAcquistare;
        this.bottoneChiusura = bottoneChiusura;
    }

    addOggetto(oggetto, modificaDB = false) {
        if(!this.getOggetto(oggetto.id) && modificaDB) {
            this.sendRequest('/insert/oggettoLista', {
                IDOggetto: oggetto.id,
                IDLista: this.getID(),
                IDSupermercato: this.idSupermercato,
                qta: oggetto.qta
            }).catch((err) => { alert('EVVOVE'); console.log(err); });}
        else {
            let esistente = super.addOggetto(oggetto);
            oggetto = this.getOggetto(oggetto.id);
            if(esistente) {
                if(modificaDB)
                    this.sendRequest('/update/qtaOggetto', {
                        IDOggetto: oggetto.id,
                        IDLista: this.getID(),
                        qta: oggetto.qta
                    }).catch((err) => { alert('EVVOVE'); console.log(err); });
                this.annullaAcquistoOggetto(oggetto.id);
            }else {
                this.refreshOggetto(oggetto.id, oggetto, true);
                (oggetto.acquistato?this.divOggettiAcquistati:this.divOggettiDaAcquistare).append(oggetto.element);
            }
        }
    }

    acquistaOggetto(id) {
        var o = this.getOggetto(id);
        var lista = this;
        if(o)
            new Promise((resolve, reject) => {
                if(lista.richiediPrezzi) {
                    let fieldPrezzo = $('<input type="number" min="0.05" max="999.99" step="0.05" placeholder="Prezzo..." required>');
                    fieldPrezzo.val(o.prezzo.toFixed(2));
                    fieldPrezzo.focusin(function(){ $(this).select(); });
                    $.confirm({
                        title: 'Prezzo (UNITARIO) del prodotto',
                        content: fieldPrezzo,
                        theme: 'black',
                        buttons: {
                            submit: {
                                text: 'Conferma',
                                btnClass: 'btn-blue',
                                keys: ['enter']
                            },
                            cancel: {
                                text: 'Annulla',
                                btnClass: 'btn-gray',
                            }
                        },
                        onOpen: () => { fieldPrezzo.focusin(); },
                        onAction: function(action){
                            let prezzo = parseFloat(fieldPrezzo.val());
                            if(action == 'submit')
                                if(!prezzo || prezzo > 999.99)
                                    $.alert('Inserire un prezzo valido');
                                else
                                    resolve(prezzo);
                            else
                                reject();
                        }
                    });
                }else resolve(prezzo);
            }).then((prezzo) => {
                lista.sendRequest('/update/acquistaOggetto',{
                    IDOggetto:o.id,
                    IDLista:lista.getID(),
                    prezoAcquisto:prezzo
                }).catch((err) => { alert('EVVOVE'); console.log(err); });
            }).catch(() => { lista.refreshOggetto(id, o) });
        else 
            alert(`L'oggetto ${id} non è nella lista`);
    }
    
    moveToAcquistati(id) {
        var o = super.getOggetto(id);
        if(o) {
            o.acquistato = true;
            o.element.prependTo(this.divOggettiAcquistati);
            this.refreshOggetto(id, o);
            if(this.isTuttoAcquistato()) this.bottoneChiusura.show();
        }
    }

    moveToNonAcquistati(id) {
        var o = super.getOggetto(id);
        if(o) {
            o.acquistato = false;
            o.element.prependTo(this.divOggettiDaAcquistare);
            this.refreshOggetto(id, o);
            if(this.isTuttoAcquistato()) this.bottoneChiusura.hide();
        }
    }

    annullaAcquistoOggetto(id) {
        var o = super.getOggetto(id);
        if(o)
            this.sendRequest('/update/annullaAcquistoOggetto', {
                IDOggetto:o.id,
                IDLista:super.getID()
            }).catch((err) => { alert('EVVOVE'); console.log(err); });
    }

    refreshLista() {
        var lista = this;
        this.sendRequest('/get/oggettiLista', { IDLista: lista.getID() }).then((oggetti) => {
            this.divOggettiDaAcquistare.empty();
            this.divOggettiAcquistati.empty();
            for (const o of oggetti) {
                var oggetto = lista.getOggetto(o.ID);
                if(oggetto) lista.refreshOggetto(oggetto);
                else lista.addOggetto(new Oggetto(o.ID,o.Nome,o.Note,o.Prezzo,o.Quantita,o.Acquirente));
            }
            if(lista.isTuttoAcquistato()) lista.bottoneChiusura.show();
            else lista.bottoneChiusura.hide();
        }).catch((err) => { alert('EVVOVE'); console.log(err); });
    }

    refreshOggetto(id, newOggetto, createElement = false) {
        var oggetto = this.getOggetto(id);
        if(oggetto) {
            oggetto.nome = newOggetto.nome;
            oggetto.note = newOggetto.note;
            oggetto.prezzo = newOggetto.prezzo;
            oggetto.qta = newOggetto.qta;
            oggetto.acquistato = newOggetto.acquistato;
            if(createElement)
                oggetto.element = $('<div></div>').append(
                    $(`<input class="oggetto" type="checkbox">`).attr('id', `oggetto_${oggetto.id}`),
                    $(`<label for="oggetto_${oggetto.id}"></label>`));
            
            if(oggetto.element) {
                oggetto.element.children('label').text(`${oggetto.nome}${(oggetto.note?' ('+oggetto.note+')':'')} ${oggetto.qta}Pz.`);
                oggetto.element.children('input').prop('checked', oggetto.acquistato).val(oggetto.id).data('prezzo', oggetto.prezzo).data('qta', oggetto.qta);
            }
        }
    }

    chiudiLista() {
        var lista = this;
        if(this.isTuttoAcquistato())
            $.confirm({
                title: 'La chiusura della lista non permetterà più a nessuno di modificarla',
                content: 'Sei sicuro di volerla chiudere?',
                theme: 'black',
                buttons: {
                    confirm: {
                        text: 'CHIUDI LISTA',
                        keys: ['enter'],
                        btnClass: 'btn-red',
                        action: () => {
                            lista.sendRequest('/update/chiudiLista', {
                                IDLista: lista.getID()
                            }).then(() => {
                                lista.bloccaPagina();
                            }).catch((err) => { alert('EVVOVE'); console.log(err); });
                        }
                    },
                    cancel: {
                        text: 'Annulla'
                    }
                }
            });
        else
            $.alert('Non sono stati acquistati tutti gli oggetti');
    }

    isTuttoAcquistato() {
        let oggetti = this.getOggetti()
        for(let id in oggetti)
            if(!oggetti[id].acquistato)
                return false;
        return true;
    }

    bloccaPagina() {
        this.aperta = false;
        $('body').empty().append($('<h1>La lista non &egrave; pi&ugrave; modificabile</h1>'))
    }

    nuovoOggetto() {
        var search, datalist, listaTmp, lista = this;
        $.confirm({
            title: 'Aggiungi oggetto alla lista',
            theme: 'black',
            content: function () {
                var self = this;
                self.setContent($('<div class="spinner-border text-success" role="status"><span class="sr-only">Loading...</span></div>'));
                return $.ajax({
                    url: '/get/oggettiSupermercato',
                    dataType: 'json',
                    method: 'post',
                    data: {IDSupermercato: lista.getIDSupermercato()}
                }).done(function(res) {
                    listaTmp = new Lista(null);
                    datalist = $('<datalist></datalist>');
                    datalist.attr('id', 'oggetti');
                    for(let o of res) {
                        listaTmp.addOggetto(new Oggetto(o.ID, o.Nome, o.Note, o.Prezzo, 1, false));
                        datalist.append($(`<option data-value="${o.ID}"></option>`).text(`${o.Nome} (${o.Note})`));
                    }
                    search = $('<input placeholder="Cerca tra gli oggetti..." list="oggetti">');
                    self.setContent($('<div></div>').append(search, datalist));
                }).fail(function(){
                    self.setContent('Something went wrong.');
                });
            },
            buttons: {
                confirm: {
                    text: 'Conferma',
                    action: function() {
                        let idOggetto = getIDfromDatalist(datalist, search.val());
                        if(idOggetto)
                            lista.addOggetto(listaTmp.getOggetto(idOggetto), true);
                        else
                            return false;
                    }
                },
                cancel: {
                    text: 'Annulla'
                }
            }
        });
    }

    sendRequest(url, data, method="POST") {
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

}
