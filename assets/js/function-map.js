var data_class_all = [];
var data_polygon = [];
var data_polygon_source = [];
var wmsSource, wmsLayer;
var data_vector_source = [];

$(document).on('click', '.chk-dl', function () {
    var data_arr = Array();
    data_arr['geoserver_url'] = $('#geoserver_url').val();
    data_arr['code'] = $(this).attr('data-layer_name');
    data_arr['layer_name'] = $(this).attr('data-layer_name');
    data_arr['service_name'] = $(this).attr('data-service_name');
    if ($(this).prop('checked') == true) {
        fnc_data_polygon('show', data_arr);
    } else {
        fnc_data_polygon('hide', data_arr);
    }
});

function fnc_map_callback(){

    map.on('singleclick', function (evt) {
        if(data_polygon_source.length > 0){
            console.info(111)
            var viewResolution = /** @type {number} */ (view.getResolution());
            var url = data_polygon_source['ขอบเขตจังหวัด'].getFeatureInfoUrl(
                evt.coordinate,
                viewResolution,
                'EPSG:3857',
                // {'INFO_FORMAT': 'text/html'}
                {'INFO_FORMAT': 'application/json'}
            );
            console.info('viewResolution>',viewResolution);
            if (url) {
                console.info('url>',url)
                fetch(url)
                .then(function (res) {
                    console.info('html>',res);
                });
            }
        }
    });



    var tooltip = document.getElementById('tooltip'),
        title_tooltip = '';
    var overlay = new ol.Overlay({
        element: tooltip,
        offset: [10, 0],
        positioning: 'bottom-left'
    });
    map.addOverlay(overlay);

    //--- Tooltip ----
    function displayTooltip(evt) {
        var pixel = evt.pixel;
        var feature = map.forEachFeatureAtPixel(pixel, function (feature) {
            return feature;
        });
        if (feature) {
            title_tooltip = feature.get('fname');
            tooltip.style.display = 'block';
            overlay.setPosition(evt.coordinate);
            tooltip.innerHTML = title_tooltip;
        } else {
            tooltip.style.display = 'none';
        }
    };

    map.on('pointermove', displayTooltip);

    //--- InfoWindow ----
    var element = document.getElementById('popup-marker');
    popup = new ol.Overlay({
        element: element,
        offset: [-12, -25], // x, y
        autoPan: true,
        positioning: 'bottom-center',
        stopEvent: false
    });
    map.addOverlay(popup);


     // display popup on click
     map.on('singleclick', function(evt) {
        var checkattr = [];
        $(evt.originalEvent.path).each(function(i, v) {
            var ca = $(v).attr('class');
            if (ca) {
                checkattr.push($(v).attr('class'));
            }
        }).promise().done(function() {
            if ($.inArray('popover fade bs-popover-top show', checkattr) === -1) { //popup over

                // var feature = map.forEachFeatureAtPixel(evt.pixel,
                //     function(feature) {
                //         return feature;
                //     });
                // if (feature) {
                    
                //     var fdata = feature.values_.fdata;
                //     if (fdata.lonlat) {
                //         fnc_infowindow_open(coordinates, fdata);
                //     }
                // } else {
                //     setTimeout(function() {
                //         popup.setPosition(null);
                //     }, 100);
                // }

                var coordinate = evt.coordinate;
                console.info(coordinate)
                if (coordinate) {
                    fnc_infowindow_open(coordinate);
                }

            }
        });
    });
    //--- End InfoWindow ----

}

function fnc_data_polygon(data_show, data_arr) {
    // console.info(data_show, data_arr)
    if (data_show == 'show') {
        data_polygon[data_arr['code']] = [];
        data_polygon_source[data_arr['code']] = [];
        //---
        // data_vector_source[data_arr['code']] = new ol.source.Vector({
        //     url: data_arr['geoserver_url']+'?service=WFS&version=1.0.0&request=GetFeature&typeName='+data_arr['service_name']+'&maxFeatures=50&outputFormat=application/json',
        //     format: new ol.format.GeoJSON(),
        // });

        // data_polygon[data_arr['code']] = new ol.layer.Vector({
        //     source: data_vector_source[data_arr['code']]
        // });

        //---
        data_polygon_source[data_arr['code']] = new ol.source.TileWMS({
            url: data_arr['geoserver_url'],
            params: {
                'LAYERS': data_arr['service_name'],
                'TILED': true,
            },
            serverType: 'geoserver',
            crossOrigin: 'anonymous',
            transition: 0
        });

        data_polygon[data_arr['code']] = new ol.layer.Tile({
            source: data_polygon_source[data_arr['code']]
        });

        //===========
        // data_polygon_source[data_arr['code']] = new ol.source.ImageWMS({
        //     url: data_arr['geoserver_url'],
        //     params: {
        //         'LAYERS': data_arr['service_name'],
        //         'TILED': true,
        //         'FORMAT': 'image/png',
        //         'TRANSPARENT': 'true',
        //     },
        //     serverType: 'geoserver',
        //     crossOrigin: 'anonymous',
        //     transition: 0
        // });
        // data_polygon[data_arr['code']] = new ol.layer.Image({
        //     source: data_polygon_source[data_arr['code']]
        // });

        //-------------------------------------------------------
        map.addLayer(data_polygon[data_arr['code']]);
        data_polygon[data_arr['code']].setZIndex(25);
        //---
        data_class_all.push(data_arr['code']);
        console.info('Layer =', data_class_all);
    } else {
        map.removeLayer(data_polygon[data_arr['code']]);
        data_class_all.splice(data_class_all.indexOf(data_arr['code']), 1);
        console.info('Layer =', data_class_all);
    }
}

function fnc_infowindow_open(coordinates, fdata) {
    $('#popup-marker').addClass('show');
    // console.info('>>>', coordinates, fdata);
    //========================================================================
    var mcontent = `
    <div class="infowindow-content">
        <div class="infowindow-title"><a class="infowindow-close" onclick="fnc_infowindow_close()"><i class="fas fa-times"></i></a>
            <select class="form-control form-control-sm" id="map-type">
                <option value="road">xxx</option>
            </select>
        </div>
        <div class="infowindow-body">
            <table id="tbl-infowindow" class="table">
            <tr>
                <th>AAA</th>
                <td>BBB</td>
            </tr>
            </table>
        </div>
    </div>
    `;
    popup.setPosition(coordinates);
    $('#popup-content').html(mcontent);
}

function fnc_infowindow_close() {
    popup.setPosition(null);
}
