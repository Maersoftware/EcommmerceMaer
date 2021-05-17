var Checkout = {

    observersTotales: [],

    init: function (config) {
        Checkout.initEvents(config);

        Checkout.conectarConMiniCart();

        if (config.HayDomicilios)
            Checkout.ocultarCargaDeNuevoDomicilio();

        $("#clave").hide();
        $("#repetirClave").hide();
        $("#subscribir").hide();

    },

    initEvents: function (config) {
        $('.checkout-confirmar').click(Checkout.preSubmit);
        $('.checkout-cargar-nuevo-domicilio').change(Checkout.cargarNuevoDomicilioHandler);

        if (!config.EsUsuarioLogueado)
            $('#Email').blur(Checkout.emailHandler);
    },

    registrarObserverTotales: function (observer) {
        if (observer != null)
            this.observersTotales.push(observer);
    },

    informarCambioTotales: function () {
        this.observersTotales.forEach(x => {
            if (x.totalesChange)
                x.totalesChange();
        });
    },

    // Estoy clavando UN solo extra form para validar y UN solo preSubmit para enviar, y todo clavado a FormasDePago
    // Se podría flexibilizar si hiciera falta no sólo para las formas de pago, pero por ahora lo dejo así simple
    preSubmit: function () {
        var form = $('#frmCheckout');
        var valid1 = form.valid();
        var valid2 = true;

        var formaDePagoForm = FormasDePago.getExtraForm();
        if (formaDePagoForm) {
            valid2 = formaDePagoForm.valid();
        }

        if (!valid1 || !valid2)
            return;

        Checkout.deshabilitarConfirmarCompra();

        var extraPreSubmit = FormasDePago.getExtraPreSubmit();
        if (extraPreSubmit) {
            extraPreSubmit();
            return;
        }

        Checkout.submit();
    },

    submit: function () {
        $('#frmCheckout').submit();
        this.habilitarConfirmarCompra();
    },

    cargarNuevoDomicilioHandler: function () {
        var chk = $(this);
        var dom = chk.closest('.checkout-domicilio');

        if (this.checked)
            Checkout.mostrarCargaDeNuevoDomicilio(dom);
        else
            Checkout.ocultarCargaDeNuevoDomicilio(dom);

        FormasDeEntrega.cargarNuevoDomicilioHandler();
    },

    emailHandler: function () {
        var email = $(this).val().trim();
        if (email == "")
            return;

        $.ajax({
            type: "POST",
            url: myApp.Urls.ExisteEmail,
            dataType: 'json',
            data: "email=" + email,
            success: function (data) { Checkout.existeEmailCallback(data, email); }
        });
    },

    existeEmailCallback: function (data, email) {
        if (data.Error) {
            //MostrarNotificacionError(data);
            return;
        }

        if (!data.Existe)
            return;

        alert("El correo ingresado ya tiene una cuenta. Ingresar o continuar como invitado.");
        // TODO: RUBY - no tiene que haber check de "continuar como invitado" o algo asi? que pasa si sique como invitado? no se crea la contraseña pero el usuario si, y se sigue validando su mail! no habria que marcado como "es invitado" en la tabla de usuarios?

        openAccount(); // abre el panel lateral para loguearse
        $('#nombreMenuLogin').val(email);
    },

    //#region Observer MiniCart
    conectarConMiniCart: function () {
        MiniCart.registrar(this.onMiniCartChange)
    },

    onMiniCartChange: function () {
        Checkout.cargarTotales();
    },

    cargarTotales: function () {
        $.ajax({
            type: "POST",
            url: myApp.Urls.GetCheckoutTotales,
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
    actualizarTotales: function (data) {
        $('.checkout-totales').html(data);

        this.informarCambioTotales();
    },

    deshabilitarConfirmarCompra: function () {
        $('.checkout-confirmar').attr('disabled', 'disabled');
    },

    habilitarConfirmarCompra: function () {
        $('.checkout-confirmar').removeAttr('disabled');
    },

    mostrarCargaDeNuevoDomicilio: function (dom) {
        if (dom) {
            dom.find('.checkout-nuevo-domicilio').show();
            dom.find('.checkout-domicilio-existente').hide();
        } else {
            $('.checkout-nuevo-domicilio').show();
            $('.checkout-domicilio-existente').hide();
        }
    },

    ocultarCargaDeNuevoDomicilio: function (dom) {
        if (dom) {
            dom.find('.checkout-nuevo-domicilio').hide();
            dom.find('.checkout-domicilio-existente').show();
        } else {
            $('.checkout-nuevo-domicilio').hide();
            $('.checkout-domicilio-existente').show();
        }
    }
    //#endregion
};