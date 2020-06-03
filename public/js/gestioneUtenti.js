import {requestUsers} from './misc.js';


$(document).ready(function () {

    //Richiesta di ogni gruppo dei suoi componenti
    
    $('.groupCard.container').each(function(){
        var currID = $(this).attr('id');
        requestUsers(currID, $(this));
    })

});