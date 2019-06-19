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
                if (checkTime($('#hourOpen').val(), $('#minuteOpen').val())) {
                    toastr.success('Time to open door is set');
                    socket.emit('setAlarm', {
                        hour: $('#hourOpen').val(),
                        minute: $('#minuteOpen').val(),
                        command: 'open'
                    });
                } else {
                    toastr.error('Hour or minutes is wrong');
                    $('#hourOpen').val('');
                    $('#minuteOpen').val('');
                }
                break;
            case 'setCloseTime':
                if (checkTime($('#hourClose').val(), $('#minuteClose').val())) {
                    toastr.success('Time to close door is set');
                    socket.emit('setAlarm', {
                        hour: $('#hourClose').val(),
                        minute: $('#minuteClose').val(),
                        command: 'close'
                    });
                }
                else{
                    toastr.error('Hour or minutes is wrong');
                    $('#hourClose').val('');
                    $('#minuteClose').val('');
                }
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
    socket.emit('getDoorTime', {});
    toasterOptions();
});

$('#btnMenu').on('click', function (e) {
    e.preventDefault();
    $('#wrapper').toggleClass("toggled");
});

$('#btnRun').on('click', function (e) {
    e.preventDefault();
    socket.emit('test', {
        type: 'run',
        para: $('#txtParameter').val()
    });
});

$('#btnTest').on('click', function (e) {
    e.preventDefault();
    socket.emit('test', {
        type: 'test',
        para: $('#txtParameter').val()
    });
});

$('#logout').on('click', function () {
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

socket.on('updateDoorTime', function (data) {
    
    $('#hourOpen').val(data.openH);
    $('#minuteOpen').val(data.openM);
    $('#hourClose').val(data.closeH);
    $('#minuteClose').val(data.closeM);
});

socket.on('updateConsole', function (data) {
    $('#textarea').append(data.text + '\n');
    $('#textarea').scrollTop($('#textarea')[0].scrollHeight);
});

function checkTime(hour, minute) {
    let h = parseInt(hour);
    let m = parseInt(minute);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59)
        return true;
    else
        return false;
}