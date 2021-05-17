//(function ($) {
//    "use strict";
//    $(document).ready(function () {
//        $("#jsGrid-ModificacionDePrecios").jsGrid({
//            width: "100%",
//            autoload: true,
//            filtering: true,
//            editing: true,
//            sorting: true,
//            pageSize: 30,
//            paging: true,
//            pageLoading: true,
//            pageIndex: 1,
//            onDataLoaded: function (result) {
//                db.OnDataLoaded(result.data);
//            },
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
//                        data: JSON.stringify({ 'listaPrecioId': db.ListaPrecioId, 'Filtros': parametros }),

//                        success: function (Data) {
//                            deferred.resolve(JSON.parse(Data));
//                        },
//                        error: function (error) {
//                            $.get("MostrarPopUp", function (data) {
//                                $(data).modal('show');
//                                $("#popUpModal").appendTo("body");
//                            });
//                        }
//                    })

//                    return deferred.promise()
//                        .then(function (result) {
//                            return result;
//                        });
//                },
//                updateItem: function (editedItem) {
//                    db.UpdateItem(editedItem);
//                }
//            },
//            fields: [
//                { name: "ArticuloCodigoBarras", type: "text", width: 300, autosearch: true, title: "Articulo codigo de barras", editing: false },
//                { name: "PrecioFinal", type: "number", width: 100, title: "Precio final" },
//                { name: "FechaUltimoCambio", type: "text", width: 100, title: "Fecha ultimo cambio", editing: false }
//            ]
//        });
//    });

//})(jQuery);
