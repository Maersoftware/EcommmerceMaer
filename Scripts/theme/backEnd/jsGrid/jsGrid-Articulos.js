//(function ($) {
//    "use strict";

//    $(document).ready(function () {
//        MetodoController: db.MetodoController;
//        $("#jsGrid-Articulos").jsGrid({
//            width: "100%",
//            filtering: true,
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
//                }
//            },
//            fields: [
//                {
//                    headerTemplate: function () {
//                        return $("<button>").attr("type", "button").text("Eliminar")
//                            .addClass("btn btn-danger btn-xs btn-delete mb-0 b-r-7")
//                            .click(function () { deleteSelectedItems(); });
//                    },
//                    itemTemplate: function (_, item) {
//                        if (item.ArticuloId != undefined)
//                            return $("<input>").attr("type", "checkbox").attr("class", "DropClass")
//                                .prop("checked", $.inArray(item, SeleccionadosParaCambioEstado) > -1)
//                                .on("change", function () { $(this).is(":checked") ? SeleccionarParaCambioEstado(item) : QuitarDeSeleccionParaCambioEstado(item); });
//                    },
//                    align: "center",
//                    width: 50,
//                    autosearch: false,
//                    sorting: false
//                },
//                {
//                    headerTemplate: function () {
//                        return $("<button>").attr("type", "button").text("Visibilidad")
//                            .addClass("btn btn-danger btn-xs btn-delete mb-0 b-r-7")
//                            .click(function () { CambiarEstadoArticulos(); });
//                    },
//                    itemTemplate: function (_, item) {
//                        if (item.ArticuloId != undefined)
//                            return $("<input>").attr("type", "checkbox").attr("class", "AlterClass")
//                                .prop("checked", item.Visibilidad)
//                                .on("change", function () { $.inArray(item, SeleccionadosParaCambioEstado) > -1 ? QuitarDeSeleccionParaCambioEstado(item) : SeleccionarParaCambioEstado(item); });
//                    },
//                    align: "center",
//                    width: 50,
//                    autosearch: true,
//                    sorting: false
//                },
//                { name: "Editar", width: 70, filtering: false, itemTemplate: function (_, item) { return AccionEditar(this._grid, item); } },
//                { name: "ModeloDescripcion", type: "text", width: 100, title: "DESCRIPCION", deleteButton: true },
//                { name: "CodigoArticulo", type: "text", width: 100, title: "CODIGO", autosearch: true },
//                { name: "Stock", type: "number", width: 100, title: "STOCK" },
//                { name: "Precio", type: "number", width: 100, title: "PRECIO" },
//                { name: "", type: "text", width: 100, title: "PROMOCIONAL", autosearch: true },
//                { name: "Variante", type: "text", width: 100, title: "VARIANTE", autosearch: true },
//            ]
//        });
//    });

//    /**** Seccion para cambiar estado PublicadoEcommerce ****/

//    function AccionEditar(grid, item) {
//        var html = [];
//        html.push('<div id="divEditarItem' + item.Id + '">');
//        html.push('<a href="' + db.EditarMetodo + '/' + item.ModeloId + '">Editar</a>');
//        html.push('</div>');

//        var htmlParaInsertar = html.join("");
//        return htmlParaInsertar;
//    };

//    var SeleccionadosParaCambioEstado = [];

//    var SeleccionarParaCambioEstado = function (item) {
//        item.nuevoEstado = !item.Visibilidad;
//        SeleccionadosParaCambioEstado.push(item);
//    }

//    var QuitarDeSeleccionParaCambioEstado = function (item) {
//        SeleccionadosParaCambioEstado = $.grep(SeleccionadosParaCambioEstado, function (i) {
//            return i !== item;
//        });
//    }

//    var GetSeleccionadosParaCambioEstado = function () {
//        var cambiados = [];
//        SeleccionadosParaCambioEstado.forEach(item => cambiados.push({ Id: item.Id, Valor: item.nuevoEstado }));
//        return cambiados;
//    }

//    var CambiarEstadoArticulos = function () {
//        var UrlCambioEstados = 'PublicarDescuplicarAction';
//        var ArticulosParaCambio = GetSeleccionadosParaCambioEstado();
//        $.ajax({
//            type: "POST",
//            url: UrlCambioEstados,
//            data: { Articulos: ArticulosParaCambio },
//            //en data deberia recibir una lista con los elementos eliminados.
//            success: function (data) {
//                SeleccionadosParaCambioEstado = [];
//                MostrarPopup();
//            },
//            error: function (error) {
//                MostrarPopup();
//            }
//        });
//    };

//    var MostrarPopup = function () {
//        $.get("MostrarPopUp", function (data) {
//            $(data).modal('show');
//            $("#popUpModal").appendTo("body");
//        });
//    }
//    //var selectItem = function(item) {
//    //    selectedItems.push(item);
//    //};

//    //var unselectItem = function(item) {
//    //    selectedItems = $.grep(selectedItems, function(i) {
//    //        return i !== item;
//    //    });
//    //};    

//    var GetElementoIdSeleccionados = function () {
//        var ElementoesIds = [];
//        selectedItems.forEach(Elemento => ElementoesIds.push(Elemento.Id));
//        return ElementoesIds;
//    };

//    var deleteSelectedItems = function () {
//        if (!selectedItems.length || !confirm("Esta seguro que desea eliminar las Promociones seleccionadas?"))
//            return;
//        deleteElementoesFromDb(selectedItems);
//        var $grid = $("#jsGrid-Articulos");
//        $grid.jsGrid("option", "pActionIndex", 1);
//        $grid.jsGrid("loadData");
//        selectedItems = [];
//    };

//    var deleteElementoesFromDb = function (deletingElementoes) {
//        var urlDelete = 'EliminarPromociones'
//        var ElementoesId = GetElementoIdSeleccionados();
//        $.ajax({
//            type: "POST",
//            url: urlDelete,
//            data: { ElementoesIds: ElementoesId },
//            success: function (data) {
//                db.Elementoes = $.map(db.Elementoes, function (Elemento) {
//                    var evt = new CustomEvent('respuestaBack', { detail: data });
//                    window.dispatchEvent(evt);

//                    return ($.inArray(Elemento, deletingElementoes) > -1) ? null : Elemento;
//                    hayRespuesta();
//                });
//            },
//            error: function (error) {
//                //console.log(error);
//            }
//        })
//    };

//    var hayRespuesta = function () {
//        var ev = new CustomEvent("respuestaBack");
//        window.dispatchEvent(ev);
//    };
//})(jQuery);
