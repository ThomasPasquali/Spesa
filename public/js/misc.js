$(document).ready(() => {

    $('body').on('click', '.dropdown-control', function() {
        let target = $($(this).data('target'));
        if(target.is(':visible')) {
            target.removeClass().addClass('hidden');
            $(this).children('i').removeClass().addClass('fas fa-caret-up')
        }else {
            target.removeClass().addClass('flex-vertical');
            $(this).children('i').removeClass().addClass('fas fa-caret-down')
        }
    });

});