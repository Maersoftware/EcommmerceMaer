var Cuponera = {

    init: function () {
        Cuponera.initEvents();
    },

    initEvents: function () {
        $('.cuponera-nuevo-cupon').off().keypress(
            function (e) {
                if (e.which === 13)
                    Cuponera.agregarHandler();
            });

        $('.cuponera-agregar').off().click(Cuponera.agregarHandler);

        $('.cuponera-aplicados')
            .off('click', '.cuponera-detalle-eliminar')
            .on('click', '.cuponera-detalle-eliminar', Cuponera.eliminarHandler);
    },

    //#region Agregar
    agregarHandler: function () {
        var codigoCupon = Cuponera.getCodigoCupon();
        if (codigoCupon == null || codigoCupon == "")
            return;

        Cuponera.agregar(codigoCupon);
    },

    agregar: function (codigoCupon) {
        var params = {
            Codigo: codigoCupon
        };

        $.ajax({
            type: "POST",
            url: myApp.Urls.AgregarCupon,
            dataType: 'json',
            data: params,
            success: this.agregarCallback,
            context: this
        });

        this.deshabilitarNuevoCupon();
    },

    agregarCallback: function (data) {
        this.habilitarNuevoCupon();

        if (data.Error) {
            MostrarNotificacionError(data);
            return;
        }

        this.limpiarNuevoCupon();
        this.actualizarAplicados(data.Aplicados);
        MiniCart.actualizar(data.MiniCart);
        this.avisarCambios();
    },
    //#endregion

    //#region Eliminar
    eliminarHandler: function () {
        var el = this;

        var cuponId = Cuponera.getCuponId(el);
        if (cuponId == null)
            return;

        if (!confirm('¿Está seguro que desea quitar el cupón? '))
            return;

        Cuponera.eliminar(cuponId);
    },

    eliminar: function (cuponId) {
        var params = {
            CuponId: cuponId
        };

        $.ajax({
            type: "POST",
            url: myApp.Urls.QuitarCupon,
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

        this.actualizarAplicados(data.Aplicados);
        MiniCart.actualizar(data.MiniCart);
        this.avisarCambios();
    },
    //#endregion

    //#region Vaciar
    vaciarHandler: function () {
        if (!confirm('¿Está seguro que desea quitar todos los cupones? '))
            return;

        Cuponera.vaciar();
    },

    vaciar: function () {
        $.ajax({
            type: "POST",
            url: myApp.Urls.VaciarCupones,
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

        this.actualizarAplicados(data.Aplicados);
        MiniCart.actualizar(data.MiniCart);
        this.avisarCambios();
    },
    //#endregion

    //#region Observer
    listeners: [],

    registrar: function (fn) { // se podria poner un tipoEvento pero por ahora recargo todo
        this.listeners.push(fn);
    },

    avisarCambios: function () {
        var len = this.listeners.length;

        for (var i = 0; i < len; i++) {
            var fn = this.listeners[i];
            if (isFunction(fn))
                fn();
        }
    },
    //#endregion

    //#region AUX
    getCuponId: function (el) {
        var tr = $(el).closest('tr');

        var cuponId = $(tr).data('cupon-id');
        return cuponId;
    },

    getCodigoCupon: function () {
        var codigo = $('.cuponera-nuevo-cupon').val();
        if (codigo == null)
            return null;

        return codigo.trim();
    },

    actualizarAplicados: function (data) {
        $('.cuponera-aplicados').html(data);
    },

    limpiarNuevoCupon: function () {
        $('.cuponera-nuevo-cupon').val('');
    },

    habilitarNuevoCupon: function () {
        $('.cuponera-nuevo-cupon').removeAttr('disabled');
        $('.cuponera-agregar').removeAttr('disabled');
    },

    deshabilitarNuevoCupon: function () {
        $('.cuponera-nuevo-cupon').attr('disabled', 'disabled');
        $('.cuponera-agregar').attr('disabled', 'disabled');
    }
    //#endregion
};