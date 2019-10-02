var host = $(location).attr('hostname');
var port = $(location).attr('port');

var socket = io.connect(host + ':' + port);

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
    socket.emit('getDoorTime', {});
    toasterOptions();
    $('#wrapper').toggleClass("toggled");
});

$('#btnMenu').on('click', function (e) {
    e.preventDefault();
    $('#wrapper').toggleClass("toggled");
});

$(".snapshot").click(function () {
    $('#snapshotTime').html($(this).text());
    $('#snapshotTime').val($(this).val());
});

$(".validate").click(function () {
    $('#validateMode').html($(this).text());
    $('#validateMode').val($(this).val());
});

$('#btnSave').on('click', function (e) {
    e.preventDefault();
    socket.emit('setSnapshotTime', {
        time: $('#snapshotTime').val()
    });
    socket.emit('setValidateMode', {
        mode: $('#validateMode').val()
    });
    if (!checkTime($('#hOpen').val(), $('#mOpen').val())) {
        toastr.error('Open door time is wrong');
        $('#hOpen').val('');
        $('#mOpen').val('');
    } else if (!checkTime($('#hClose').val(), $('#mClose').val())) {
        toastr.error('Close door time is wrong');
        $('#hClose').val('');
        $('#mClose').val('');
    } else if (!checkTime($('#hTurnOn').val(), $('#mTurnOn').val())) {
        toastr.error('Turn on camera time is wrong');
        $('#hTurnOn').val('');
        $('#mTurnOn').val('');
    } else if (!checkTime($('#hTurnOff').val(), $('#mTurnOff').val())) {
        toastr.error('Turn off camera time is wrong');
        $('#hTurnOff').val('');
        $('#mTurnOff').val('');
    } else {
        toastr.success('Saved');
        socket.emit('setSchedule', [{
                hour: $('#hOpen').val(),
                minute: $('#mOpen').val(),
                command: 'open'
            },
            {
                hour: $('#hClose').val(),
                minute: $('#mClose').val(),
                command: 'close'
            },
            {
                hour: $('#hTurnOn').val(),
                minute: $('#mTurnOn').val(),
                command: 'turnOn'
            },
            {
                hour: $('#hTurnOff').val(),
                minute: $('#mTurnOff').val(),
                command: 'turnOff'
            }
        ]);
    }
});

$('#btnReload').on('click', function (e) {
    e.preventDefault();
    toastr.success('Reloaded');
    socket.emit('getDoorTime', {});
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

socket.on('updateDoorTime', function (data) {
    $('#hOpen').val(data.open[0]);
    $('#mOpen').val(data.open[1]);
    $('#hClose').val(data.close[0]);
    $('#mClose').val(data.close[1]);
    $('#hTurnOn').val(data.turnOn[0]);
    $('#mTurnOn').val(data.turnOn[1]);
    $('#hTurnOff').val(data.turnOff[0]);
    $('#mTurnOff').val(data.turnOff[1]);
    // $('#snapshotTime').html('Every ' + data.snapshot + ' hour');
    // $('#snapshotTime').val(data.snapshot);
    // $( "#target" ).click();
    $('button[value=' + data.snapshot + ']').click();
    $('button[value=' + data.mode + ']').click();
    console.log('data.mode :', data.mode);
});

function checkTime(hour, minute) {
    let h = parseInt(hour);
    let m = parseInt(minute);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59)
        return true;
    else
        return false;
}