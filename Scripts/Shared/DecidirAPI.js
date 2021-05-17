var DecidirAPI = {

    Conector: null,

    init: function (config) {

        this.formaDePagoId = config.FormaDePagoId;
        DecidirAPI.ocultar();

        DecidirAPI.initEvents();

        var conector = new Decidir(config.Url);
        DecidirAPI.Conector = conector;

        conector.setPublishableKey(config.PublicKey);
        conector.setTimeout(5000);//timeout de 5 segundos
    },

    initEvents: function () {
        //Cuando levanto la tecla leo el bin, si tiene 6 digitos busco la compania, si es menor a 6 digitos lo blanqueo
        $("#txtNroTarjeta").keyup(function (e) {
            var bin = $('#txtNroTarjeta').val();
            if (bin.length == 6) {

                var param = { bin: bin };

                $.ajax({
                    type: "POST",
                    url: myApp.Urls.GetCompaniaDeTarjeta,
                    dataType: "json",
                    data: param,
                    success: function (data) {
                        if (data.success) {
                            $('#lblCompaniaTarjeta').text(data.Tarjeta.Descripcion);
                        }
                        else {
                            $('#lblCompaniaTarjeta').text("");
                        }
                    }
                }).fail(MostrarPopUp());
            }
            if (bin.length < 6) {
                $('#lblCompaniaTarjeta').text("");
            }
        });

        FormasDePago.registrarObserver(this);
        FormasDePago.registrarExtraForm(this.formaDePagoId, $('#frmDecidir'));
        FormasDePago.registrarExtraPreSubmit(this.formaDePagoId, this.preSubmit);
    },

    formaDePagoChange: function (formaDePagoId) {
        if (this.formaDePagoId == formaDePagoId)
            this.mostrar();
        else
            this.ocultar();
    },

    preSubmit: function () {
        // copio el DNI del form principal
        var dni = $('#frmCheckout #Dni').val();
        $('#frmDecidir #txtCardHolderDocNumber').val(dni);

        var form = $('#frmDecidir')[0];
        DecidirAPI.Conector.createToken(form, DecidirAPI.procesarRespuestaToken);
    },

    procesarRespuestaToken: function (status, response) {
        if (status != 200 && status != 201) {
            var mensaje = 'Ocurrió un error'; // TODO: RUBY - ver estructura de la response para el error
            MostrarNotificacion(true, 'Error', mensaje, true);
            FormasDePago.extraPreSubmitCancelled();

        } else {

            var decidirToken = response.id || '';
            var decidirBin = response.bin || '';

            var form = $('#frmCheckout');
            $('<input type="hidden" />').attr('name', 'Token').val(decidirToken).appendTo(form);
            $('<input type="hidden" />').attr('name', 'Bin').val(decidirBin).appendTo(form);

            FormasDePago.extraPreSubmitCompleted();
        }
    },

    mostrar: function () {
        $('#frmDecidir').closest('div').show();
        //$('#frmDecidir').show();
    },

    ocultar: function () {
        $('#frmDecidir').closest('div').hide();
        //$('#frmDecidir').hide();
    }
};