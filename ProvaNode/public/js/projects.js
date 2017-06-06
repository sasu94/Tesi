$(document).ready(function () {
    $('.remove').click(function (e) {
        e.preventDefault();
        var r = confirm("Are you sure to remove this project? Every related sample will be removed too");
        if (r == true) {
            var id = $(this).attr('on');
            $.ajax({
                type: "POST",
                url: "/projects",
                datatype: "json",
                data: {
                    remove: id,
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
});