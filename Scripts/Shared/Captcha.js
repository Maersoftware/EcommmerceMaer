var Captcha = {
    submitConCaptcha: function (captchaSiteKey, frmId) {
        
        grecaptcha
            .execute(captchaSiteKey, { action: frmId })
            .then(function (token) { Captcha.gRecaptchaCallback(token, frmId); });
    },

    gRecaptchaCallback: function (token, frmId) {
        
        Captcha.validarTokenGoogleRecaptchaV3(token, frmId);
    },

    validarTokenGoogleRecaptchaV3: function (token, frmId) {
        
        var params = {
            gRecaptchaToken: token
        }

        $.ajax({
            type: "POST",
            url: myApp.Urls.ValidarTokenGoogleRecaptcha,
            data: params,
            success: function (data) { Captcha.validarTokenGoogleRecaptchaV3CallBack(data, frmId); }
        });
    },

    validarTokenGoogleRecaptchaV3CallBack: function (data, frmId) {
        if (data.Error) {
            MostrarNotificacionFront("Error",data.Mensaje);
            return;
        }

        $("#" + frmId).submit();
    }
}