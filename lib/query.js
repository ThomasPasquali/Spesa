const mysql = require('mysql');

class Database {
    constructor(config) {
        this.connection = mysql.createConnection(config);
    }
    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if(err) return reject(err);
                resolve(rows);
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if(err) return reject(err);
                resolve();
            } );
        } );
    }
}

const db = new Database({
    host: "127.0.0.1",
    user: "root",
    password: "Cazzone",
    database: "spesa"
});

module.exports = {

    /**********QL**********/

    /**
     * @param {string} user L'ID del gruppo
     * @param {string} supermercato L'ID del supermercato associato alle ricette
     * @returns {Promise} Tutte le ricette del gruppo es. "[{ID : 1, Nome : Ricetta, Descrizione : Buona}]"
     */
    getRicetteGruppo : function(gruppo, supermercato) {
        return db.query('SELECT r.ID, r.Nome, r.Descrizione FROM gruppi_ricette AS gr JOIN ricette AS r ON r.ID = gr.Ricetta WHERE gr.Gruppo = ? AND r.Supermercato = ?', [gruppo, supermercato]);
    },

    /**
     * @param {string} user L'ID della ricetta
     * @returns {Promise} Tutte gli oggetti della ricetta es. "[{ID : 1, Nome : Ricetta, Descrizione : Buona}]"
     */
    getOggettiRicetta : function(ricetta) {
        return db.query('SELECT o.Nome, o.Prezzo, o.Note FROM oggetti_ricette AS ogr JOIN oggetti AS o ON o.ID = ogr.Oggetto WHERE ogr.Ricetta = ?', [ricetta]);
    },

    /**
     * @param {string} user L'username dell'utente
     * @returns {Promise} Tutti i gruppi dell'utente es. "[{ID : 1, Nome : Gruppo}]"
     */
    getGruppiUtente : function(user) {
        return db.query('SELECT DISTINCT gu.Gruppo AS ID, g.Nome AS Nome FROM gruppi_utenti AS gu JOIN gruppi AS g ON g.ID = gu.Gruppo WHERE Utente = ?', [user]);
    },

    /**
     * @returns {Promise} Tutti i supermercati es. "[{ID : 1, Nome : Supermercato}]"
     */
    getSupermercati : function() {
        return db.query('SELECT ID, Nome FROM supermercati');
    },

    /**
     * @param {string} user L'username dell'utente
     * @returns {Promise} Password e preferenze dell'utente
     */
    getDatiUtente : function(user) {
        return db.query('SELECT Password, Preferenze FROM utenti WHERE Nome = ?', [user]);
    },

    /**
     * @param {string} user L'username dell'utente
     * @returns {Promise} Tutte le liste dell'utente es. "[{ID : 1, Nome : "Lista", Supermercato : "Coop", Gruppo : "I compratutto""}]"
     */
    getListeUtente : function(user) {
        return db.query('SELECT l.ID, l.Nome, l.Supermercato, g.Nome Gruppo FROM liste l JOIN gruppi g ON g.ID = l.Gruppo WHERE l.Aperta = 1 AND l.Gruppo IN (SELECT gu.Gruppo FROM gruppi_utenti gu WHERE gu.Utente = ?) ORDER BY l.Data_creazione DESC', [user]);
    },

    /**********END QL**********/

    /**********DML**********/

    /**
     * @param {string} nome Il nome della nuova lista
     * @param {int} gruppo Il gruppo di utenti associato alla lista
     * @param {string} supermercato Il supermercato associato alla lista
     * @param {boolean} richiedi_prezzi Il flag che in fase di acquisto farà richiedere il prezzo pagato per l'oggetto
     * @returns {Promise} Esito della query
     */
    addLista : function(nome, gruppo, supermercato, richiedi_prezzi) {
        return db.query('INSERT INTO liste(Nome, Gruppo, Supermercato, Richiedi_prezzi) VALUES (?,?,?,?)', [nome, gruppo, supermercato, richiedi_prezzi]);
    },

    /**********END DML**********/
};
