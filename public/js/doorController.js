var host = $(location).attr('hostname');
var port = $(location).attr('port');

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
            default:
                break;
        }
    });
}

function toasterOptions() {
    toastr.options = {
        'closeButton': true,
        'debug': false,
        'newestOnTop': true,
        'progressBar': true,
        'positionClass': 'toast-top-right',
        'preventDuplicates': true,
        'onclick': null,
        'showDuration': '100',
        'hideDuration': '1000',
        'timeOut': '5000',
        'extendedTimeOut': '1000',
        'showEasing': 'swing',
        'hideEasing': 'linear',
        'showMethod': 'show',
        'hideMethod': 'hide'
    };
};

$(document).ready(function () {
    socket.emit('getDoorState', {});
    toasterOptions();
    $('#wrapper').toggleClass("toggled");
});

$('#btnMenu').on('click', function (e) {
    e.preventDefault();
    $('#wrapper').toggleClass("toggled");
});

$('#logout').on('click', function () {
    window.location = '/logout';
});

socket.on('updateDoorState', function (data) {
    $('#doorState').text((data.state).toUpperCase());
    switch (data.state) {
        case 'open':
            $('#doorState').css('color', 'green');
            toastr.success('Door is opened');
            break;
        case 'close':
            $('#doorState').css('color', 'blue');
            toastr.success('Door is closed');
            break;
        case 'stop':
            $('#doorState').css('color', 'red');
            toastr.success('Door is stoped');
            break;
        default:
            break;
    }
});

socket.on('updateControlConsole', function (data) {
    $('#textarea').append(data.text + '\n');
    $('#textarea').scrollTop($('#textarea')[0].scrollHeight);
});