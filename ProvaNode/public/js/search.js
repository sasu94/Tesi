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

    $('select[name=common]').change(function () {
        if ($(this).val() != '')
            $('select[name=Order]').attr('disabled', true);
        else
            $('select[name=Order]').attr('disabled', false);

    });

    $('form').on('submit', function (e) {
        e.preventDefault();
        $('select[name=Order]').attr('disabled', false);
        this.submit();
        if ($('select[name=common]').val() != '')
            $('select[name=Order]').attr('disabled', true);
        else
            $('select[name=Order]').attr('disabled', false);
    });


    $('input[name=All]').change(function () {
        if ($(this).val() == 'A') {
            $("input[name=subjects]").prop('disabled', true);
            $("input[name=family]").prop('disabled', true);
        }
        else if ($(this).val() == 'F') {
            $("input[name=subjects]").prop('disabled', true);
            $("input[name=family]").prop('disabled', false);
        } else {
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

    $('select.shortField').change(function () {
        var optionSelected = $("option:selected", this);
        if (optionSelected.text() == '')
            $(this).next().val('');
    })

    $('.last').click(function (e) {
        e.preventDefault();
        var b = false;
        $('select.shortField option:selected').each(function (item) {
            if ($(this).text() != '' && $(this).parent().next().val() === '')
                b = true;
        })
        if (b)
            alert('If you change default value, you must specify a valid one (for comma use \',\' instead of \'.\')');
        else
            $(this).unbind('click').click()

    })

    $('.next').click(function (e) {
        e.preventDefault();
        var page = parseInt($(this).prev().val())
        if (isNaN(page))
            alert('please insert a valid number');
        else if (page + 1 <= $('#maxPages').val())
            window.location.href = $(this).attr('href') + (page + 1);
        else {
            alert('The value is bigger than the maximum value');
            $(this).prev().val($('#maxPages').val());
        }
    });

    $('.previous').click(function (e) {
        e.preventDefault();
        var page = parseInt($(this).next().val())
        if (isNaN(page))
            alert('please insert a valid number');
        else if (page - 1 > 0)
            window.location.href = $(this).attr('href') + (page - 1);
        else {
            alert('The value should be greater than 0');
            $(this).next().val(1);
        }
    });

    $('.go').click(function (e) {
        e.preventDefault();
        var page = parseInt($(this).prev().prev().val())
        if (isNaN(page))
            alert('please insert a valid number');
        else if (page > 0 && page <= $('#maxPages').val())
            window.location.href = $(this).attr('href') + page;
        else {
            if ($('#maxPages').val() == 1)
                alert('There is only one page');
            else
                alert('The value should be cumprises between 1 and ' + $('#maxPages').val());
        }
    });

});

function nextTab(elem) {
    $(elem).next().find('a[data-toggle="tab"]').click();
}

function prevTab(elem) {
    $(elem).prev().find('a[data-toggle="tab"]').click();
}

