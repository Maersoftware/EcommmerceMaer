var MercadoPagoAPI = {

    init: function (config) {

        this.formaDePagoId = config.FormaDePagoId;
        MercadoPagoAPI.ocultar();
        MercadoPagoAPI.actualizarTransactionAmount();

        MercadoPagoAPI.initEvents();
        MercadoPagoAPI.initFormValidation();

        window.Mercadopago.setPublishableKey(config.PublicKey);
        window.Mercadopago.getIdentificationTypes();
    },

    initEvents: function () {
        $('#cardNumber').on('change', this.guessPaymentMethod);

        FormasDePago.registrarObserver(this);
        FormasDePago.registrarExtraForm(this.formaDePagoId, $('#frmMercadoPago'));
        FormasDePago.registrarExtraPreSubmit(this.formaDePagoId, this.preSubmit);

        Checkout.registrarObserverTotales(this);
    },

    formaDePagoChange: function (formaDePagoId) {
        if (this.formaDePagoId == formaDePagoId)
            this.mostrar();
        else
            this.ocultar();
    },

    totalesChange: function () {
        this.actualizarTransactionAmount();
        this.actualizarInstallments();
    },

    preSubmit: function () {
        // copio Email y dni del form principal
        var email = $('#frmCheckout #Email').val();
        $('#frmMercadoPago #email').val(email);

        $('#frmMercadoPago #docType').val('DNI'); // le estoy clavando el tipo

        var dni = $('#frmCheckout #Dni').val();
        $('#frmMercadoPago #docNumber').val(dni);


        var form = $('#frmMercadoPago')[0];
        window.Mercadopago.createToken(form, MercadoPagoAPI.procesarRespuestaToken);
        // Esto puede tirar una EXCEPTION (por ejemplo si en produccion no se usa SSL (https) o el PublicKey no contiene el string 'TEST')
        // Pero no sirve de nada poner el try/catch porque no la lanza el método este, sino llamadas AJAX de entre medio, 
        // ni siquiera llega a la callback que le paso acá.
        // Si pasa eso, hoy por hoy el boton de SUBMIT quedaría DESHABILITADO
    },

    procesarRespuestaToken: function (status, response) {
        if (status != 200 && status != 201) {
            var mensaje = 'Ocurrió un error: ' + MercadoPagoAPI.getErrorMessage(response);
            MostrarNotificacion(true, 'Error', mensaje, true);
            FormasDePago.extraPreSubmitCancelled();

        } else {

            var mercadoPagoToken = response.id || '';

            var form = $('#frmCheckout');
            $('<input type="hidden" />').attr('name', 'Token').val(mercadoPagoToken).appendTo(form);

            FormasDePago.extraPreSubmitCompleted();
        }
    },

    //#region SACADOS DE LA PAGINA DE MP
    guessPaymentMethod: function (event) {
        let cardnumber = $("#cardNumber").val();
        if (cardnumber.length >= 6) {
            let bin = cardnumber.substring(0, 6);
            window.Mercadopago.getPaymentMethod({
                "bin": bin
            }, MercadoPagoAPI.setPaymentMethod);
        }
    },

    setPaymentMethod: function (status, response) {
        if (status == 200) {
            let paymentMethod = response[0];
            $('#paymentMethodId').val(paymentMethod.id);

            MercadoPagoAPI.getIssuers(paymentMethod.id);
        } else {
            MostrarNotificacion(true, 'Error', 'No se pudo obtener el método de pago', true);
        }
    },

    getIssuers: function (paymentMethodId) {
        window.Mercadopago.getIssuers(
            paymentMethodId,
            MercadoPagoAPI.setIssuers
        );
    },

    setIssuers: function (status, response) {
        if (status == 200) {
            let issuerSelect = $('#issuer');
            issuerSelect.children().remove().end();

            response.forEach(issuer => {
                $('<option></option>').val(issuer.id).text(issuer.name).appendTo(issuerSelect);
            });

            MercadoPagoAPI.actualizarInstallments();
        } else {
            MostrarNotificacion(true, 'Error', 'No se pudieron obtener los bancos emisores', true);
        }
    },

    actualizarInstallments: function () {
        this.getInstallments(
            $('#paymentMethodId').val(),
            $('#transactionAmount').val(),
            $('#issuer').val()
        );
    },

    getInstallments: function (paymentMethodId, transactionAmount, issuerId) {
        window.Mercadopago.getInstallments({
            "payment_method_id": paymentMethodId,
            "amount": parseFloat(transactionAmount),
            "issuer_id": parseInt(issuerId)
        }, MercadoPagoAPI.setInstallments);
    },

    setInstallments: function (status, response) {
        if (status == 200) {
            var instSelect = $('#installments');
            instSelect.children().remove().end();

            response[0].payer_costs.forEach(payerCost => {
                $('<option></option>').val(payerCost.installments).text(payerCost.recommended_message).appendTo(instSelect);
            });
        } else {
            MostrarNotificacion(true, 'Error', 'No se pudieron obtener las opciones de cuotas disponibles', true);
        }
    },

    actualizarTransactionAmount: function () {
        var transacionAmount = $('#importeTotal').attr('value');
        $('#transactionAmount').val(transacionAmount);
    },

    mostrar: function () {
        $('#frmMercadoPago').closest('div').show();
        //$('#frmMercadoPago').show();
    },

    ocultar: function () {
        $('#frmMercadoPago').closest('div').hide();
        //$('#frmMercadoPago').hide();
    },

    initFormValidation: function () {
        var req = 'Este campo es requerido';

        $("#frmMercadoPago").validate({
            errorElement: 'span',
            errorClass: 'text-danger',
            rules: {
                cardNumber: 'required',
                securityCode: 'required',
                cardExpirationMonth: 'required',
                cardExpirationYear: 'required',
                issuer: 'required',
                cardholderName: 'required',
                installments: 'required'
            },
            messages: {
                cardNumber: req,
                securityCode: req,
                cardExpirationMonth: req,
                cardExpirationYear: req,
                issuer: req,
                cardholderName: req,
                installments: req
            }
        });
    },

    getErrorCode: function (response) {
        if (response == null)
            return '';

        var err = response.cause;
        if (err == null)
            return '';

        var esUnArray = err.length != undefined;
        if (!esUnArray)
            return err.code;

        if (err.length == 0)
            return '';

        return err[0].code;
    },

    getErrorMessage: function (response) {
        var code = this.getErrorCode(response);

        switch (code) {
            case '205': return 'Ingresa el número de tu tarjeta.';
            case '208': return 'Elige un mes.';
            case '209': return 'Elige un año.';
            case '212': return 'Ingresa tu tipo de documento.';
            case '213': return 'Ingresa tu documento.';
            case '214': return 'Ingresa tu documento.';
            case '220': return 'Ingresa tu banco.';
            case '221': return 'Ingresa el nombre y apellido.';
            case '224': return 'Ingresa el código de seguridad.';
            case 'E301': return 'Ingresa un número de tarjeta válido.';
            case 'E302': return 'Revisa el código de seguridad.';
            case '316': return 'Ingresa un nombre válido.';
            case '322': return 'El tipo de documento es inválido.';
            case '323': return 'Revisa tu documento.';
            case '324': return 'El documento es inválido.';
            case '325': return 'El mes es inválido.';
            case '326': return 'El año es inválido.';
            default: return 'Revisa los datos.';
        }
    }
    //#endregion
};

// Creo que hay que tener en cuenta esto también: https://www.mercadopago.com.ar/developers/es/guides/resources/localization/considerations-argentina
// Hay que mostrar el costo financiero total (CFT) y la tasa de interés efectiva anual (TEA) aplicada con las cuotas.
// Ahi en el link hay scripts para usar