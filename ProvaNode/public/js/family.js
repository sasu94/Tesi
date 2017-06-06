$(document).ready(function () {
    $('#newFamily').click(function (e) {
        var name = $('input[name=name]').val();
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: "/subjects",
            datatype: "json",
            data: {
                checkFamily: name,
            },
            success: function (data) {
                console.log(data);
                if (data === false) {
                    alert('Family already in the Database');
                } else {
                    $('#formFam').submit();
                }
            },
            fail: function () {
                alert('niente');
            }
        })
    });
    $('#newSubject').click(function (e) {
        var name = $('#Id').val();
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: "/subjects",
            datatype: "json",
            data: {
                checkSubject: name,
            },
            success: function (data) {
                console.log(data);
                if (data === false) {
                    alert('Subject already in the Database');
                } else {
                    $('#formSub').submit();
                }
            },
            fail: function () {
                alert('niente');
            }
        })
    });

})