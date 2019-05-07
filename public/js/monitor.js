var host = $(location).attr('hostname');
var port = 8080;

var socket = io.connect(host + ':' + port);

var input = $('.my-btn');
for (let i = 0; i < input.length; i++) {
    $(input[i]).on('click', function () {

        switch ($(this).val()) {
            case 'open':
            case 'close':
            case 'stop':
                socket.emit('buttonCmd', {
                    command: $(this).val()
                });
                break;
            // TO-DO: Compact code 
            case 'setOpenTime':
                socket.emit('setAlarm', {
                    hour: $('#hourOpen').val(),
                    minute: $('#minuteOpen').val(),
                    command: 'open'
                });
                break;
            case 'setCloseTime':
                socket.emit('setAlarm', {
                    hour: $('#hourClose').val(),
                    minute: $('#minuteClose').val(),
                    command: 'close'
                });
                break;
            default:
                break;
        }

    });
}


$('.btn.btn-danger').on('click', function () {
    // $('.form-control').append('logout ');
    window.location = '/logout';
});

socket.on('updateDoorState', function (data) {
    $('#doorState').text((data.state).toUpperCase());
    switch (data.state) {
        case 'open':
            $('#doorState').css('color', 'green');
            break;
        case 'close':
            $('#doorState').css('color', 'blue');
            break;
        case 'stop':
            $('#doorState').css('color', 'red');
            break;
        default:
            break;
    }
});

socket.on('updateConsole', function (data) {
    $('.form-control').append(data.text + '\n');
});