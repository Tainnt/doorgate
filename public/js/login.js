function toasterOptions() {
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": true,
        "progressBar": true,
        "positionClass": "toast-top-right",
        "preventDuplicates": true,
        "onclick": null,
        "showDuration": "100",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "show",
        "hideMethod": "hide"
    };
};

$(document).ready(function () {
    toasterOptions();
    
});

function validate(input) {
    if ($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
        if ($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
            return false;
        }
    } else {
        if ($(input).val().trim() == '') {
            return false;
        }
    }
}

function showValidate(input) {
    var thisAlert = $(input).parent();

    $(thisAlert).addClass('alert-validate');
}

function hideValidate(input) {
    var thisAlert = $(input).parent();

    $(thisAlert).removeClass('alert-validate');
}

$('.validate-form .input100').each(function () {
    $(this).focus(function () {
        hideValidate(this);
    });
    $(this).keyup(function () {
        if (event.keyCode === 13) {
            $('.login100-form-btn').click();
        }
    });
});

$('.login100-form-btn').on('click', function () {
    var input = $('.validate-input .input100');
    for (var i = 0; i < input.length; i++) {
        if (validate(input[i]) == false) {
            showValidate(input[i]);
            return false;
        }
    }

    $.ajax({
        type: 'POST',
        url: '/login',
        data: {
            username: $(input[0]).val(),
            password: $(input[1]).val()
        },
        dataType: 'json',
        async: false,
        success: function (response) {
            $("#myModal").modal({
                backdrop: false,
                keyboard: false
            });
            $('#btnContinue').focus();
            if (response.status == 'granted') {
                $('#btnContinue').attr('class','btn btn-primary');
                $('.modal-title').html('Login successful');
                $('#myModal').modal('show');
                $('#btnContinue').on('click', function () {
                    setCookie("doorgate", response.id, 365);
                    window.location = '/monitor';
                });
            } else {
                $('#btnContinue').attr('class','btn btn-danger');
                $('.modal-title').html('Login failed');
                $('#myModal').modal('show');
                $('#btnContinue').on('click', function () {
                    $(input[0]).focus();
                    $(input[0]).val("");
                    $(input[1]).val("");
                });
            }
        }
    });
});

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}