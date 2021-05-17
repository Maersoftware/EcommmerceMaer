//(function($) {
//    "use strict";
//    $(document).ready(function () {
//        $("#jsGrid-SeleccionArticulos").jsGrid({
//            width: "100%",
//            autoload: true,
//            filtering: true,
//            confirmDeleting: false,
//            paging: true,
//            controller: {
//                loadData: function () {
//                    return db.Data;
//                }
//            },
//            fields: [
//                //{
//                //    headerTemplate: function () {
//                //        return $("<button>").attr("type", "button").text("Eliminar")
//                //            .addClass("btn btn-danger btn-xs btn-delete mb-0 b-r-7")
//                //            .click(function () { deleteSelectedItems(); });
//                //    },
//                //    itemTemplate: function (_, item) {
//                //        return $("<input>").attr("type", "checkbox").attr("class", "DropClass")
//                //            .prop("checked", $.inArray(item, selectedItems) > -1)
//                //            .on("change", function () { $(this).is(":checked") ? selectItem(item) : unselectItem(item); });
//                //    },
//                //    align: "center",
//                //    width: 100
//                //},

//                //{
//                //    headerTemplate: function () {
//                //        return $("<button>").attr("type", "button").text("Estado Masivo")
//                //            .addClass("btn btn-danger btn-xs btn-delete mb-0 b-r-7")
//                //            .click(function () { deleteSelectedItems(); });
//                //    },
//                //    itemTemplate: function (_, item) {
//                //        return $("<input>").attr("type", "checkbox").attr("class", "AlterClass")
//                //            .prop("checked", item.Activa) //$.inArray(item, selectedItems) > -1 ||
//                //            .on("change", function () { $(this).is(":checked") ? selectItem(item) : unselectItem(item); });
//                //    },
//                //    align: "center",
//                //    width: 100
//                //},

//                { name: "Observaciones", type: "text", width: 250 },
//                { name: "Codigo", type: "text", width: 150 },
//                {
//                    type: "control",
//                    modeSwitchButton: false,
//                    editButton: false,
//                    headerTemplate: function () {
//                        return $("<button>").attr("type", "button").text("Agregar")
//                            .on("click", function () {
//                                showDetailsDialog("Add", {});
//                            });
//                    }
//                }
//            ]
//        });

//        $("#detailsDialog").dialog({
//            autoOpen: false,
//            width: 400,
//            close: function () {
//                $("#detailsForm").validate().resetForm();
//                $("#detailsForm").find(".error").removeClass("error");
//            }
//        });





//        $("#detailsForm").validate({
//            rules: {
//                name: "required",
//                age: { required: true, range: [18, 150] },
//                address: { required: true, minlength: 10 },
//                country: "required"
//            },
//            messages: {
//                name: "Please enter name",
//                age: "Please enter valid age",
//                address: "Please enter address (more than 10 chars)",
//                country: "Please select country"
//            },
//            submitHandler: function () {
//                formSubmitHandler();
//            }
//        });
//    });


//    var formSubmitHandler = $.noop;



//    var showDetailsDialog = function (dialogType, client) {
//        $("#name").val(client.Name);
//        $("#age").val(client.Age);
//        $("#address").val(client.Address);
//        $("#country").val(client.Country);
//        $("#married").prop("checked", client.Married);

//        formSubmitHandler = function () {
//            saveClient(client, dialogType === "Add");
//        };

//        $("#detailsDialog").dialog("option", "title", dialogType + " Client")
//            .dialog("open");
//    };


//    var saveClient = function (client, isNew) {
//        $.extend(client, {
//            Name: $("#name").val(),
//            Age: parseInt($("#age").val(), 10),
//            Address: $("#address").val(),
//            Country: parseInt($("#country").val(), 10),
//            Married: $("#married").is(":checked")
//        });

//        $("#jsGrid").jsGrid(isNew ? "insertItem" : "updateItem", client);

//        $("#detailsDialog").dialog("close");
//    };


//    //var selectedItems = [];

//    //var selectItem = function(item) {
//    //    selectedItems.push(item);
//    //};
//    //var unselectItem = function(item) {
//    //    selectedItems = $.grep(selectedItems, function(i) {
//    //        return i !== item;
//    //    });
//    //};
//    //var GetElementoIdSeleccionados = function () {
//    //    var ElementoesIds = [];
//    //    selectedItems.forEach(Elemento => ElementoesIds.push(Elemento.Id));
//    //    return ElementoesIds;
//    //};

//    //var deleteSelectedItems = function() {
//    //    if(!selectedItems.length || !confirm("Esta seguro que desea eliminar las Promociones seleccionadas?"))
//    //        return;
//    //    deleteElementoesFromDb(selectedItems);
//    //    var $grid = $("#jsgrid-SeleccionArticulos");
//    //    $grid.jsGrid("option", "pActionIndex", 1);
//    //    $grid.jsGrid("loadData");
//    //    selectedItems = [];
//    //};

//    //var deleteElementoesFromDb = function (deletingElementoes) {
//    //    var urlDelete = 'EliminarPromociones'
//    //    var ElementoesId = GetElementoIdSeleccionados();
//    //    $.ajax({
//    //        type: "POST",
//    //        url: urlDelete,
//    //        data: { ElementoesIds: ElementoesId }, 
//    //        success: function (data) {
//    //            db.Elementoes = $.map(db.Elementoes, function (Elemento) {
//    //                var evt = new CustomEvent('respuestaBack', { detail: data });
//    //                window.dispatchEvent(evt);

//    //                return ($.inArray(Elemento, deletingElementoes) > -1) ? null : Elemento;
//    //                hayRespuesta();
//    //            });
//    //        },
//    //        error: function (error) {
//    //            //console.log(error);
//    //        }
//    //    })
//    //};


//    //var hayRespuesta = function () {
//    //    var ev = new CustomEvent("respuestaBack");
//    //    window.dispatchEvent(ev);
//    //};
   

//})(jQuery);
