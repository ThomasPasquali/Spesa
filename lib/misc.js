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

};
