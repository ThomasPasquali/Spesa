
export default class Oggetto{

    constructor(id, nome, note, prezzo, qta, acquistato = null, element = null){
        this.id = id;
        this.nome = nome;
        this.note = note;
        this.prezzo = prezzo;
        this.qta = qta;
        this.acquistato = acquistato;
        this.element = element;
    }
    
}

