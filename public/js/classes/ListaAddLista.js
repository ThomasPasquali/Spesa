import Oggetto from './Oggetto.js';
import Lista from './Lista.js';

export default class ListaAddLista extends Lista{

    constructor(container, listaTot) {
        super(1);
        this.listaTot = listaTot;
        this.container = container;
        this.vuota = true;
        this.counterAlimenti = 0;
    }

    addOggetto(id, oggetto) {
        this.vuota = false;
        if(id in super.getOggetti()){
            super.getOggetti()[id].qta += oggetto.qta;
        }else{
            super.getOggetti()[id] = oggetto;
            this.counterAlimenti++;
            this.updateListaVuota()
        }
        this.recreateLista();
    }

    updateQta(id, qta){
        super.getOggetti()[id].setQta(qta);
    }

    removeOggetto(id){
        if(id in super.getOggetti()){
            this.counterAlimenti--;
            this.updateListaVuota();
        }
        super.removeOggetto(id);
        this.recreateLista();
    }

    updateListaVuota(){
        this.vuota = this.counterAlimenti == 0;
 
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
                var html = '<div class="alimento"><input class="alimento inputWithList n2 blocked" value="'+ alimento.nome +'" name="alimento_' + counter + '" list="allAlimenti"><input class="alimento qta n2" value="'+ alimento.qta +'" name="qtaAlimenti_' + counter + '"><button class="alimento rmAlimento piccolo" type="button"><i class="fa fa-remove rimuovi"></i></button></div>';
                $(c).append(html);
                counter++;
            });
        }
    }
}