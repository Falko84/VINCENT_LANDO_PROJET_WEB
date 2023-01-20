function ajaxCall(url, target, isCached, sourceOfCacheAsked){
    $.ajax({
        url : url,
        statusCode: {
            200: function(response) {
                if ($(target).length > 0) {
                    $(target).html(response);
                }

                if (isCached == false) {
                    
                    if (sourceOfCacheAsked == 'listingPage') {
                        majCompareCheckboxOfPageListingIfAjaxCallWithoutCache();
              
                    } else if (sourceOfCacheAsked == 'productPage') {
                        majCompareCheckboxOfProductPageIfAjaxCallWithoutCache();
                    }
                }
            }
        },
        cache: isCached !== undefined ? isCached : true
    });
}

var Request = {
    parameter: function(name) {
        return this.parameters()[name];
    },
    parameters: function(uri) {
        var i, parameter, params, query, result;
        result = {};
        if (!uri) {
            uri = window.location.search;
        }
        if (uri.indexOf("?") === -1) {
            return {};
        }
        query = uri.slice(1);
        params = query.split("&");
        i = 0;
        while (i < params.length) {
            parameter = params[i].split("=");
            result[parameter[0]] = parameter[1];
            i++;
        }
        return result;
    }
};


function majCompareCheckboxOfPageListingIfAjaxCallWithoutCache() {
    var compareZoneIsDefined = $('.compare-zone li').get(0) != undefined;
    var labels = $('ul.list li label');

    $($('ul.list li label')).each(function () {
        var productId = $(this).attr('for').replace('compare_pdt', '');

        if (compareZoneIsDefined) {
            if($('.compare-zone li#'+productId).get(0) !== undefined) {
                $('#compare_pdt'+productId).prop('checked', true);
            } else {
                $('#compare_pdt'+productId).prop('checked', false);
            }
        } else {
            $('#compare_pdt'+productId).prop('checked', false);
        }
    });
}

function majCompareCheckboxOfProductPageIfAjaxCallWithoutCache() {
    var compareZoneIsDefined = $('.compare-zone li').get(0) != undefined;
    var productId = $('div.checkbox label').attr('for').replace('compare_pdt', '');

    if (compareZoneIsDefined) {
        if($('.compare-zone li#'+productId).get(0) !== undefined) {
            $('#compare_pdt'+productId).prop('checked', true);
        } else {
            $('#compare_pdt'+productId).prop('checked', false);
        }
    } else {
        $('#compare_pdt'+productId).prop('checked', false);
    }
}

$(document).ready(function() {

    $(".button , button, .no-context").on("contextmenu",function(){
        return false;
    });

    $("#modal-add-to-cart").on("show.bs.modal", function(e) {
        var link = $(e.relatedTarget);
        $(this).find(".modal-body").load(link.attr("href"));
    });

    // Sort on select change
    $('#sort_sort').on('change', function() {
        $('#sortProduct').submit();
    });

    // Remove filter
    var url = window.location.href
    $(".filterButton").each(function(){
        $(this).click(function(e){
            e.preventDefault();
            var filter = $(this).attr('data-tag');
            var filterPart = filter.split('-');
            var filterStart = filter.substr(0,2);
            if (filterStart === "fi"){
               
                if (filter.indexOf('c') > 0) {
                    filter = filter.substr(0,filter.indexOf('c'));
                }
            }

            var urlPart = url.split('+');
            var newUrlPart = [];
            for (i in urlPart) {
                // Remove pagination
                if (urlPart[i].indexOf('/') > 0 && i > 0) {
                    var part = urlPart[i].substr(0, urlPart[i].indexOf('/'));
                } else {
                    var part = urlPart[i];
                }
                if ( (filterStart === 'fv' || filterStart === 'fb' || filterStart === 'fa' || filterStart === 'fc') && urlPart[i].substr(0,filterPart[0].length) === filterPart[0]) {
                    var urlPartValue = part.replace( filterPart[0] + '-', '').split(',');
                    if (urlPartValue.length > 1) {
                        var newUrlPartValue = [];
                        for (j in urlPartValue) {
                            if (urlPartValue[j] !== filterPart[1]) {
                                newUrlPartValue.push(urlPartValue[j])
                            }
                        }
                        newUrlPart.push(filterPart[0] + '-' + newUrlPartValue.join());
                    }
                } else {
                    if (part !== filter) {
                        if (i > 0){
                            newUrlPart.push(part);
                        } else {
                            newUrlPart.push(urlPart[i]);
                        }

                    }
                }
            }

           
            if (filterPart[0].includes('fva')) {
                var filterFva = newUrlPart.filter(function (entry) {
                    return entry.includes(filterPart[0]);
                });

                if (filterFva[0].split(',').length === 1) {
                    newUrlPart.forEach(function (v, i) {
                        if (v.includes('fva')) {
                            newUrlPart[i] = v.replace('fva', 'fv');
                        }
                    });
                }
            }

            window.location.href = newUrlPart.join('+');
        })
    });
});
