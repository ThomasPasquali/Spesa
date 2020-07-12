import { requestUsers, checkUtenti } from './misc.js';


$(function() {

    //Elimina un utente da una lista
    $(document).on('click', '.rmUtenteAssociato', function(e) {
        let idGruppo = $(e.target).closest('.groupCard.container').attr('id');
        let idUtente = $(this).attr('id');
        $.ajax({
            url: '/delete/utente',
            dataType: 'json',
            method: 'post',
            data: { IDG: idGruppo, IDU: idUtente }
        }).done(function(response) {
            refreshUser();
        }).fail(function(e) {
            console.log(e);
        });
    })

    //Richiesta di ogni gruppo dei suoi componenti

    let refreshUser = function() {
        $('.groupCard.container').each(function() {
            $(this).children('.utenti').empty();
            var currID = $(this).attr('id');
            requestUsers(currID, $(this));
        })
    }

    refreshUser();

    // Il pulsante + fa comparire una finestra jconfirm per selezionare
    // gli utenti mancanti da aggiungere

    $('.addUser').click(function(e) {
        let idGruppo = $(this).attr('id');
        $.confirm({
            content: function() {
                var self = this;
                return $.ajax({
                    url: '/get/utenti',
                    dataType: 'json',
                    method: 'post',
                    data: { IDG: idGruppo }
                }).done(function(response) {
                    self.setTitle('<h4>Utenti che puoi aggiungere</h4>');
                    self.setContent(checkUtenti(response));
                }).fail(function(e) {
                    self.setContent('<div class="utentecheck"><label>Qualcosa è andato storto :(</label></div>');
                    console.log(e);
                });
            },
            buttons: {
                OK: function() {
                    $('.utentecheck input[type=checkbox]').each(function() {
                        if (this.checked) {
                            let idUtente = $(this).attr('id');
                            $.ajax({
                                url: '/insert/utenteInGruppo',
                                dataType: 'json',
                                method: 'post',
                                data: { IDG: idGruppo, IDU: idUtente }
                            }).done(function(response) {
                                refreshUser();
                            }).fail(function(err) {
                                console.log(err);
                            });
                        }
                    })
                }
            }
        });
    });
});