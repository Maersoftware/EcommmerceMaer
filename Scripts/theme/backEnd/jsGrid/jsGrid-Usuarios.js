//(function ($) {
//    "use strict";
//    $(document).ready(function () {
//        $("#jsGrid-Usuarios").jsGrid({
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
//                if (db.OnDataLoaded != undefined) {
//                    db.OnDataLoaded(result.data);
//                }
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
//                },
//                updateItem: function (editedItem) {
//                    if (db.UpdateItem != undefined) {
//                        db.UpdateItem(editedItem);
//                    }
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
//                        return $("<input>").attr("type", "checkbox").attr("class", "DropClass").attr("id", "item_" + item.Id)
//                            .prop("checked", $.inArray(item, db.SelectedItems) > -1)
//                            .on("click", function () { $(this).is(":checked") ? selectItem(item) : unselectItem(item); });
//                    },
//                    align: "center",
//                    width: 50,
//                    autosearch: false,
//                    sorting: false,
//                    editing: false
//                },
//                { name: "Editar", width: 70, filtering: false, itemTemplate: function (_, item) { return AccionEditar(this._grid, item); } },
//                { name: "Foto", type: "text", width: 70, autosearch: false, filtering: false, title: "Avatar", editing: false },
//                { name: "Nombre", type: "text", width: 100, autosearch: true, title: "Nombre", editing: false },
//                { name: "Apellido", type: "text", width: 100, autosearch: true, title: "Apellido", editing: false },
//                { name: "Email", type: "text", width: 150, autosearch: true, title: "Email", editing: false },
//                { name: "EsAdministrador", type: "text", width: 100, autosearch: true, title: "Administrador", editing: false },
//                { name: "Aprobado", type: "text", width: 70, autosearch: true, title: "Aprobado", editing: false }
//            ]
//        });
//    });

//    function AccionEditar(grid, item) {
//        var html = [];
//        html.push('<div id="divEditarItem' + item.Id + '">');
//        html.push('<a href="' + db.EditarMetodo + '/' + item.Id + '">Editar</a>');
//        html.push('</div>');

//        var htmlParaInsertar = html.join("");
//        return htmlParaInsertar;
//    };

//    var selectItem = function (item) {
//        $("#item_" + item.Id).prop("checked", true);
//        db.SelectedItems.push(item);
//    };

//    var unselectItem = function (item) {
//        db.SelectedItems = $.grep(db.SelectedItems, function (i) {
//            $("#item_" + item.Id).prop("checked", false);
//            return i !== item;
//        });
//    };

//    var selectAllItems = function () {
//        $("#jsGrid-Usuarios").data().JSGrid.data.forEach(function (item) {
//            $("#item_" + item.Id).prop("checked", true);
//            selectItem(item);
//        });
//    };

//    var unselectAllItems = function () {
//        $("#jsGrid-Usuarios").data().JSGrid.data.forEach(function (item) {
//            $("#item_" + item.Id).prop("checked", false);
//            unselectItem(item);
//        });
//    };
//})(jQuery);
