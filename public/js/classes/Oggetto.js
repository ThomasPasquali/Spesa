
export default class Oggetto{

    constructor(id, nome, note, prezzo, qta, acquistato = null){
        this.id = parseInt(id);
        this.nome = nome;
        this.note = note;
        this.prezzo = parseFloat(prezzo);
        this.qta = parseInt(qta);
        this.acquistato = acquistato?true:false;
        this.element = null;
    }

    setQta(qta){
        this.qta=qta;
    }
    
}

