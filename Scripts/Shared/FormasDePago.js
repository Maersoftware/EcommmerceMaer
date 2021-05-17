var FormasDePago = {

    observers: [],
    extraForms: [],
    extraPreSubmits: [],

    clickHandler: function (rb) {
        var formaDePagoId = parseInt($(rb).val());

        FormasDePago.informarCambio(formaDePagoId);
    },

    registrarObserver: function (observer) {
        if (observer != null)
            this.observers.push(observer);
    },

    informarCambio: function (formaDePagoId) {
        this.observers.forEach(x => {
            if (x.formaDePagoChange)
                x.formaDePagoChange(formaDePagoId);
        });
    },

    registrarExtraForm: function (formaDePagoId, form) {
        this.extraForms.push({ formaDePagoId, form });
    },

    registrarExtraPreSubmit: function (formaDePagoId, preSubmit) {
        this.extraPreSubmits.push({ formaDePagoId, preSubmit });
    },

    getExtraForm: function () {
        var formaDePagoId = this.getFormaDePagoId();
        var it = this.extraForms.find(x => x.formaDePagoId == formaDePagoId);
        if (it)
            return it.form;
    },

    getExtraPreSubmit: function () {
        var formaDePagoId = this.getFormaDePagoId();
        var it = this.extraPreSubmits.find(x => x.formaDePagoId == formaDePagoId);
        if (it)
            return it.preSubmit;
    },

    getFormaDePagoId: function () {
        return $('input[name="FormaDePagoId"]:checked').val();
    },

    extraPreSubmitCompleted: function () {
        Checkout.submit();
    },

    extraPreSubmitCancelled: function () {
        Checkout.habilitarConfirmarCompra();
    }
};