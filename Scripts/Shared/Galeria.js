var Galeria = {

    init: function () {
        $("div#loading").hide();

        Galeria.initEvents();
        Galeria.conectarConMiniCart();
    },

    initEvents: function () {
        $('#contenedorArticulos')
            .off('click', '.add-button')
            .on('click', '.add-button', Galeria.agregarHandler);

        $('#contenedorArticulos')
            .off('click', '.quantity-right-plus')
            .on('click', '.quantity-right-plus', Galeria.sumarHandler);

        $('#contenedorArticulos')
            .off('click', '.quantity-left-minus')
            .on('click', '.quantity-left-minus', Galeria.restarHandler);

        $('#contenedorArticulos')
            .off('keyup', '.qty-input')
            .on('keyup', '.qty-input', Galeria.cantidadKeyUpHandler);
    },

    agregarHandler: function () {
        var div = $(this).closest('.addtocart_btn');
        if (!div.exists())
            return;

        var input = div.find('.qty-input');
        var step = Galeria.getStep(div);

        input.val(step);

        Galeria.actualizarCarritoDesdeMiniatura(div);
    },

    sumarHandler: function () {
        var div = $(this).closest('.addtocart_btn');
        if (!div.exists())
            return;

        var input = div.find('.qty-input');

        var cantidad = parseInt(input.val());
        if (isNaN(cantidad) || cantidad < 0)
            cantidad = 0;

        var step = Galeria.getStep(div);

        cantidad += step;

        input.val(cantidad);

        Galeria.actualizarCarritoDesdeMiniatura(div);
    },

    restarHandler: function () {
        var div = $(this).closest('.addtocart_btn');
        if (!div.exists())
            return;

        var input = div.find('.qty-input');

        var cantidad = parseInt(input.val());
        if (isNaN(cantidad))
            cantidad = 0;
        else {
            var step = Galeria.getStep(div);

            cantidad -= step;

            if (cantidad < 0)
                cantidad = 0;
        }

        input.val(cantidad);

        Galeria.actualizarCarritoDesdeMiniatura(div);
    },

    cantidadKeyUpHandler: function () {
        var div = $(this).closest('.addtocart_btn');
        if (!div.exists())
            return;

        Galeria.actualizarCarritoDesdeMiniatura(div);
    },

    timers: {},

    actualizarCarritoDesdeMiniatura: function (div) {

        var articuloId = div.attr('articuloid'),
            input = div.find('.qty-input'),
            cantidad = input.val(),
            cantidadPrevia = input.attr('oldvalue');

        // Si es vacío no actualizo enseguida, dejo que se actualice en el callback, para darles tiempo a escribir.
        // De lo contrario, si borraba todo con backspace, inmediatamente aparecía el "Agregar" y no podía escribir el número que quería.
        if (cantidad != "")
            Galeria.actualizarBoton(div);

        // actualizo el botón pero luego seteo un timeout para mandar la info al server una vez que se termine de modificar el valor

        clearTimeout(Galeria.timers[articuloId]);

        Galeria.timers[articuloId] = setTimeout(function () {
            delete Galeria.timers[articuloId];
            Galeria.actualizarCarritoDesdeMiniaturaTimeout(articuloId, cantidad, cantidadPrevia);
        }, 1000);
    },

    actualizarCarritoDesdeMiniaturaTimeout: function (articuloId, cantidad, cantidadPrevia) {
        if (cantidad > 0) {

            var valoresPrevios = {
                ArticuloId: articuloId,
                Cantidad: cantidadPrevia
            };

            Galeria.agregar(articuloId, cantidad, "", valoresPrevios);

        } else {

            Galeria.eliminar(articuloId, cantidadPrevia);
        }
    },

    agregarAlCarritoDesdeCombo: function () {
        var talleId = parseInt($("#hiddenTalle").val());
        var colorId = parseInt($("#hiddenColor").val());
        var result = tallesYcolores.filter(function (elem) {
            return elem.TalleId == talleId && elem.ColorId == colorId;
        });

        var cantidad = $(".txtCantidad").val();
        //var precio = $("#hiddenPrecio").val();
        var observacion = $("#txtObservacionDetallePedido").val();
        if (observacion == undefined)
            observacion = '';

        var articuloId = result[0].ArticuloId;

        Galeria.agregar(articuloId, cantidad, observacion);
    },

    agregarAlCarritoDesdeGrilla: function () {
        var arr = [];

        $(".txtCantidad").each(function () {
            var cantidad = this.value == "" ? 0 : this.value;
            var articuloId = this.getAttribute("articuloId");
            var observacion = $("#txtObservacionDetallePedido").val() != undefined
                ? $("#txtObservacionDetallePedido").val()
                : $("#txtObservacionDetallePedido_" + articuloId).val();

            var p = {
                ArticuloId: articuloId,
                Cantidad: cantidad,
                Observaciones: observacion
            };
            arr.push(p);
        });

        Galeria.agregarMultiple(arr);
    },

    //#region Agregar
    agregar: function (articuloId, cantidad, obs, valoresPrevios) {
        var params = {
            ArticuloId: articuloId,
            Cantidad: cantidad,
            Observaciones: obs
        };

        if (valoresPrevios) {
            var huboCambio = valoresPrevios.Cantidad != cantidad;
            if (!huboCambio)
                return;
        }

        // TODO: RUBY - considerar pasar como parametro que datos/partial traer del callback, por si se llama de distintos lugares
        $.ajax({
            type: "POST",
            url: myApp.Urls.AgregarArticulo,
            dataType: 'json',
            data: params,
            success: function (data) { this.agregarCallback(data, valoresPrevios); },
            context: this
        });
    },

    agregarCallback: function (data, valoresPrevios) {
        if (data.Error) {
            this.actualizarDetalle(valoresPrevios);
            MostrarNotificacionError(data);
            return;
        }

        this.actualizarDetalle(data.Detalle);
        this.actualizarDetalleEnQuickView(data.Detalle);
        this.actualizarDetalleEnDetalleArticulo(data.Detalle);

        MiniCart.actualizar(data.MiniCart);
        MiniCart.actualizarCantidadArticulos(data.CantidadArticulos);

        var msj = "Hay " + data.Detalle.Cantidad + " unidades de este artículo en el carrito";
        MostrarNotificacionFront('Felicitaciones', msj);

        GoogleAnalytics.agregarArticulo(data.GoogleAnalytics)
    },
    //#endregion

    //#region Agregar Múltiple
    agregarMultiple: function (arr) {
        var params = {
            Detalles: arr
        };

        // TODO: RUBY - considerar pasar valoresPrevios para volver atrás si algo falla
        // TODO: RUBY - considerar pasar como parametro que datos/partial traer del callback, por si se llama de distintos lugares
        $.ajax({
            type: "POST",
            url: myApp.Urls.AgregarArticulos,
            dataType: 'json',
            data: params,
            success: this.agregarMultipleCallback,
            context: this
        });
    },

    agregarMultipleCallback: function (data) {
        if (data.Error) {
            MostrarNotificacionError(data);
            return;
        }

        MiniCart.actualizar(data.MiniCart);
        MiniCart.actualizarCantidadArticulos(data.CantidadArticulos);

        var msj = "Hay " + data.CantidadAgregados + " unidades de estos artículos en el carrito";
        MostrarNotificacionFront('Felicitaciones', msj);

        for (var i in data.GoogleAnalyticsList) {
            GoogleAnalytics.agregarArticulo(data.GoogleAnalyticsList[i]);
        }
    },
    //#endregion

    //#region Eliminar
    eliminar: function (articuloId, cantidadPrevia) {
        var params = {
            ArticuloId: articuloId
        };

        var valoresPrevios = {
            ArticuloId: articuloId,
            Cantidad: cantidadPrevia
        };

        // TODO: RUBY - considerar pasar como parametro que datos/partial traer del callback, por si se llama de distintos lugares
        $.ajax({
            type: "POST",
            url: myApp.Urls.QuitarArticuloMiniCart, // TODO: RUBY - por ahora uso esta llamada, luego si requiere otro callback se cambia
            dataType: 'json',
            data: params,
            success: function (data) { this.eliminarCallback(data, valoresPrevios); },
            context: this
        });
    },

    eliminarCallback: function (data, valoresPrevios) {
        if (data.Error) {
            this.actualizarDetalle(valoresPrevios);
            MostrarNotificacionError(data);
            return;
        }

        var msj = "El artículo fue eliminado correctamente";
        MostrarNotificacionFront('', msj);

        var detalle = {
            ArticuloId: valoresPrevios.ArticuloId,
            Cantidad: 0
        };

        this.actualizarDetalle(detalle);

        MiniCart.actualizar(data.MiniCart);
        MiniCart.actualizarCantidadArticulos(data.CantidadArticulos);
    },
    //#endregion

    actualizarDetalle: function (data) {
        if (data == undefined)
            return;

        var div = $('#contenedorArticulos .addtocart_btn[articuloid="' + data.ArticuloId + '"]');
        if (!div.exists())
            return;

        var input = div.find('.qty-input');
        input.val(data.Cantidad);
        input.attr('oldvalue', data.Cantidad);

        this.actualizarBoton(div);
    },

    actualizarBoton: function (div) {
        if (!div)
            return;

        var input = div.find('.qty-input');
        var cantidad = input.val();
        var boton = div.find('.qty-box');
        var isOpen = boton.hasClass('open');

        if (cantidad <= 0 && isOpen)
            boton.removeClass('open');
        else if (cantidad > 0 && !isOpen)
            boton.addClass('open');
    },

    actualizarDetalleEnQuickView: function (data) {
        if (data == undefined)
            return;

        $("#qvPartial .txtCantidad").val(data.Cantidad);
    },

    actualizarDetalleEnDetalleArticulo: function (data) {
        if (data == undefined)
            return;

        $(".seleccion-articulo-combos .qty-box .txtCantidad").val(data.Cantidad);
    },

    getStep: function (div) {
        if (div == null)
            return 1;

        var step = parseInt(div.attr('step'));
        if (isNaN(step) || step <= 0)
            return 1;

        return step;
    },

    //#region Observer MiniCart
    conectarConMiniCart: function () {
        if (typeof MiniCart == 'undefined')
            return;

        MiniCart.registrar(this.onMiniCartEliminar, 'eliminar');
        MiniCart.registrar(this.onMiniCartVaciar, 'vaciar');
    },

    onMiniCartEliminar: function (tipoEvento, articuloId) {
        var data = {
            ArticuloId: articuloId,
            Cantidad: 0
        };

        Galeria.actualizarDetalle(data);
    },

    onMiniCartVaciar: function () {

        var divs = $('#contenedorArticulos .addtocart_btn');
        divs.find('.qty-input').val(0).attr('oldvalue', 0);
        divs.find('.qty-box.open').removeClass('open');
    }
    //#endregion

};