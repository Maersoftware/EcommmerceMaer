var MiniCart = {

    init: function () {
        MiniCart.initEvents();
    },

    initEvents: function () {
        $('#cart_side')
            .off('click', '.minicart-detalle-eliminar')
            .on('click', '.minicart-detalle-eliminar', MiniCart.eliminarHandler);

        $('#cart_side')
            .off('click', '.minicart-vaciar')
            .on('click', '.minicart-vaciar', MiniCart.vaciarHandler);
    },

    abrir: function () {
        $("#cart_side").addClass('open-side');
    },

    cerrar: function () {
        $("#cart_side").removeClass('open-side');
    },

    //#region Actualizar
    actualizar: function (data) {
        if (data) {
            if (data.Error)
                return;

            this.doActualizar(data);
            return;
        }

        this.getAndUpdate();
    },

    getAndUpdate: function () {
        $.ajax({
            type: "POST",
            url: myApp.Urls.ActualizarMiniCart,
            dataType: 'json',
            success: this.getAndUpdateCallback,
            context: this
        });
    },

    getAndUpdateCallback: function (data) {
        if (data.Error)
            return;

        this.doActualizar(data.MiniCart);
        this.doActualizarCantidadArticulos(data.CantidadArticulos);
    },
    //#endregion

    //#region Actualizar CantidadArticulos
    actualizarCantidadArticulos: function (data) {
        if (data) {
            if (data.Error)
                return;

            this.doActualizarCantidadArticulos(data);
            return;
        }

        this.getAndUpdateCantidadArticulos();
    },

    getAndUpdateCantidadArticulos: function () {
        $.ajax({
            type: "POST",
            url: myApp.Urls.GetCantidadArticulosCarrito,
            dataType: 'json',
            success: this.getAndUpdateCantidadArticulosCallback,
            context: this
        });
    },

    getAndUpdateCantidadArticulosCallback: function (data) {
        if (data.Error)
            return;

        this.doActualizarCantidadArticulos(data.CantidadArticulos);
    },
    //#endregion
  

    //#region Eliminar
    eliminarHandler: function () {
        var el = this;

        var articuloId = MiniCart.getArticuloId(el);
        if (articuloId == null)
            return;

        if (!confirm('¿Está seguro que desea eliminar el artículo? '))
            return;

        MiniCart.eliminar(articuloId);
    },

    eliminar: function (articuloId) {
        var params = {
            ArticuloId: articuloId
        };

        $.ajax({
            type: "POST",
            url: myApp.Urls.QuitarArticuloMiniCart,
            dataType: 'json',
            data: params,
            success: function (data) {
                this.eliminarCallback(data, articuloId);
            },
            context: this
        });
    },

    eliminarCallback: function (data, articuloId) {
        if (data.Error) {
            MostrarNotificacionError(data);
            return;
        }

        this.actualizar(data.MiniCart);
        this.actualizarCantidadArticulos(data.CantidadArticulos);
        this.avisarCambios('eliminar', articuloId);

        GoogleAnalytics.eliminarArticulo(data.GoogleAnalytics);
    },
    //#endregion

    //#region Vaciar
    vaciarHandler: function () {
        if (!confirm('¿Está seguro que desea vaciar el carrito? '))
            return;

        MiniCart.vaciar();
    },

    vaciar: function () {
        $.ajax({
            type: "POST",
            url: myApp.Urls.VaciarCarritoMiniCart,
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

        this.actualizar(data.MiniCart);
        this.actualizarCantidadArticulos(data.CantidadArticulos);
        this.avisarCambios('vaciar');

        for (var i in data.GoogleAnalyticsList) {
            GoogleAnalytics.eliminarArticulo(data.GoogleAnalyticsList[i]);
        }
    },
    //#endregion

    //#region Observer
    listeners: [],

    registrar: function (fn, tipoEvento) { // si no le pasa tipoEvento, avisa para todos los eventos
        var listener = {
            fn: fn,
            tipoEvento: tipoEvento
        };
        this.listeners.push(listener);
    },

    avisarCambios: function (tipoEvento, ...args) {
        this.listeners.forEach(function (listener) {
            if (listener.tipoEvento == tipoEvento || listener.tipoEvento == undefined) {
                if (isFunction(listener.fn))
                    listener.fn(tipoEvento, ...args);
            }
        });
    },
    //#endregion

    //#region AUX
    getArticuloId: function (el) {
        var li = $(el).closest('li');

        var articuloId = $(li).data('articulo-id');
        return articuloId;
    },

    doActualizar: function (data) {
        $('#cart_side').html(data);
    },

    doActualizarCantidadArticulos: function (data) {
        var cant = Math.trunc(data);
        $('#carritoCantidad').html(cant);
    }

    //#endregion
};