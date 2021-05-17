var Carrito = {

    init: function () {
        Carrito.initEvents();

        Carrito.conectarConMiniCart();
        Carrito.conectarConCuponera();
    },

    initEvents: function () {
        $('.carrito-completo')
            .off('click', '.carrito-detalle-eliminar')
            .on('click', '.carrito-detalle-eliminar', Carrito.eliminarHandler);

        $('.carrito-completo')
            .off('keyup', '.carrito-detalle-cantidad')
            .on('keyup', '.carrito-detalle-cantidad', delay(Carrito.setDetalleCarritoHandler, 500));

        $('.carrito-completo')
            .off('keyup', '.carrito-detalle-observaciones')
            .on('keyup', '.carrito-detalle-observaciones', delay(Carrito.setDetalleCarritoHandler, 500));
    },

    //#region SetDetalleCarrito
    setDetalleCarritoHandler: function () {
        var el = this;

        var params = Carrito.getParams(el);
        if (params == null || !params.HuboCambio)
            return;

        Carrito.setDetalleCarrito(params.ArticuloId, params.Cantidad, params.Observaciones, params.ValoresPrevios);
    },

    setDetalleCarrito: function (articuloId, cantidad, obs, valoresPrevios) {
        var params = {
            ArticuloId: articuloId,
            Cantidad: cantidad,
            Observaciones: obs
        };

        $.ajax({
            type: "POST",
            url: myApp.Urls.SetDetalleCarrito,
            dataType: 'json',
            data: params,
            success: function (data) {
                this.setDetalleCarritoCallback(data, valoresPrevios);
            },
            context: this
        });

        // TODO: RUBY - habría que poner un loading y deshabilitar edicion tal vez
    },

    setDetalleCarritoCallback: function (data, valoresPrevios) {
        if (data.Error) {
            MostrarNotificacionError(data);
            this.actualizarDetalle(valoresPrevios);
            return;
        }

        this.actualizarDetalle(data.Detalle);
        this.actualizarTotales(data.Totales);
        MiniCart.actualizar(data.MiniCart);
        MiniCart.actualizarCantidadArticulos(data.CantidadArticulos);
        this.borrarMensajeAlerta();
        // alguna notificacion?? ocultar un loading por ejemplo       
        GoogleAnalytics.agregarArticulo(data.GoogleAnalytics)
        
    },
    //#endregion

    //#region Eliminar
    eliminarHandler: function () {
        var el = this;

        var params = Carrito.getParams(el);
        if (params == null)
            return;

        if (!confirm('¿Está seguro que desea eliminar el artículo del carrito?'))
            return;

        Carrito.eliminar(params.ArticuloId);
    },

    eliminar: function (articuloId) {
        var params = {
            ArticuloId: articuloId
        };

        $.ajax({
            type: "POST",
            url: myApp.Urls.QuitarArticulo,
            dataType: 'json',
            data: params,
            success: this.eliminarCallback,
            context: this
        });
    },

    eliminarCallback: function (data) {
        if (data.Error) {
            MostrarNotificacionError(data);
            return;
        }

        this.actualizarCompleto(data.Completo);
        MiniCart.actualizar(data.MiniCart);
        MiniCart.actualizarCantidadArticulos(data.CantidadArticulos);

        GoogleAnalytics.eliminarArticulo(data.GoogleAnalytics)
    },
    //#endregion

    //#region Vaciar
    vaciarHandler: function () {        
        if (!confirm('¿Está seguro que desea vaciar el carrito? '))
            return;

        Carrito.vaciar();
    },

    vaciar: function () {
        $.ajax({
            type: "POST",
            url: myApp.Urls.VaciarCarrito,
            dataType: 'json',
            success: this.vaciarCallback,
            context: this
        });
    },

    vaciarCallback: function (data) {
        if (data.Error) {
            MostrarNotificacionError(data);
            return;
        }

        this.actualizarCompleto(data.Completo);
        MiniCart.actualizar(data.MiniCart);
        MiniCart.actualizarCantidadArticulos(data.CantidadArticulos);

        for (var i in data.GoogleAnalyticsList) {
            GoogleAnalytics.eliminarArticulo(data.GoogleAnalyticsList[i]);
        }
    },
    //#endregion

    //#region Observer MiniCart
    conectarConMiniCart: function () {
        MiniCart.registrar(this.onMiniCartChange)
    },

    onMiniCartChange: function () {
        Carrito.cargarCompleto();
    },

    cargarCompleto: function () {
        $.ajax({
            type: "POST",
            url: myApp.Urls.GetCarritoContenido,
            dataType: 'json',
            success: this.cargarCompletoCallback,
            context: this
        });
    },

    cargarCompletoCallback: function (data) {
        if (data.Error)
            return;

        this.actualizarCompleto(data.Completo);
    },
    //#endregion

    //#region Observer Cuponera
    conectarConCuponera: function () {
        if (typeof Cuponera != "undefined")
            Cuponera.registrar(this.onCuponeraChange)
    },

    onCuponeraChange: function () {
        Carrito.cargarTotales();
    },

    cargarTotales: function () {
        $.ajax({
            type: "POST",
            url: myApp.Urls.GetCarritoTotales,
            dataType: 'json',
            success: this.cargarTotalesCallback,
            context: this
        });
    },

    cargarTotalesCallback: function (data) {
        if (data.Error)
            return;

        this.actualizarTotales(data.Totales);
    },
    //#endregion

    //#region AUX
    getParams: function (el) {
        var tr = $(el).closest('tr');

        var articuloId = $(tr).data('articulo-id');
        if (articuloId == null)
            return;

        var txtCantidad = $(tr).find('.carrito-detalle-cantidad');
        if (!txtCantidad.exists())
            return;

        var cantidad = parseFloat(txtCantidad.val());
        var cantidadAnterior = parseFloat(txtCantidad.attr('oldvalue'));
        if (isNaN(cantidad)) cantidad = 0;
        if (isNaN(cantidadAnterior)) cantidadAnterior = 0;

        var obs = obsAnterior = '';
        var txtObs = $(tr).find('.carrito-detalle-observaciones');
        if (txtObs.exists()) {
            obs = txtObs.val();
            obsAnterior = txtObs.attr('oldvalue');
        }

        var huboCambio = cantidad != cantidadAnterior || obs != obsAnterior

        var params = {
            ArticuloId: articuloId,
            Cantidad: cantidad,
            Observaciones: obs,

            HuboCambio: huboCambio,

            ValoresPrevios: {
                ArticuloId: articuloId,
                Cantidad: cantidadAnterior,
                Observaciones: obsAnterior
            }
        };

        return params;
    },

    borrarMensajeAlerta: function () {
        $('.mensaje-alerta').remove();        
    },

    actualizarDetalle: function (data) {
        var tr = $('tr[data-articulo-id=' + data.ArticuloId + ']');
        if (!tr.exists()) 
            return;

        var txtCantidad = tr.find('.carrito-detalle-cantidad');
        txtCantidad.val(data.Cantidad);
        txtCantidad.attr('oldvalue', data.Cantidad);

        var obs = data.Observaciones ?? '';
        var txtObs = tr.find('.carrito-detalle-observaciones');
        txtObs.val(obs);
        txtObs.attr('oldvalue', obs);

        if (data.Importe != null)
            tr.find('.carrito-detalle-importe').html(data.Importe);

        if (data.Cantidad != 0 && data.UnidadesXCaja > 1 && data.Cantidad % data.UnidadesXCaja != 0)
            $(tr.next('.carrito-detalle-error-unidades')).show();
        else
            $(tr.next('.carrito-detalle-error-unidades')).hide();
    },

    actualizarTotales: function (data) {
        $('.carrito-totales').html(data);
    },

    actualizarCompleto: function (data) {
        $('.carrito-completo').html(data);
    }
    //#endregion
};