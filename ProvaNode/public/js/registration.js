$(document).ready(function () {
    $('#newLab').click(function (e) {
        e.preventDefault();
        $('#labModal').modal({ keyboard: true })
    })
    $('#newLaboratory').click(function () {
        $.ajax({
            type: "POST",
            url: "/registration",
            datatype: "json",
            data: {
                newLab: $('#laboratory').val(),
            },
            success: function (data) {
                if (data === false)
                    alert('Laboratory already in the Database');
                else {
                    $('#labs').append('<option value=' + data + '>' + $('#laboratory').val() + '</option>');
                    $('#labModal').modal('toggle');
                }
            },
            fail: function () {
                alert('niente');
            }

        });

    });
    $('#username').focusout(function () {
        $.ajax({
            type: "POST",
            url: "/registration",
            datatype: "json",
            data: {
                checkUser: $('#username').val(),
            },
            success: function (data) {
                if (data === false) {
                    alert('Username already used');
                    $('#username').val('');
                }
            },
            fail: function () {
                alert('niente');
            }

        })

    })


})