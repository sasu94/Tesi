$(document).ready(function () {
    $('a[data-toggle="tab"]').on('show.bs.tab', function (e) {

        var $target = $(e.target);

        if ($target.parent().hasClass('disabled')) {
            return false;
        }
    });

    $(".cont").click(function (e) {

        var $active = $('.wizard .nav-wizard li.active');
        $active.next().removeClass('disabled');
        nextTab($active);

    });

    $(".back").click(function (e) {

        var $active = $('.wizard .nav-wizard li.active');
        $active.toggleClass('disabled');
        prevTab($active);

    });

    $('input[name=All]').change(function () {
        if ($(this).val() == 'A'){
            $("input[name=subjects]").prop('disabled', true);
            $("input[name=family]").prop('disabled', true);
        }
        else if ($(this).val() == 'F'){
            $("input[name=subjects]").prop('disabled', true);
            $("input[name=family]").prop('disabled', false);
        }else{
            $("input[name=subjects]").prop('disabled', false);
            $("input[name=family]").prop('disabled', true);
        }
    });
    $('input[name=FuncCheck]').change(function () {
        if ($(this).val() == 'A') {
            $("input[name=func]").prop('disabled', true);
        } else {
            $("input[name=func]").prop('disabled', false);
        }

    });
    $('input[name=ExFuncCheck]').change(function () {
        if ($(this).val() == 'A') {
            $("input[name=exFunc]").prop('disabled', true);
        } else {
            $("input[name=exFunc]").prop('disabled', false);
        }

    });
});

function nextTab(elem) {
    $(elem).next().find('a[data-toggle="tab"]').click();
}

function prevTab(elem) {
    $(elem).prev().find('a[data-toggle="tab"]').click();
}

