let host = $(location).attr('hostname');
let port = $(location).attr('port');

let socket = io.connect(host + ':' + port);
let label;
let field;

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
    label = $('.form-group').find('label');
    field = $('.form-group').find('input');
    $('#wrapper').toggleClass("toggled");
});

$('#logout').on('click', function () {
    window.location = '/logout';

});

$('#search-input').bind('keypress', function (e) {
    if (e.keyCode == 13) {
        socket.emit('getPayment', {
            roomNumber: $(this).val()
        });
    }
});

socket.on('updatePaymentViewer', function (data) {
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    if (data.current != null) {
        toastr.success('Get payment successful');
        $('#curMon').html(months[data.current.month - 1]);
        $('#txbCurElc').val(data.current.electric_numeral);
        $('#txbCurWtr').val(data.current.water_numeral);
        $('#txbCurMdf').val(new Date(data.current.date_modified).toLocaleString());
        $('#preMon').html(months[data.previous.month - 1]);
        $('#txbPreElc').val(data.previous.electric_numeral);
        $('#txbPreWtr').val(data.previous.water_numeral);
        $('#txbPreMdf').val(new Date(data.previous.date_modified).toLocaleString());
        $('#txbRoomCharge').val(data.current.room_charge);
        $('#txbTotalCharge').val(data.totalCharge);
        $('#txbDtCfm').val(new Date(data.current.date_confirmed).toLocaleString() == 'Invalid Date' ? 'Unconfimred' : new Date(data.current.date_confirmed).toLocaleString());
    } else {
        toastr.error('Can not find payment');
        $('#curMon').html('Current month');
        $('#txbCurElc').val('');
        $('#txbCurWtr').val('');
        $('#txbCurMdf').val('');
        $('#preMon').html('Previous month');
        $('#txbPreElc').val('');
        $('#txbPreWtr').val('');
        $('#txbPreMdf').val('');
        $('#txbRoomCharge').val('');
        $('#txbTotalCharge').val('');
        $('#txbDtCfm').val('');
    }
});

$('#btnMenu').click(function (e) {
    e.preventDefault();
    $('#wrapper').toggleClass('toggled');
});

function checkField() {
    for (let i = 1; i < field.length; i++) {
        if ($.trim($(field[i]).val()) == '')
            return 'empty';
    }
    return 'success';
}

$('#btnConfirm').click(function (e) {
    e.preventDefault();
    if (checkField() == 'empty') {
        toastr.error('Field can not empty');
    } else if (checkField() == 'success') {
        toastr.success('Update payment successful');
        socket.emit('updatePaymentDB', {
            roomNumber: $('#search-input').val(),
            roomCharge: $('#txbRoomCharge').val(),
            totalCharge: $('#txbTotalCharge').val()
        });
        socket.emit('getPayment', {
            roomNumber: $('#search-input').val()
        });
    }
});