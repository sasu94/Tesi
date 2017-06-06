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
        $.ajax({
            type: "POST",
            url: "/subjects",
            datatype: "json",
            data: {
                loadFamilies: name,
            },
            success: function (data) {
                data.forEach(function (element) {
                    $('#famName').append('<option value=' + element.Name + '>' + element.Name + '</option>');
                });
            },
            fail: function () {
                alert('niente');
            }
        })
        $('#subModal').modal({ keyboard: true })
    });

    $('#newProj').click(function (e) {
        e.preventDefault();
        $('#projModal').modal({ keyboard: true })
    });


    $('#newSubject').click(function () {
        if ($('#Id').val() != '' && $('#protocolNumber').val() != '' && $('#sex').val() != '' && $('#age').val() != '' && $('#ageOfOnset').val() != '' && $('#famName').val() != '') {
            var name = $('#Id').val();
            $.ajax({
                type: "POST",
                url: "/subjects",
                datatype: "json",
                data: {
                    newSubject: name,
                    ProtocolNumber: $('#protocolNumber').val(),
                    Status: $('input[name=Status]:checked').val(),
                    Sex: $('#sex').val(),
                    Age: $('#age').val(),
                    AgeOfOnset: $('#ageOfOnset').val(),
                    Family: $('#famName').val(),
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
        }
        else {
            alert('please, fill every field');

        }
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