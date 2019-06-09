let host = $(location).attr('hostname');
let port = 8080;

let socket = io.connect(host + ':' + port);
let label;
let field;
let labelLen = new Array();

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
    socket.emit('getTenantField', {});
    label = $('.form-group').find('label');
    field = $('.form-group').find('input');
});

$('#logout').on('click', function () {
    // $('.form-control').append('logout ');
    window.location = '/logout';

});

$('#search-input').bind('keypress', function (e) {
    if (e.keyCode == 13) {
        // console.log('test :', $(this).val());
        socket.emit('searchDB', {
            argument: $(this).val()
        });
    }
});

socket.on('updateDBViewer', function (data) {
    switch (data.type) {
        case 'data':
            if (data.argument != null) {
                toastr.success('Get tenant profile successful');
                $('#txbName').val(data.argument.name);
                $('#txbPhone').val(data.argument.phone);
                $('#txbAvatar').val(data.argument.avatar);
                $('#txbRfid').val(data.argument.rfid);
                $('#txbPassword').val(data.argument.password);
                $('#txbFlashAddress').val(data.argument.flash_address);
            } else {
                toastr.error('Can not find tenant');
                $('#txbName').val('');
                $('#txbPhone').val('');
                $('#txbAvatar').val('');
                $('#txbRfid').val('');
                $('#txbPassword').val('');
                $('#txbFlashAddress').val('');
            }
            break;
        case 'length':
            for (var i = 0; i < data.argument.length; i++) {
                $(label[i]).append(' [length: ' + data.argument[i].len + ']');
                labelLen[i] = data.argument[i].len;
            }
            break;
    }
});

$('#btnMenu').click(function (e) {
    e.preventDefault();
    // $('#wrapper').toggleClass('toggled');
    console.log('field :');
    $(field[0]).val('abc');
});

function checkField() {
    if ($('#txbName').val() == '' ||
        $('#txbPhone').val() == '' ||
        $('#txbAvatar').val() == '' ||
        $('#txbRfid').val() == '' ||
        $('#txbPassword').val() == '' ||
        $('#txbFlashAddress').val() == '') {
        return 'empty';
    }
    // if($('#txbName').val().length != labelLen[)
}

$('#btnUpdate').click(function (e) {
    e.preventDefault();
    if (checkField() == 'empty') {
        toastr.error('Field can not empty');
    } else if (checkField() == 'wrong length') {
        toastr.error('Some field wrong length');
    } else if (checkField() == 'success') {
        toastr.success('Update profile successful');
    }
});