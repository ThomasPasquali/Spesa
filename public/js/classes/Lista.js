import Oggetto from './Oggetto.js';

export default class Lista {

    /**
     * @param {int} id 
     * @param {boolean} richiediPrezzi
     */
    constructor(id, richiediPrezzi = null) {
        this.oggetti = {};
        this.id = id;
        this.richiediPrezzi = richiediPrezzi;
    }

    /**
     * @param {Oggetto} oggetto 
     */
    addOggetto(oggetto) {
        let o = this.oggetti[oggetto.id];

        if(o)
            o.qta += oggetto.qta;
        else
            this.oggetti[oggetto.id] = oggetto;
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
/*class ListaPower{

    constructor(container, listaTot){
        this.array = {};
        this.container = container;
        this.listaTot = listaTot;
    }

    put(key, object){
        if(key in this.array){
            this.array[key].qta += object.qta;
        }else{
            this.array[key] = object;
        }
        this.recreateLista();
    }

    get(key){
        return this.array[key];
    }

    remove(key){
        delete this.array[key];
        this.recreateLista();
    }

    recreateLista = function () {
        if(this.listaTot){
            var c = this.container;
            $(this.container).empty();
            var counter = 0;
            $.each(this.array, function (id , alimento) { 
                var html = '<div class="alimento"><input style="width: 200px;" class="alimento inpuntWithList" value="'+ alimento.nome +'" name="alimento_' + counter + '" list="allAlimenti"><input class="alimento" style="width: 60px;" list="listaQuantita" value="'+ alimento.qta +'" name="qtaAlimenti_' + counter + '"><button class="alimento rmAlimento" type="button"><i class="fa fa-remove rimuovi"></i></button></div>';
                $(c).prepend(html);
                counter++;
            });
        }
    }

    svuotati(){
        this.array = {};
    }

}*/

