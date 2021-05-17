(function($) {
    "use strict";
    $(document).ready(function () {
        $("#jsGrid-Cupones").jsGrid({
            width: "100%",
            autoload: true,
            filtering: true,
            confirmDeleting: false,
            paging: true,
            controller: db,
            fields: [
                {
                    headerTemplate: function() {
                        return $("<button>").attr("type", "button").text("Eliminar")
                            .addClass("btn btn-danger btn-xs btn-delete mb-0 b-r-7")
                            .click( function () { deleteSelectedItems(); });
                    },
                    itemTemplate: function(_, item) {
                        return $("<input>").attr("type", "checkbox").attr("class" , "DropClass")
                            .prop("checked", $.inArray(item, selectedItems) > -1)
                            .on("change", function () { $(this).is(":checked") ? selectItem(item) : unselectItem(item); });
                    },
                    align: "center",
                    width: 100
                },
                {
                    headerTemplate: function () {
                        return $("<button>").attr("type", "button").text("Estado").addClass("btn btn-danger btn-xs btn-delete mb-0 b-r-7")
                            .click(function () { ModificarEstadosMasivos(); });
                    },

                    itemTemplate: function (_, item) {
                        let estado = item.EstadosCupon
                        return $("<select>")
                            .append('<option value= ' + (estado[0].Value == "true" ? 1 : 0).toString() + (estado[0].Selected ? ' Selected' : '') + ' >' + estado[0].Text + '</option>')
                            .append('<option value= ' + (estado[1].Value == "false" ? 0 : 1).toString() + (estado[1].Selected ? ' Selected' : '') + ' >' + estado[1].Text + '</option>')
                            .attr("class", "form-control-xs Seleccion")
                            .on("change", function () { changeSelectecStateItem(item) });
                    },
                    align: "center",
                    width: 130
                },


                { name: "Nombre", type: "text", width: 150, autosearch: true },        
                { name: "Codigo", type: "text", width: 150, autosearch: true },        
                { name: "EsDescuentoPorcentual", type: "checkbox", width: 150, title: "Es Porcentual",  }, 
                { name: "Descuento", type: "number", width: 100, title: "Descuento" },
                { name: "ImporteMinimo", type: "number", width: 100, title: "Importe Minimo"  },
                { name: "TopeDescuento", type: "number", width: 100, title: "Tope Descuento" }
            ]
        });

        $(".config-panel input[type=checkbox]").on("click", function () {
            var $cb = $(this);
            $("#jsGrid-Cupones").jsGrid("option", $cb.attr("id"), $cb.is(":checked"));
        });

    });



    var selectedItems = [];
    var selectedCambiados = [];

    var selectItem = function(item) {
        selectedItems.push(item);
    };
    var unselectItem = function(item) {
        selectedItems = $.grep(selectedItems, function(i) {
            return i !== item;
        });
    };
    var GetCuponIdSeleccionados = function () {
        var cuponesIds = [];
        selectedItems.forEach(cupon => cuponesIds.push(cupon.Id));
        return cuponesIds;
    };

    var deleteSelectedItems = function() {
        if(!selectedItems.length || !confirm("Esta seguro que desea eliminar los cupones seleccionados?"))
            return;
        deletecuponesFromDb(selectedItems);
        var $grid = $("#batchDelete");
        $grid.jsGrid("option", "pActionIndex", 1);
        $grid.jsGrid("loadData");
        selectedItems = [];
    };

    var deletecuponesFromDb = function (deletingcupones) {
        var urlDelete = 'EliminarCupones'
        var cuponesId = GetCuponIdSeleccionados();
        $.ajax({
            type: "POST",
            url: urlDelete,
            data: { cuponesIds: cuponesId }, 
            success: function (data) {
                db.cupones = $.map(db.cupones, function (cupon) {
                    var evt = new CustomEvent('respuestaBack', { detail: data });
                    window.dispatchEvent(evt);

                    return ($.inArray(cupon, deletingcupones) > -1) ? null : cupon;
                    hayRespuesta();
                });
            },
            error: function (error) {
                //console.log(error);
            }
        })
    };



    var agregarCambiado = function (item) {
        selectedCambiados.push(item);
    };
    var quitarCambiado = function (item) {
        selectedCambiados = $.grep(selectedCambiados, function (i) {
            return i !== item;
        });
    };
    var changeSelectecStateItem = function (item) {
        if (item.ParaCambioEstado)
            quitarCambiado(item);
        else
            agregarCambiado(item);

        item.ParaCambioEstado = !item.ParaCambioEstado;
        item.NuevoEstado = !item.NuevoEstado;
    };


    var quitarCambiado = function (item) {
        selectedCambiados = $.grep(selectedCambiados, function (i) {
            return i !== item;
        });
    };

    var agregarCambiado = function (item) {
        selectedCambiados.push(item);
    };


    var hayRespuesta = function () {
        var ev = new CustomEvent("respuestaBack");
        window.dispatchEvent(ev);
    };
    var ModificarEstadosMasivos = function ()
    {
        if (!selectedCambiados.length || !confirm("Esta seguro que desea modificar los cupones seleccionados?"))
            return;

        var urlUpdate = 'ModificarEstadoCupones'
        var data = GetAlCuponesParaModificar();

        if (!data.length)
            return;

        $.ajax({
            type: "POST",
            url: urlUpdate,
            data: { cupones: data },
            success: function (data) {
                hayRespuesta();
                selectedCambiados = []
            },
            error: function (error) {
                //console.log(error);
            }
        })
    }

    var GetAlCuponesParaModificar = function ()
    {
        var Modificados = []
        selectedCambiados.forEach(cupon => {
            if (cupon.Estado != cupon.NuevoEstado)
            {
                cupon.Estado = cupon.NuevoEstado;
                Modificados.push(cupon);
            }
        });
        return Modificados;
    }

})(jQuery);
