import Oggetto from './Oggetto.js';

export default class Lista {

    /**
     * @param {int} id 
     * @param {boolean} richiediPrezzi
     */
    constructor(id, richiediPrezzi = null, idSupermercato = null) {
        this.oggetti = {};
        this.id = id;
        this.idSupermercato = idSupermercato;
        this.richiediPrezzi = richiediPrezzi;
    }

    /**
     * @param {Oggetto} oggetto 
     * @returns {boolean} true se l'oggetto era già nella lista, false se è stato inserito
     */
    addOggetto(oggetto) {
        var o = this.oggetti[oggetto.id];
        if(o) {
            o.qta = parseInt(o.qta) + parseInt(oggetto.qta);
            return true;
        }else {
            this.oggetti[oggetto.id] = oggetto;
            return false;
        }
    }

    /**
     * @param {int} id 
     */
    getOggetto(id) {
        return this.oggetti[id];
    }

    getOggetti(){
        return this.oggetti;
    }

    getID() {
        return this.id;
    }

    getIDSupermercato() {
        return this.idSupermercato;
    }

    getRichiediPrezzi() {
        return this.richiediPrezzi;
    }

    /**
     * @param {int} id 
     */
    removeOggetto(id){
        delete this.oggetti[id];
    }

    svuota() {
        this.oggetti = {};
    }

}