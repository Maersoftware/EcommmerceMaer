var FormasDeEntrega = {

    init: function (config) {
        FormasDeEntrega.initEvents();

        if (config.EsRetiro)
            FormasDeEntrega.ocultarDomicilioDeEntrega();

        if (!config.HayRetiroYEnvio)
            FormasDeEntrega.esRetiro = config.EsRetiro; // lo guardo para usarlo después porque no genero los radiobuttons para obtener el valor de ahí si no HayRetiroYEnvio

        if (config.HayFormaDeEntregaUnica)
            FormasDeEntrega.ocultarFormasDeEntrega();

        if (config.UsarDomicilioDeFacturacionParaEntrega)
            FormasDeEntrega.ocultarDomicilioDeEntregaDetalles();

        FormasDeEntrega.DomiciliosDatosExtra = config.DomiciliosDatosExtra;
        FormasDeEntrega.ProvinciasDatosExtra = config.ProvinciasDatosExtra;

        if (config.FormaDeEntregaId > 0)
            FormasDeEntrega.setFormaDeEntrega(config.FormaDeEntregaId, config.ServicioDeEnvioId, config.PuntoDeRetiroId);

        FormasDeEntrega.recargaActiva = true;

        // lo pongo separado para que quede bien explícito, que si hay forma única no recarga las formas de entrega
        if (config.HayFormaDeEntregaUnica)
            FormasDeEntrega.recargaActiva = false;
    },

    initEvents: function () {
        $('input[name="EsRetiro"]').change(FormasDeEntrega.esRetiroHandler); // ahí también llama a cargarHandler

        $('#DomicilioDeFacturacion_DomicilioId').change(FormasDeEntrega.cargarHandler);
        $('#DomicilioDeFacturacion_Detalle_ProvinciaId').change(FormasDeEntrega.cargarHandler);
        $('#DomicilioDeFacturacion_Detalle_CodigoPostal').blur(FormasDeEntrega.cargarHandler);
        $('#DomicilioDeEntrega_DomicilioId').change(FormasDeEntrega.cargarHandler);
        $('#DomicilioDeEntrega_Detalle_ProvinciaId').change(FormasDeEntrega.cargarHandler);
        $('#DomicilioDeEntrega_Detalle_CodigoPostal').blur(FormasDeEntrega.cargarHandler);
        // acá deberían ir los eventos de los componentes que modifiquen las formas de entrega posibles

        // los checkout-cargar-nuevo-domicilio disparan el evento desde Checkout

        $('.checkout-formas-de-entrega-detalles')
            .off('click', 'input')
            .on('click', 'input', FormasDeEntrega.setValoresEntrega);

        $('#UsarDomicilioDeFacturacionParaEntrega').change(FormasDeEntrega.usarDomicilioDeFacturacionParaEntregaHandler); // ahí también llama a cargarHandler
    },

    cargarHandler: function () {
        if (!FormasDeEntrega.recargaActiva)
            return;

        var params = FormasDeEntrega.getParams();
        if (params == null || !FormasDeEntrega.validarParametros(params))
            return;

        if (!FormasDeEntrega.huboCambios(params))
            return;

        FormasDeEntrega.cargar(params);
    },

    cargar: function (params) {
        // tal vez habría que poner un "cargardo..." en las formas de entrega

        this.lastParams = params;
        this.guardarUltimaFormaDeEntrega();
        this.mostrarCargando();

        $.ajax({
            type: "POST",
            url: myApp.Urls.GetCotizacionesEnvio,
            dataType: 'json',
            data: params,
            success: this.cargarCallback,
            context: this
        });
    },

    cargarCallback: function (data) {
        this.vaciar();

        if (data.Error) {
            this.lastParams = null; // borro los últimos parametros para que intente de nuevo
            MostrarNotificacionError(data);
            return;
        }

        this.actualizar(data.FormasDeEntrega);
        this.restaurarUltimaFormaDeEntrega();
    },

    usarDomicilioDeFacturacionParaEntregaHandler: function () {
        if (this.checked)
            FormasDeEntrega.ocultarDomicilioDeEntregaDetalles();
        else
            FormasDeEntrega.mostrarDomicilioDeEntregaDetalles();

        FormasDeEntrega.cargarHandler();
    },

    esRetiroHandler: function () {
        var esRetiro = $('#EsRetiro:checked').val() == 'True';

        if (esRetiro)
            FormasDeEntrega.ocultarDomicilioDeEntrega();
        else
            FormasDeEntrega.mostrarDomicilioDeEntrega();

        FormasDeEntrega.cargarHandler();
    },

    cargarNuevoDomicilioHandler: function () { // viene desde Checkout porque se tiene que disparar después de mostrar/ocultar los componentes

        FormasDeEntrega.cargarHandler();
    },

    //#region AUX
    //#region GET PARAMETROS
    getParams: function () {
        var chkMismoDom = $('#UsarDomicilioDeFacturacionParaEntrega');
        var rbEsRetiro = $('#EsRetiro:checked');

        var params = {
            EsRetiro: false,
            CodigoPostal: '',
            PaisId: 0
        };

        if (rbEsRetiro.exists())
            params.EsRetiro = rbEsRetiro.val() == 'True';
        else
            params.EsRetiro = this.esRetiro;

        if (params.EsRetiro)
            return params;

        if (chkMismoDom.exists() && chkMismoDom.is(':checked'))
            return this.getParamsFromFacturacion(params);

        return this.getParamsFromEntrega(params);
    },

    getParamsFromFacturacion: function (params) {
        var cboDomicilio = $('#DomicilioDeFacturacion_DomicilioId');
        var txtCodigoPostal = $('#DomicilioDeFacturacion__Detalle_CodigoPostal');
        var cboProvincia = $('#DomicilioDeFacturacion_Detalle_ProvinciaId');

        return this.getParamsFromComponents(params, cboDomicilio, txtCodigoPostal, cboProvincia);
    },

    getParamsFromEntrega: function (params) {
        var cboDomicilio = $('#DomicilioDeEntrega_DomicilioId');
        var txtCodigoPostal = $('#DomicilioDeEntrega_Detalle_CodigoPostal');
        var cboProvincia = $('#DomicilioDeEntrega_Detalle_ProvinciaId');

        return this.getParamsFromComponents(params, cboDomicilio, txtCodigoPostal, cboProvincia);
    },

    getParamsFromComponents: function (params, cboDomicilio, txtCodigoPostal, cboProvincia) {
        if (cboDomicilio.is(':visible')) {
            var domicilioId = cboDomicilio.val();
            return this.getParamsFromDatosExtra(params, domicilioId);
        }

        params.CodigoPostal = txtCodigoPostal.val();

        var provinciaId = cboProvincia.val();
        params.PaisId = this.getPaisId(provinciaId);

        return params;
    },

    getParamsFromDatosExtra: function (params, domicilioId) {
        if (this.DomiciliosDatosExtra == null || this.DomiciliosDatosExtra.length == undefined)
            return params;

        var it = this.DomiciliosDatosExtra.find(x => x.Id == domicilioId);
        if (it == null)
            return params;

        params.CodigoPostal = it.CodigoPostal;
        params.PaisId = it.PaisId;
        return params;
    },

    getPaisId: function (provinciaId) {
        if (this.ProvinciasDatosExtra == null || this.ProvinciasDatosExtra.length == undefined)
            return 0;

        var it = this.ProvinciasDatosExtra.find(x => x.Id == provinciaId);
        if (it == null)
            return 0;

        return it.PaisId;
    },
    //#endregion

    validarParametros: function (params) {
        // Por ahora CANCELO la validacion, porque si hay formas cargadas y cambio algo pero la validacion falla, quedan las formas anteriores igual como actuales
        // Si no, habría que hacer que se borren y ponga algun cartel de "ingrese los datos para conocer las formas de entrega"

        //if (!params.EsRetiro) {
        //    if (params.CodigoPostal == null || params.CodigoPostal.trim() == "")
        //        return false;

        //    if (params.PaisId == 0)
        //        return false;
        //}

        return true;
    },

    huboCambios: function (params) {
        if (this.lastParams == null)
            return true;

        if (this.lastParams.CodigoPostal != params.CodigoPostal)
            return true;

        if (this.lastParams.PaisId != params.PaisId)
            return true;

        if (this.lastParams.EsRetiro != params.EsRetiro)
            return true;

        return false;
    },

    vaciar: function () {
        $('#FormaDeEntregaId').val('');
        $('#ServicioDeEnvioId').val(0);
        $('#PuntoDeRetiroId').val(0);
    },

    setValoresEntrega: function () {
        var rb = this;
        var formaDeEntregaId = $(rb).val();
        var servicioDeEnvioId = $(rb).attr('servicioDeEnvioId');
        var puntoDeRetiroId = $(rb).attr('puntoDeRetiroId');

        $('#FormaDeEntregaId').val(formaDeEntregaId);
        $('#ServicioDeEnvioId').val(servicioDeEnvioId);
        $('#PuntoDeRetiroId').val(puntoDeRetiroId);

        // tengo que validar para que desaparezca el mensaje de error si había
        var validator = $('#frmCheckout').validate();
        validator.element('#FormaDeEntregaId');
    },

    setFormaDeEntrega: function (formaDeEntregaId, servicioDeEnvioId, puntoDeRetiroId) {
        $('.checkout-formas-de-entrega-detalles input').each(function () {
            var formaId = $(this).val();
            var servicioId = $(this).attr('servicioDeEnvioId');
            var puntoId = $(this).attr('puntoDeRetiroId');

            if (formaId == formaDeEntregaId && servicioId == servicioDeEnvioId && puntoId == puntoDeRetiroId) {
                $(this).prop("checked", true).trigger("click");
                return false;
            }
        })
    },

    actualizar: function (data) {
        $('.checkout-formas-de-entrega-detalles').html(data);
    },

    ocultarFormasDeEntrega: function () {
        $('.checkout-formas-de-entrega').hide();
    },

    ocultarDomicilioDeEntrega: function () {
        $('.checkout-domicilio-de-entrega').hide();
    },

    mostrarDomicilioDeEntrega: function () {
        $('.checkout-domicilio-de-entrega').show();
    },

    ocultarDomicilioDeEntregaDetalles: function () {
        $('.checkout-domicilio-de-entrega-detalles').hide();
    },

    mostrarDomicilioDeEntregaDetalles: function () {
        $('.checkout-domicilio-de-entrega-detalles').show();
    },

    guardarUltimaFormaDeEntrega: function () {
        this.ultimaFormaDeEntrega = {
            formaDeEntregaId: $('#FormaDeEntregaId').val(),
            servicioDeEnvioId: $('#ServicioDeEnvioId').val(),
            puntoDeRetiroId: $('#PuntoDeRetiroId').val()
        };
    },

    mostrarCargando: function () {
        this.vaciar();
        this.actualizar('Cargando...');
    },

    restaurarUltimaFormaDeEntrega: function () {
        if (this.ultimaFormaDeEntrega == null)
            return;

        this.setFormaDeEntrega(
            this.ultimaFormaDeEntrega.formaDeEntregaId,
            this.ultimaFormaDeEntrega.servicioDeEnvioId,
            this.ultimaFormaDeEntrega.puntoDeRetiroId);

        this.ultimaFormaDeEntrega = null;
    }
    //#endregion
};