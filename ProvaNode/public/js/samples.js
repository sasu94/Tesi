$(document).ready(function () {
    $('a[data-toggle="tooltip"]').tooltip({
        animated: 'fade',
        placement: 'right',
        html: true
    });
    $('.removeSample').click(function (e) {
        e.preventDefault();
        var r = confirm("Are you sure to remove this Sample? Every related variation will be removed too");
        if (r == true) {
            var id = $(this).attr('on');
            $.ajax({
                type: "POST",
                url: "/projects",
                datatype: "json",
                data: {
                    removeSample: id,
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