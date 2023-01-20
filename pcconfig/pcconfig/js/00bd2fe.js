$(document).ready(function(){

    try {
        sessionStorage.setItem('testStorage', 'test');
    }
    catch(err) {
        $("#modal-storage-exception").modal('show');
    }

    getMenu();
    updateConfig();

    $('#clear-config-button').on('click', function(e){
        e.preventDefault();
        $.ajax({
            url: $(this).attr('href'),
            type: 'POST',
            data: {'config': sessionStorage.getItem('config')},
            statusCode: {
                200: function (response) {
                    $("#component-section").html(response);
                    updateConfig();
                },
                400: function (){
                    $("#modal-general-exception").modal('show');
                }
            }
        });
    });
    $('#delete-config-button').on('click', function(e){
        e.preventDefault();
        $.ajax({
            url: $(this).attr('href'),
            type: 'POST',
            data: {'name': $("#save_config_configs").val(), 'sessionName' : $("#save_config_name").val(), 'config': sessionStorage.getItem('config')},
            statusCode: {
                200: function (response) {
                    $('#form-wrapper').html(response.form);
                    if (response.components !== null) {
                        $("#component-section").html(response.components);
                        updateConfig();
                    }
                },
                400: function (){
                    $("#modal-general-exception").modal('show');
                }
            }
        });
    });

    $(document).on('click', 'tbody tr', function(e){
        if(e.target.nodeName !== "LABEL" && e.target.nodeName !== "INPUT") {
            e.preventDefault();
            $(this).find('td.item-designation').addClass('load');
            addProduct(defaultActionUrl.replace('AR000000000001', $(this).attr('rel')));
        }
    });

    $(document).on('click', 'tbody tr a.detail-link', function(e) {
        e.stopPropagation();
    });

    $(document).on('click', '.partage-btn', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $.ajax({
            url: $(this).attr('href'),
            type: 'POST',
            data: {'config': sessionStorage.getItem('config')},
            statusCode: {
                200: function (response) {
                    $("#modal-share").modal('show');
                    $("#modal-share .modal-content").html(response.message);
                },
                400: function (){
                    $("#modal-general-exception").modal('show');
                }
            }
        });
    });

    $('#modal-products').on('shown.bs.modal', function () {
        $('.add.load').removeClass('load');
    });

});

function getMenu()
{
    $.ajax({
        url: $("#settings").attr('data-url'),
        type: 'POST',
        data: {'config': sessionStorage.getItem('config')},
        statusCode: {
            200: function(response) {
                $("#settings").html(response);

            }
        }
    });
}

function getComponentProduct(productUrl, componentId, modalUrl){
    if (getProductIds(componentId) != null) {
        getComponentModal(componentId, modalUrl);
    } else {
        $.ajax({
            url: productUrl,
            type: 'POST',
            dataType: 'json',
            data: {'config': sessionStorage.getItem('config')},
            statusCode: {
                200: function (response) {
                    setProductIds(componentId, response.productIds);
                    getComponentModal(componentId, modalUrl);
                }
            }
        });
    }
}
function getComponentModal(componentId, url, filterUrl){
    $('.tooltip').remove();
    $.ajax({
        url: url,
        type: 'POST',
        data: {'productIds': getProductIds(componentId), 'filterUrl': filterUrl, 'config': sessionStorage.getItem('config')},
        statusCode: {
            200: function (response) {
                $("#modal-products .modal-content").html(response);
                $("#modal-products").modal('show');
            },
            400: function (){
                $("#modal-general-exception").modal('show');
            }
        }

    });
}

function addProduct(url){
    $.ajax({
        url: url,
        type: 'POST',
        data: {'config': sessionStorage.getItem('config')},
        statusCode: {
            200: function (response) {
                $("#modal-products").modal('hide');
                $("#component-section").html(response);
                updateConfig();
            },
            400: function (){
                $("#modal-products").modal('hide');
                $("#modal-general-exception").modal('show');
            },
            409: function (){
                $("#modal-products").modal('hide');
                $("#modal-general-exception").modal('show');
            }
        }
    });
}
function removeProduct(url, item){
    $.ajax({
        url: url,
        type: 'POST',
        data: {'config': sessionStorage.getItem('config')},
        statusCode: {
            200: function (response) {
                item.addClass('unactive');
                setTimeout( function() {
                    item.hide();
                     $("#component-section").html(response);
                     updateConfig();
                 }, 250);

            },
            400: function (){
                $("#modal-general-exception").modal('show');
            },
            409: function (response) {
                var data = JSON.parse(response.responseText);
                $("#modal-incompatibility").modal('show');
                $("#modal-incompatibility .modal-body").html(data.message);
                $("#modal-incompatibility .confirm-delete").on('click', function(e) {
                    var saveConfigUrl = $(this).attr('href');
                    e.preventDefault();
                    sessionStorage.setItem('config',  sessionStorage.getItem('config_delete'));
                    var deletedItems = [];
                    $("#modal-incompatibility li").each(function(){
                        deletedItems.push($(this).attr('data-id'));
                    });
                    for (var i=0; i < deletedItems.length; i++){
                        $('.p' + deletedItems[i]).addClass('unactive');
                    }
                    item.addClass('unactive');
                    setTimeout( function() {
                        for (var i=0; i < deletedItems.length; i++){
                            $('.p' + deletedItems[i]).hide();
                        }
                        item.hide();
                        saveConfig(saveConfigUrl, null);
                    }, 250);
                });
            }
        }
    });
}

function updateConfig(){
    $.ajax({
        url: $('#config-section').attr('data-url'),
        type: 'POST',
        data: {'config': sessionStorage.getItem('config')},
        statusCode: {
            200: function (response) {
                $("#config-section").html(response);
                clearSession();
                initRecapPos();
                $('.tooltip').remove();
                disabledButton();
            }
        }
    });
}

function saveConfig(url, redirectUrl){
    $.ajax({
        url: url,
        type: 'POST',
        data: {'config': sessionStorage.getItem('config')},
        statusCode: {
            200: function (response) {
                if (redirectUrl != null){
                    document.location.href = redirectUrl;
                } else {
                    $("#modal-exception").modal('hide');
                    $("#component-section").html(response);
                    updateConfig();
                }
            }
        }
    });
}

function clearSession(){
    var config = sessionStorage.getItem('config');
    sessionStorage.clear();
    sessionStorage.setItem('config', config);
}

function getFilterUrl(){
    var filterUrl = "";
    var params = $('#filterProduct').serializeArray();
    for (var i in params){
        if (params[i].hasOwnProperty('name') && params[i].hasOwnProperty('value')){
            var matches = (params[i].name).match(/filter\[([^\]]+)\]/);
            if (params[i].value !== "" && matches[1].substring(0,1) === 'f'){
                filterUrl += "+" + matches[1].replace('_', '-') + params[i].value;
            }
        }
    }
    return filterUrl;
}

function getProductIds(componentId){
    var productIds = sessionStorage.getItem('component_' + componentId);
    if (productIds === null || productIds === undefined){
        return null;
    }
    return JSON.parse(productIds);
}
function setProductIds(componentId, productIds){

    var str = JSON.stringify(productIds);
    sessionStorage.setItem('component_' + componentId, str);
}

function checkCompare(){
    var sessionProductIds = sessionStorage.getItem('compareProductId');
    if (sessionProductIds != null){
        var productIds = sessionProductIds.split(',');
        for (var id in productIds) {
            if ($('#compare_pdt' + productIds[id]).length >= 1) {
                $('#compare_pdt' + productIds[id]).attr('checked', true);
            }
        }
    }
}

function disabledButton() {
    if ($("#save_config_configs").length != 0) {
        if ($("#save_config_name").val().length == 0 || sessionStorage.getItem('config').indexOf('"items":[]') >= 0) {
            $('#save_config_save').addClass("disabled");
        } else {
            $('#save_config_save').removeClass("disabled");
        }

        if ($("#save_config_configs").length == 0 || $("#save_config_configs").val() === null) {
            $('.delete-config').addClass("disabled");
            $('#save_config_load').addClass("disabled");
        } else {
            $('.delete-config').removeClass("disabled");
            $('#save_config_load').removeClass("disabled");
        }
    }
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}
