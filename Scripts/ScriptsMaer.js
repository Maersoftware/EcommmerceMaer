
function removeItemFromCart(id, name, price, qty, url, opencart) {
    ga('ec:addProduct', {
        'id': id,
        'name': name,
        'category': '', /*category,*/
        'brand': '',/*brand,*/
        //'variant': variant,
        'price': price,
        'quantity': qty
    });
    ga('ec:setAction', 'remove');
    ga('send', 'event', 'UX', 'click', 'remove from cart');     // Send data using an event.

    if (opencart)
        MiniCart.abrir();



    //ActualizarCantidadEnCarrito();

};


function ActualizarSubTotales(cant, decimales = 2, cultureInfo = 'es-AR') {
    var subtotal = parseFloat(0);
    var cantidadTotal = parseFloat(0);
    var descuentos = 0;
    $(".txtCantidad").each(function () {
        var precio = this.getAttribute("precio");
        var precioEspecial = this.getAttribute("precioEspecial");
        var cantidad = cant != undefined ? cant : parseInt(this.value);
        if (precioEspecial != 0 && precioEspecial != null) {
            descuentos += (precio - precioEspecial) * cantidad;
            precio = precioEspecial;
        }
        cantidadTotal += cantidad;
        subtotal += parseFloat((cantidad * precio).toFixed(decimales));
    });

    var subTotalText = new Intl.NumberFormat(cultureInfo).format(subtotal);

    //var subTotalText = '$ ' + subtotal.toFixed(decimales);
    $('#subtotal').text('$ ' + subTotalText);
    $('#lblSubTotalPrecio').html('$ ' + subTotalText);
    $('#lblSubTotalCantidad').html(cantidadTotal);

    if (descuentos > 0) {
        $('#eliminable').remove();
        $('#DescuentosAplicados').show();
        var row = '<tr id = "eliminable">' +
            '<td> Descuentos $: </td>' +
            '<td>' + descuentos + '</td>'
        '</tr>';

        $('#DetallesDescuentosAplicados').append(row);
    } else {
        $('#DescuentosAplicados').hide();

    }

};

// TODO: RUBY - sacar esta funcion de donde se use -> ActualizarCantidadEnCarrito - Tienen que traer ya por callback las cosas o llamar de última a MiniCart.actualizarCantidadArticulos()
function ActualizarCantidadEnCarrito() {

    $.ajax({
        type: "POST",
        url: myApp.Urls.GetCantidadArticulosCarrito,
        data: "",
        success: function (data) {
            $("#carritoCantidad").html(data.CantidadArticulos);
        }
    });
}


function EstoyEn(UrlPath) {

    var pathCompletoActual = window.location.pathname.substring(1);

    if (UrlPath.includes("/"))
        return pathCompletoActual.toLowerCase() == UrlPath.toLowerCase();

    var splitPathActual = pathCompletoActual.split('/');
    var pathActual = splitPathActual[splitPathActual.length - 1];

    return pathActual.toLowerCase() == UrlPath.toLowerCase();
};

//LoadMask = {
//    show: function (mensajeCustom) {
//        if (mensajeCustom) {
//            $('#LoadMaskMessage').text(mensajeCustom);
//        }

//        $('#loadMask').modal('show');
//    },

//    hide: function () {
//        $('#loadMask').modal('hide');
//    },
//};

function MostrarPopUp() {

    $.post(myApp.Urls.MostrarPopUp, function (data) {
        $(data).modal('show');
        $("#popUpModal").appendTo("body");
    });
};

function MostrarNotificacionError(data) {
    if (!data.Error)
        return;

    var mensaje = 'Ocurrió un error. Vuelva a intentar m&aacutes tarde';
    if (data.EsEcommerceException)
        mensaje = data.Mensaje;

    MostrarNotificacion(true, 'Atenci&oacute;n', mensaje, true);
};

function MostrarNotificacionFront(titulo, mensaje, error) {
    MostrarNotificacion(true, titulo, mensaje, error);
};

function MostrarNotificacionBack(titulo, mensaje, error) {
    MostrarNotificacion(false, titulo, mensaje, error);
};

function MostrarNotificacion(esFront, titulo, mensaje, error) {
    if (error == undefined)
        error = false;

    //Si no se le paso a mano el titulo el mensaje y el error, va al back a buscar el popupdata seteado.
    if (titulo != undefined && mensaje != undefined && error != undefined) {
        Notificacion.show(esFront, titulo, mensaje, error);
    }
    else {
        $.ajax({
            url: myApp.Urls.MostrarNotificacion,
            data: '',
            method: 'POST',
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                Notificacion.show(esFront, response.titulo, response.mensaje, response.error);
            }
        });
    }
};

Notificacion = {
    show: function (esFront, titulo, mensaje, error) {
        $.notify({
            icon: error ? "fa fa-circle" : "fa fa-check",
            title: titulo,
            message: mensaje
        }, {
            element: 'body',
            position: null,
            type: error ? "error" : "success",
            allow_dismiss: true,
            newest_on_top: false,
            showProgressbar: !error,
            placement: {
                from: "top",
                align: "right"
            },
            offset: 20,
            spacing: 10,
            z_index: 1031,
            delay: esFront ? (error ? 20000 : 400) : 0,
            animate: {
                enter: 'animated fadeInDown',
                exit: 'animated fadeOutUp'
            },
            icon_type: 'class',
            template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
                '<button type="button" aria-hidden="true" class="close" data-notify="dismiss">x</button>' +
                '<span class = "alert-{0}" data-notify="icon"></span> ' +
                '<span class = "alert-{0}" data-notify="title">{1}</span> ' +
                '<span class = "alert-{0}" data-notify="message">{2}</span>' +
                '<div class="progress" data-notify="progressbar">' +
                '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
                '</div>' +
                '<a href="{3}" target="{4}" data-notify="url"></a>' +
                '</div>'
        });
    },
};

function recargarComboHandler(cboSelector, url, paramProp) {
    return function () {
        var params = {};
        params[paramProp] = $(this).val();

        combo = $(cboSelector);
        combo.find('option').remove().end().append('<option value="">--Seleccione--</option>').val('');

        $.ajax({
            type: "POST",
            url: url,
            data: params,
            datatype: "json",
            success: function (data) {
                if (data.Error)
                    return;

                $.each(data.Lista, (i, e) => {
                    combo.append('<option value="' + e.Value + '">' + e.Text + '</option>');
                });
            }
        });
    }
}

// EXTENSIONES JQuery - si hay varias hay que sacarlas a otro archivo
$.fn.exists = function () {
    return this.length !== 0;
}

$.fn.scrollPosReaload = function () {
    if (localStorage) {
        var posReader = localStorage["posStorage"];
        if (posReader) {
            $(window).scrollTop(posReader);
            localStorage.removeItem("posStorage");
        }
        $(this).click(function (e) {
            localStorage["posStorage"] = $(window).scrollTop();
        });
        return true;
    }
    return false;
}


function delay(fn, ms) {
    let timer = 0
    return function (...args) {
        clearTimeout(timer)
        timer = setTimeout(fn.bind(this, ...args), ms || 0)
    }
}

function isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}


$(document).ajaxError(function (event, request, settings) {
    if (settings.error != undefined)
        return;

    if (settings.success == undefined)
        return;

    if (request.responseJSON) {
        if (settings.context == undefined)
            settings.success(request.responseJSON);
        else
            settings.success.bind(settings.context, request.responseJSON)();
    }
})

