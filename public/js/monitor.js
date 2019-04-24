var host = $(location).attr('hostname');
var port = 8080;

var socket = io.connect(host + ':' + port);

var input = $('.my-btn');
for (var i = 0; i < input.length; i++) {
    $(input[i]).on('click', function () {
        socket.emit('buttonCmd', {
            command: $(this).val()
        });
        switch ($(this).val()) {
            case 'open':
                // $('.form-control').append('open ');

                break;
            case 'close':
                // $('.form-control').append('close ');

                break;
            case 'stop':
                // $('.form-control').append('stop ');

                break;
            default:
                break;
        }

    });
}