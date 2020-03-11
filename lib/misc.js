module.exports = {

    /**
     * @returns {string} Un saluto in base all'ora
     */
    getSaluto : function() {
        const hour_of_day = new Date().getHours();
        let saluto = '';
        if (hour_of_day > 22 || hour_of_day <= 5) {
            saluto = 'Buona notte e sogni d\'oro ';
        }else {
            if (hour_of_day > 5 && hour_of_day <= 11) {
                saluto = 'Buon giorno ';
            } else {
                if (hour_of_day > 11 && hour_of_day <= 17) {
                    saluto = 'Buon pomeriggio ';
                } else if (hour_of_day > 17 && hour_of_day <= 22)
                    saluto = 'Buona sera ';
            }
        }
        return saluto;
    },

    /**
     * @param {object} clientObject payload del client (form per aggiungere una lista)
     * @return {object} ID alimenti e rispettive quantità
     */
    getAlimentiAndQta: function (clientObject) {
        var res = {};
        var thisKey = null;
        Object.keys(clientObject).forEach(function(key) {
            if (key.startsWith('alimento_')){
                thisKey = clientObject[key];
            }
            if (key.startsWith('qtaAlimenti_') && thisKey){
                res[thisKey] = clientObject[key];
                thisKey = null;
            }
        });
        return res;    
    }

};
