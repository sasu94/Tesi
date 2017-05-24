$(document).ready(function () {

    $('.form-horizontal').submit(function () {
        $('.disappear').toggleClass('disappear');
    })


    $('#photo').change(function () {
        var ext = $(this).val().split('.').pop().toLowerCase();
        if ($.inArray(ext, ['gif', 'png', 'jpg', 'jpeg']) == -1) {
            alert('invalid photo!');
            this.value = '';
        }

    });

    $('#file').change(function () {
        var ext = $(this).val().split('.').pop().toLowerCase();
        if ($.inArray(ext, ['csv']) == -1) {
            alert('invalid file!');
            this.value = '';
        }

    });

    $('#newSub').click(function (e) {
        e.preventDefault();
        $('#subModal').modal({ keyboard: true })
    });

    $('#newProj').click(function (e) {
        e.preventDefault();
        $('#projModal').modal({ keyboard: true })
    });


    $('#newSubject').click(function () {
        var name = $('#subName').val();
        $.ajax({
            type: "POST",
            url: "/newSubject",
            datatype: "json",
            data: {
                newSubject: name,
            },
            success: function (data) {
                if (data === false)
                    alert('Subject already in the Database');
                else {
                    $('#subjects').append('<option value=' + name + '>' + name + '</option>');
                    $('#subModal').modal('toggle');
                }
            },
            fail: function () {
                alert('niente');
            }
        })
    });

    $('#newProject').click(function () {
        var name = $('#projName').val();

        $.ajax({
            type: "POST",
            url: "/newProjectAJAX",
            datatype: "json",
            data: {
                newProject: name,
            },
            success: function (data) {
                $('#projects').append('<option value=' + data + '>' + name + '</option>');
                $('#projModal').modal('toggle');
            },
            fail: function () {
                alert('niente');
            }
        })





    });
});