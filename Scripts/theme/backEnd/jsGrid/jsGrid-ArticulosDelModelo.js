//(function ($) {
//    "use strict";

//    $(document).ready(function () {
//        MetodoController: db.MetodoController;
//        $("#jsGrid-ArticulosDelModelo").jsGrid({
//            width: "100%",
//            filtering: false,
//            sorting: true,
//            paging: true,
//            autoload: true,
//            pageLoading: true,
//            pageSize: db.pageSize,
//            pageIndex: 1,
//            controller: {
//                loadData: function (filter) {
//                    var startIndex = (filter.pageIndex - 1) * filter.pageSize;

//                    var parametros = {
//                        PaginaActual: filter.pageIndex,
//                        resultadoDesde: startIndex,
//                        cantidadResultados: filter.pageSize,
//                        Parametro: filter
//                    };

//                    var deferred = $.Deferred();
//                    $.ajax({
//                        type: "POST",
//                        url: db.MetodoController,
//                        contentType: "application/json; charset=utf-8",
//                        dataType: "json",
//                        data: JSON.stringify({ 'Filtros': parametros }),

//                        success: function (Data) {
//                            deferred.resolve(JSON.parse(Data));
//                        },
//                        error: function (error) {
//                            MostrarPopup();
//                        }
//                    })

//                    return deferred.promise()
//                        .then(function (result) {
//                            return result;
//                        });
//                }
//            },
//            fields: [
//                {
//                    headerTemplate: function () {
//                        return $("<input>").attr("type", "checkbox").attr("class", "DropClass")
//                            .prop("checked", false)
//                            .on("click", function () { $(this).is(":checked") ? selectAllItems() : unselectAllItems(); });
//                    },
//                    itemTemplate: function (_, item) {
//                        return $("<input>").attr("type", "checkbox").attr("class", "DropClass").attr("id", "item_" + item.ArticuloId)
//                            .prop("checked", $.inArray(item, db.SelectedItems) > -1)
//                            .on("click", function () { $(this).is(":checked") ? selectItem(item) : unselectItem(item); });
//                    },
//                    align: "center",
//                    width: 50,
//                    autosearch: false,
//                    sorting: false,
//                    editing: false
//                },
//                { name: "ModeloDescripcion", type: "text", editing: false, width: 200, title: "DESCRIPCION", deleteButton: true },
//                { name: "CodigoArticulo", type: "text", editing: false, width: 100, title: "CODIGO", autosearch: true },
//                { name: "Visibilidad", type: "text", width: 70, autosearch: true, title: "Publicado", editing: false },
//                { name: "Stock", type: "number", editing: false, width: 100, title: "STOCK", autosearch: true },
//                { name: "Precio", type: "number", editing: false, width: 100, title: "PRECIO", autosearch: true },
//                { name: "Peso", type: "number", width: 100, title: "PESO", autosearch: true },
//                { name: "Volumen", type: "number", width: 100, title: "VOLUMEN", autosearch: true },
//                { name: "", type: "text", editing: false, width: 100, title: "PROMOCIONAL", autosearch: true },
//                { name: "ColorDescripcion", type: "text", editing: false, width: 100, title: "COLOR", autosearch: true },
//                { name: "TalleDescripcion", type: "text", editing: false, width: 100, title: "TALLE", autosearch: true },
//            ]
//        });
//    });

//    /**** Seccion para cambiar estado PublicadoEcommerce ****/

//    var selectItem = function (item) {
//        $("#item_" + item.ArticuloId).prop("checked", true);
//        db.SelectedItems.push(item);
//    };

//    var unselectItem = function (item) {
//        db.SelectedItems = $.grep(db.SelectedItems, function (i) {
//            $("#item_" + item.ArticuloId).prop("checked", false);
//            return i !== item;
//        });
//    };

//    var selectAllItems = function () {
//        $("#jsGrid-ArticulosDelModelo").data().JSGrid.data.forEach(function (item) {
//            selectItem(item);
//        });
//    };

//    var unselectAllItems = function () {
//        $("#jsGrid-ArticulosDelModelo").data().JSGrid.data.forEach(function (item) {
//            unselectItem(item);
//        });
//    };

//    var MostrarPopup = function () {
//        $.get("/VertigoWeb/Seguridad/MostrarPopUp", function (data) {
//            $(data).modal('show');
//            $("#popUpModal").appendTo("body");
//        });
//    };
//})(jQuery);
