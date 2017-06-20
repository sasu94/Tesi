$(document).ready(function () {
    $('#save').click(function (e) {
        e.preventDefault();
        if ($('#old').val() != '' && $('#new').val() != '' && $('#repeat') != '') {

            if ($('#new').val() == $('#repeat').val()) {
                $.ajax({
                    type: "POST",
                    url: "/profile",
                    datatype: "json",
                    data: {
                        newPassword: $('#new').val(),
                        oldPassword: $('#old').val(),
                    },
                    success: function (data) {
                        console.log(data);
                        if (data === false) {
                            alert('Old password is not right');
                        } else {
                            alert('Password changed succesfully');
                        }
                    },
                    fail: function () {
                        alert('niente');
                    }
                })

            } else {
                alert('New and repeat field should be the same');
            }
        } else {
            alert('please fill every field');

        }
    });
});