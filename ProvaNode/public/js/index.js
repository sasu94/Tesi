$(document).ready(function () {
    $('img').on('error', function () {
        $(this).attr('src', '/photos/3.jpeg');
        $(this).parent().attr('title', "<img src='" + $(this).attr('src') + "' />");

    })
})