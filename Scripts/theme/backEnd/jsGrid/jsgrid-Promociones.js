(function($) {
    "use strict";

    $(document).ready(function () {
        $("#jsGrid-Promociones").jsGrid({
            width: "100%",
            autoload: true,
            filtering: true,
            confirmDeleting: false,
            paging: true,
            controller: {
                loadData: function () {
                    return db.Promociones;
                }
            },
            fields: [
                {
                    headerTemplate: function () {
                        return $("<button>").attr("type", "button").text("Eliminar")
                            .addClass("btn btn-danger btn-xs btn-delete mb-0 b-r-7")
                            .click(function () { deleteSelectedItems(); });
                    },
                    itemTemplate: function (_, item) {
                        return $("<input>").attr("type", "checkbox").attr("class", "DropClass")
                            .prop("checked", $.inArray(item, selectedItems) > -1)
                            .on("change", function () { $(this).is(":checked") ? selectItem(item) : unselectItem(item); });
                    },
                    align: "center",
                    width: 100
                },



                {
                    headerTemplate: function () {
                        return $("<button>").attr("type", "button").text("Estado Masivo")
                            .addClass("btn btn-danger btn-xs btn-delete mb-0 b-r-7")
                            .click(function () { deleteSelectedItems(); });
                    },
                    itemTemplate: function (_, item) {
                        return $("<input>").attr("type", "checkbox").attr("class", "AlterClass")
                            .prop("checked", item.Activa) //$.inArray(item, selectedItems) > -1 ||
                            .on("change", function () { $(this).is(":checked") ? selectItem(item) : unselectItem(item); });
                    },
                    align: "center",
                    width: 100
                },




                { name: "Observaciones", type: "text", width: 250 },
                { name: "Codigo", type: "text", width: 150 }
            ]
        });
        $(".config-panel input[type=checkbox]").on("click", function () {
            var $cb = $(this);
            $("#jsGrid-Promociones").jsGrid("option", $cb.attr("id"), $cb.is(":checked"));
        });
    });



    var selectedItems = [];

    var selectItem = function(item) {
        selectedItems.push(item);
    };
    var unselectItem = function(item) {
        selectedItems = $.grep(selectedItems, function(i) {
            return i !== item;
        });
    };
    var GetElementoIdSeleccionados = function () {
        var ElementoesIds = [];
        selectedItems.forEach(Elemento => ElementoesIds.push(Elemento.Id));
        return ElementoesIds;
    };

    var deleteSelectedItems = function() {
        if(!selectedItems.length || !confirm("Esta seguro que desea eliminar las Promociones seleccionadas?"))
            return;
        deleteElementoesFromDb(selectedItems);
        var $grid = $("#jsGrid-Promociones");
        $grid.jsGrid("option", "pActionIndex", 1);
        $grid.jsGrid("loadData");
        selectedItems = [];
    };

    var deleteElementoesFromDb = function (deletingElementoes) {
        var urlDelete = 'EliminarPromociones'
        var ElementoesId = GetElementoIdSeleccionados();
        $.ajax({
            type: "POST",
            url: urlDelete,
            data: { ElementoesIds: ElementoesId }, 
            success: function (data) {
                db.Elementoes = $.map(db.Elementoes, function (Elemento) {
                    var evt = new CustomEvent('respuestaBack', { detail: data });
                    window.dispatchEvent(evt);

                    return ($.inArray(Elemento, deletingElementoes) > -1) ? null : Elemento;
                    hayRespuesta();
                });
            },
            error: function (error) {
                //console.log(error);
            }
        })
    };


    var hayRespuesta = function () {
        var ev = new CustomEvent("respuestaBack");
        window.dispatchEvent(ev);
    };
   

})(jQuery);
