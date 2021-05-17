(function ($) {
    "use strict";
    $(document).ready(function () {
        $("#jsGrid-Banners").jsGrid({
            width: "100%",
            autoload: true,
            filtering: true,
            editing: true,
            sorting: true,
            pageSize: 30,
            paging: true,
            pageLoading: true,
            pageIndex: 1,
            onDataLoaded: function (result) {
                if (db.OnDataLoaded != undefined) {
                    db.OnDataLoaded(result.data);
                }
            },
            controller: {
                loadData: function (filter) {
                    var startIndex = (filter.pageIndex - 1) * filter.pageSize;

                    var parametros = {
                        PaginaActual: filter.pageIndex,
                        resultadoDesde: startIndex,
                        cantidadResultados: filter.pageSize,
                        Parametro: filter
                    };

                    var deferred = $.Deferred();
                    $.ajax({
                        type: "POST",
                        url: db.MetodoController,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        data: JSON.stringify({ 'Filtros': parametros }),

                        success: function (Data) {
                            deferred.resolve(JSON.parse(Data));
                        },
                        error: function (error) {
                            $.get("MostrarPopUp", function (data) {
                                $(data).modal('show');
                                $("#popUpModal").appendTo("body");
                            });
                        }
                    })

                    return deferred.promise()
                        .then(function (result) {
                            return result;
                        });
                },
                updateItem: function (editedItem) {
                    if (db.UpdateItem != undefined) {
                        db.UpdateItem(editedItem);
                    }
                }
            },
            fields: [
                {
                    headerTemplate: function () {
                        return $("<input>").attr("type", "checkbox").attr("class", "DropClass")
                            .prop("checked", false)
                            .on("click", function () { $(this).is(":checked") ? selectAllItems() : unselectAllItems(); });
                    },
                    itemTemplate: function (_, item) {
                        return $("<input>").attr("type", "checkbox").attr("class", "DropClass").attr("id", "item_" + item.Id)
                            .prop("checked", $.inArray(item, selectedItems) > -1)
                            .on("click", function () { $(this).is(":checked") ? selectItem(item) : unselectItem(item); });
                    },
                    align: "center",
                    width: 50
                }, 
                { name: "Acciones", width: 200, filtering: true, itemTemplate: function (_, item) { return CrearAcciones(this._grid, item); } },

                {
                    name: "Ruta",
                    itemTemplate: function (val, item) {
                        return $("<img>").attr("src", val).css({ height: 50, width: 50 }).on("click", function () {
                            $("#imagePreview").attr("src", item.Img);
                            $("#dialog").dialog("open");
                        });
                    },
                    insertTemplate: function () {
                        var insertControl = this.insertControl = $("<input>").prop("type", "file");
                        return insertControl;
                    },
                    insertValue: function () {
                        return this.insertControl[0].files[0];
                    },
                    align: "center",
                    width: 50,
                    title: "Vista Previa"
                },

                { name: "Url", type: "text", width: 100, autosearch: true, title: "Url", editing: false },
                { name: "Descripcion", type: "text", width: 100, autosearch: true, title: "Descripcion", editing: false },
                { name: "Activo", type: "checkbox", width: 50, title: "Activo"}, 
            ]
        });
    });

    function CrearAcciones(grid, item) {
        var html = [];
        html.push('<div id="divAccionesItem' + item.Id + '">');
        html.push('<a href="' + db.ActivarMetodo + '/' + item.Id + '">Activar</a>');
        html.push(' / ');
        html.push('<a href="#" onClick="' + db.EliminarMetodo + '(' + item.Id + ')" >Eliminar</a>');
        html.push('</div>');

        var htmlParaInsertar = html.join("");
        return htmlParaInsertar;
    };

    var selectedItems = [];
    var selectItem = function (item) {
        $("#item_" + item.Id).prop("checked", true);
        selectedItems.push(item);
    };

    var unselectItem = function (item) {
        selectedItems = $.grep(selectedItems, function (i) {
            $("#item_" + item.Id).prop("checked", false);
            return i !== item;
        });
    };

    var selectAllItems = function () {
        $("#jsGrid-Banners").data().JSGrid.data.forEach(function (item) {
            $("#item_" + item.Id).prop("checked", true);
            selectItem(item);
        });
    };

    var unselectAllItems = function () {
        $("#jsGrid-Banners").data().JSGrid.data.forEach(function (item) {
            $("#item_" + item.Id).prop("checked", false);
            unselectItem(item);
        });
    };
})(jQuery);
