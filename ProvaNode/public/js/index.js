$(document).ready(function () {
    $('img').on('error', function () {
        $(this).attr('src', '/photos/3.jpeg');
        $(this).parent().attr('data-original-title', '<img src=\'/photos/3.jpeg\'>');
     })
})