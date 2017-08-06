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

    $('input[name=Status]').change(function () {
        if($(this).val()=='Not Affected')
            $("#ageOfOnset").prop('disabled', true);
        else
            $("#ageOfOnset").prop('disabled', false);
    });

    $('.removeSub').click(function (e) {
        e.preventDefault();
        var r = confirm("Are you sure to remove this subject? Every related sample will be removed too");
        if (r == true) {
            var id = $(this).attr('on');
            $.ajax({
                type: "POST",
                url: "/subjects",
                datatype: "json",
                data: {
                    removeSub: id,
                },
                success: function (data) {
                    if ($('tr').length == 1)
                        window.location.href = window.location.href;
                },
                fail: function () {
                    alert('niente');
                }
            })
            $(this).parent().parent().remove()
        }
    });
   

    $('.removeFam').click(function (e) {
        e.preventDefault();
        var r = confirm("Are you sure to remove this family? Every related subject and sample will be removed too");
        if (r == true) {
            var id = $(this).attr('on');
            $.ajax({
                type: "POST",
                url: "/subjects",
                datatype: "json",
                data: {
                    removeFam: id,
                },
                success: function (data) {
                    if ($('tr').length == 1)
                        window.location.href = window.location.href;
                },
                fail: function () {
                    alert('niente');
                }
            })
            $(this).parent().parent().remove()
        }
    });
 
    $('a[data-toggle="tooltip"]').tooltip({
        animated: 'fade',
        placement: 'bottom',
        html: true
    });


    $('.form-horizontal').submit(function (e) {
        e.preventDefault();
        var name = $('#Id').val();
        var form = $(this);
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
                    $('.disappear').toggleClass('disappear');
                    form.unbind('submit').submit()
                }
            },
            fail: function () {
                alert('niente');
            }
        })


    });


    $('#newProj').click(function (e) {
        e.preventDefault();
        $('#projModal').modal({ keyboard: true })
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
        });
    });

    $('#file').change(function () {
        var ext = $(this).val().split('.').pop().toLowerCase();
        if ($.inArray(ext, ['csv']) == -1) {
            alert('invalid file!');
            this.value = '';
        }

    });

})