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
    toasterOptions();
    $('#wrapper').toggleClass("toggled");
    $('#textarea').empty();
    $('#textarea').append('id\t\t\t\state\t\t\t\t\tdatetime\n');
});

$('#btnMenu').on('click', function (e) {
    e.preventDefault();
    $('#wrapper').toggleClass("toggled");
});

$(".dropdown-item").click(function () {
    $('#doorState').html($(this).text());
    $('#doorState').val($(this).val());
});

$('#btnSearch').on('click', function (e) {
    e.preventDefault();
    socket.emit('searchDoorLog', {
        state: $('#doorState').val()
    });
});

$('#btnClear').on('click', function (e) {
    e.preventDefault();
    $('#textarea').empty();
    $('#textarea').append('id\t\t\tstate\t\t\t\t\tdatetime\n');
});

$('#logout').on('click', function () {
    window.location = '/logout';
});

socket.on('updateLogConsole', function (data) {
    for (let i = 0; i < data.res.length; i++) {
        $('#textarea').append(data.res[i].id + '\t\t\t');
        $('#textarea').append(data.res[i].state);
        $('#textarea').append(data.res[i].state == 'open by validate out' ? '\t\t' : '\t\t\t');
        $('#textarea').append(new Date(data.res[i].datetime).toLocaleString());
        $('#textarea').append('\n');
    }
    $('#textarea').append('----------------------------------------------------------------------- \n');
    $('#textarea').scrollTop($('#textarea')[0].scrollHeight);
});