import Oggetto from './Oggetto.js';
import Lista from './Lista.js';

export default class ListaAddLista extends Lista{

    constructor(container, listaTot) {
        super(1);
        this.listaTot = listaTot;
        this.container = container;
        this.vuota = true;
    }

    addOggetto(id, oggetto) {
        this.vuota = false;
        if(id in super.getOggetti()){
            super.getOggetti()[id].qta += oggetto.qta;
        }else{
            super.getOggetti()[id] = oggetto;
        }
        this.recreateLista();
    }

    updateQta(id, qta){
        super.getOggetti()[id].setQta(qta);
    }

    removeOggetto(id){
        super.removeOggetto(id);
        this.recreateLista();
    }

    getOggetto(id){
        return super.getOggetti()[id];
    }

    recreateLista() {
        if(this.listaTot){
            var c = this.container;
            $(this.container).empty();
            var counter = 0;
            $.each(this.getOggetti(), function (id , alimento) { 
                var html = '<div class="alimento"><input style="width: 200px;" class="alimento inputWithList blocked" value="'+ alimento.nome +'" name="alimento_' + counter + '" list="allAlimenti"><input class="alimento qta" style="width: 60px;" value="'+ alimento.qta +'" name="qtaAlimenti_' + counter + '"><button class="alimento rmAlimento" type="button"><i class="fa fa-remove rimuovi"></i></button></div>';
                $(c).append(html);
                counter++;
            });
        }
    }
}