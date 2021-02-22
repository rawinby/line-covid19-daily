var layer_showall_arr = ['ขอบเขตจังหวัด','เขตลุ่มน้ำหลัก','เขตลุ่มน้ำย่อย']; //Show All Attr
var match_layer_name = [];
var match_field_fix_attr = ['NAME','TYPE','GUIDELINE','LIMITATION','OTHER','REFERENCE'];
var match_field_th = [];
    match_field_th['NAME'] = 'ชื่อ';
    match_field_th['TYPE'] = 'ประเภท';
    match_field_th['GUIDELINE'] = 'มาตรการณ์ที่ทำได้';
    match_field_th['LIMITATION'] = 'ข้อจำกัดในการใช้';
    match_field_th['OTHER'] = 'ข้อกำหนดอื่น ๆ';
    match_field_th['REFERENCE'] = 'อ้างอิง';
//---
var data_class_all = [];
var data_polygon_tilesource = [], data_polygon_tilelayer = [];
var data_polygon_source = [], data_polygon_layer = [], data_cluster_source = [];
var wmsSource, wmsLayer;
var data_vector_source = [];
var polygon_type = 1;
//---
var data_layer_name = [];
var data_layer_url = [];
var infowindow_tbl_data = [];
var table_data = [];
var check_load_data = [];

var selected = [];
var selected2 = []; //polygon

var highlightFocus = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255,255,255,0.2)',
    }),
    stroke: new ol.style.Stroke({
        color: '#FFE202',
        width: 3,
    }),
    zIndex: 30
});


$(function () {

    $(document).on('click', '.menu-left:not(.menu-print)', function () {
        $('.menu-left').removeClass('active');
        $(this).addClass('active');
        //---
        $('.sidebar-tab').removeClass('active');
        $('.sidebar-tab.tab' + $(this).attr('data-tab')).addClass('active');
    });

    var myWindow;
    $(document).on('click', '.menu-print', function (e) {
        // window.print();
        html2canvas(document.getElementById("map"))
        .then(function (canvas) {
            var img = canvas.toDataURL("image/png")
            myWindow = window.open('','window_print');               
            myWindow.document.write(`
            <style>
            .img{
                display:none;
            }
            @media print {
                @page {
                    size: landscape;
                    margin-top: 1cm;
                    margin-right: 1cm;
                    margin-bottom: 1cm;
                    margin-left: 1cm;
                    width: 100%;
                }
                .img{
                    display:block;
                }
            }            
            </style>
            <script>
            setTimeout(function(){
                window.print();
            },500);
            setTimeout(function(){
                window.close();
            },600);
            </script>
            `);
            myWindow.document.title = $('title').text();              
            myWindow.document.write('<img class="img" src="'+ img +'">');            
            myWindow.document.close();
        });

        // var canvas = document.getElementById('canvas');
        // var dataURL = canvas.toDataURL();
        //     var img = canvas.toDataURL("image/png")
        //     var myWindow = window.open()
        //     myWindow.document.write('<img src="'+ img +'">');
        //     myWindow.document.close();
  
    });

    $(document).on('click', '.chk-go', function () {
        var ele = $(this).attr('id');
        $('[data-group="'+ ele +'"]').trigger('click');
    });

    $(document).on('click', '.chk-dl', function () {
        var ele = $(this).attr('data-group');        
        var count = $('[data-group="'+ ele +'"]:checked').length;
        var countall = $('[data-group="'+ ele +'"]').length;
        if(count == countall){
            $('#'+ele).prop('indeterminate', false);
            $('#'+ele).prop('checked',true);
        }else{
            if(count >= 1){
                $('#'+ele).prop('checked',false);
                $('#'+ele).prop('indeterminate', true);
            }else{
                $('#'+ele).prop('checked',false);
                $('#'+ele).prop('indeterminate', false);
            }
        }
    });

    function layersDataSetHeight(){
        var h_full = $('.navbar').outerHeight() + $('.col1').outerHeight();
        var h_minus = ($('.navbar').outerHeight() + $('.show-map-type').outerHeight() + $('.layers-title').outerHeight());
        var h_ld = h_full - h_minus;
        $('.layers-body').css('height', h_ld);

        var h_full2 = $('#show-table-data').outerHeight();
        var h_minus2 = $('.nav.nav-tabs').outerHeight() + 40;
        var h_ld2 = h_full2 - h_minus2;
        $('.tab-content').css('height', h_ld2);
    }
    layersDataSetHeight();
    $(window).resize(function() {
        layersDataSetHeight();
    });


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


    //--- infowindow select
    $(document).on('change', '#infowindow-select', function () {
        var layer_name = $(this).val();
        // var layer_name_re = layer_name.split('.')[0];
        var f = infowindow_tbl_data[layer_name];
        // console.info( f.getGeometry() )
        var extent = f.getGeometry().getExtent();
        var coordinate = ol.extent.getCenter(extent);
        var pixel = map.getPixelFromCoordinate(coordinate);
    
        var features = [];
        map.forEachFeatureAtPixel(pixel, function (feature) {
            features.push(feature);
            // return true;
        });
    
        var i = 0;
        clear_highlight();
        features.forEach(f => {
            selected.push(f);
            f.setStyle(highlightFocus);
            popup.setPosition(coordinate);
            i++;
        });

        var tbl_data = '';
        if($.inArray(match_layer_name[fnc_layer_rename(layer_name)], layer_showall_arr) !== -1){ //ถ้ามีในนี้คือโชว์ Attr ทั้งหมด
            $.each(f.values_, function(key,val){
                if(key != 'geometry'){
                    tbl_data += '<tr>';
                    tbl_data += '<th>'+ key +'</th><td>'+ (val || '-') +'</td>';
                    tbl_data += '</tr>';
                }
            });
        }else{ // Fix Attr Show
            $.each(f.values_, function(key,val){
                if(key != 'geometry' && ($.inArray(key, match_field_fix_attr) !== -1)){
                    tbl_data += '<tr>';
                    tbl_data += '<th>'+ match_field_th[key] +'</th><td>'+ (val || '-') +'</td>';
                    tbl_data += '</tr>';
                }
            });
        }

        $('#infowindow-tbl').html(tbl_data);
    });
    //--- end infowindow select





});






function fnc_map_callback(){
    console.clear(); //check_load_data

    map.on('moveend', function(e) {
        current_zoom = number_format(map.getView().getZoom());
        if(!check_load_data[current_zoom]){
            check_load_data[current_zoom] = [];
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
    var infowindow = document.getElementById('popup-marker');
    var infowindow_body = document.getElementById('infowindow-body');
    var infowindow_close = document.getElementById('infowindow-close');
    popup = new ol.Overlay({
        element: infowindow,
        offset: [-12, -25], // x, y
        autoPan: true,
        positioning: 'bottom-center',
        stopEvent: true
    });
    map.addOverlay(popup);

    infowindow_close.onclick = function () {
        popup.setPosition(undefined);
        infowindow_close.blur();
        return false;
    };



    //  display popup on click
     map.on('singleclick', function(evt) {
        // console.info(evt);
        var coordinate = evt.coordinate;
        clear_highlight();
        fnc_infowindow_close();
        
        if(data_class_all.length > 0){                      
            var features = [];
            map.forEachFeatureAtPixel(evt.pixel, function (feature) {
                features.push(feature);
            });
            
            var i = 0;
            fnc_infowindow_cleardata();  
            features.forEach(function(f){
                selected.push(f);
                f.setStyle(highlightFocus);                          
                fnc_infowindow_open(i, coordinate, f.getId(), f);
                i++;
            });
            
            // var viewResolution = /** @type {number} */ (view.getResolution());
            // var i = 0, url = [];
            // $(data_class_all).each(function(index,value){
            //     url[i] = data_polygon_source[value].getFeatureInfoUrl(
            //         evt.coordinate,
            //         viewResolution,
            //         'EPSG:3857',
            //         // {'INFO_FORMAT': 'text/html'}
            //         {'INFO_FORMAT': 'application/json'}
            //     );
            //     if (url[i]) {
            //         fetch(url[i])
            //         .then((res) => {
            //             return res.json()
            //         })
            //         .then(function (jsonData) {
            //             // console.info(value, url[i])
            //             // console.info('res>',jsonData);
            //             if(jsonData.features[0]){
            //                 fnc_infowindow_open(i+1, coordinate, value, jsonData.features[0]);
            //             }else{
            //                 fnc_infowindow_close();
            //             }
            //         })
            //         .catch(function(err){
            //             console.error('fetch err>',err);
            //             fnc_infowindow_close();
            //         });
            //     }
            // });         
        }            
    });
    //--- End InfoWindow ----

    // var source = new ol.source.Vector({        
    //     format: new ol.format.GeoJSON(),
    //     loader: function(extent) {
    //         console.info('extent>',extent)
    //         var url = 'http://119.59.123.116:8000/geoserver/ecolandscape/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=ecolandscape:ตำแหน่งหมู่บ้าน&outputFormat=application/json';
    //         url += '&srsname=EPSG:3857';
    //         url += '&bbox=' + extent.join(',');
    //         url += ',EPSG:3857';
    //         $.ajax({
    //             type: 'GET',
    //             url: url,
    //             context: this
    //         }).done(function(data) {                        
    //             var format = new ol.format.GeoJSON();
    //             // console.info('',format.readFeatures(data))
    //             this.addFeatures(format.readFeatures(data));

    //         });
    //     },
    //     strategy: ol.loadingstrategy.bbox
    //   });
    // var vector = new ol.layer.Vector({
    //     source: source,
    //     // style: function (feature) {
    //     //     // highlightStyle.getText().setText(feature.get('name'));
    //     //     return highlightStyle;
    //     // },
    //   });
    // map.addLayer(vector);


} //map call back


function clear_highlight(){
    if (selected !== null) { //clear focus by point
        selected.forEach(element => {
            element.setStyle(undefined);
        })
        selected = [];
    }
    if (selected2 !== null) { //clear focus by polygon
        selected2.forEach(element => {
            element.setStyle(undefined);
        })
        selected2 = [];
    }
}

function getDataByDraw() {
    // setCursorInMap('cell');
   
    // var select = new ol.interaction.Select();
    // map.addInteraction(select);
    var selectedFeatures = select.getFeatures();
    // a DragBox interaction used to select features by drawing boxes
    // var dragBox = new DragBox();
    map.addInteraction(dragBox);
    var extent_center;
    dragBox.on('boxend', function() {
        var rotation = map.getView().getRotation();
        var oblique = rotation % (Math.PI / 2) !== 0;
        var candidateFeatures = oblique ? [] : selectedFeatures;
        var extent = dragBox.getGeometry().getExtent();
        extent_center = ol.extent.getCenter(extent);

        data_class_all.forEach(ele => {
            data_polygon_source[ele].forEachFeatureIntersectingExtent(extent, function(feature) {
                selected2.push(feature);
                feature.setStyle(highlightFocus);
                candidateFeatures.push(feature);
            });
        });

        if (oblique) {
          var anchor = [0, 0];
          var geometry = dragBox.getGeometry().clone();
          geometry.rotate(-rotation, anchor);
          var extent$1 = geometry.getExtent();
          candidateFeatures.forEach(function(feature) {
            var geometry = feature.getGeometry().clone();
            geometry.rotate(-rotation, anchor);
            if (geometry.intersectsExtent(extent$1)) {
              selectedFeatures.push(feature);
            }
          });
        }
    });

    dragBox.on('boxstart', function() {        
        selectedFeatures.clear();
    });

    selectedFeatures.on(['add','remove'], function() {
        // fnc_infowindow_cleardata();
        var i = 0; 
        selectedFeatures.getArray().map(function(f) {             
            fnc_infowindow_open(i, null, f.getId(), f);
            i++;
        });
    });

}


var infowindow_chk_dup = [];
function fnc_infowindow_open(i, coordinates, layer_name, layer_data) {  
    setTimeout(function(){    
        if($.inArray(layer_name, infowindow_chk_dup) === -1){
            infowindow_chk_dup.push(layer_name);     
            // console.info('>>>', coordinates, fdata);
            //========================================================================
            $('#infowindow-select option').removeAttr('selected');
            $('#infowindow-select').append('<option value="'+ layer_name +'" '+ (i == 0 ? 'selected' : '') +'>'+ layer_name +'</option>');
            // $('#infowindow-tbl').prepend('');
            infowindow_tbl_data[layer_name] = layer_data;
            $('#infowindow-select').trigger('change');
        }
        if(coordinates){
            popup.setPosition(coordinates);
        }
        $('#popup-marker').addClass('show');
        // $('#popup-content').html(mcontent);
    },100)  
}

function fnc_infowindow_cleardata(){
    infowindow_chk_dup = [];
    $('#infowindow-select').html('');
    $('#infowindow-tbl').html('');
}

function fnc_infowindow_close() {
    fnc_infowindow_cleardata();
    $('#popup-marker').removeClass('show');
    popup.setPosition(null);
}


function fnc_data_polygon(data_show, data_arr) {
    // console.info(data_show, data_arr)
    if (data_show == 'show') {
        data_polygon_tilesource[data_arr['code']] = [];
        data_polygon_tilelayer[data_arr['code']] = [];
        //---
        data_polygon_source[data_arr['code']] = [];
        data_polygon_layer[data_arr['code']] = [];

        var highlightStyle = [
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: ($("[data-layer_name='"+ data_arr['code'] +"']").attr('data-style_color') || getRandomColor()),
                    width: 2
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255,255,255,0.2)',
                }),
                image: new ol.style.Circle({
                radius: 1,
                fill: new ol.style.Fill({
                    color: 'rgba(255,255,255,0.2)',
                }),
                stroke: new ol.style.Stroke({
                    color: ($("[data-layer_name='"+ data_arr['code'] +"']").attr('data-style_color') || getRandomColor()),
                    width: 1
                    }),
                }),
                geometry: function(feature) {
                    return feature.getGeometry();
                }
            })
        ];

        //=========== option first
        if(polygon_type == '1'){
            var format = new ol.format.GeoJSON();
            data_polygon_source[data_arr['code']] = new ol.source.Vector({
                format: format,

                // url: function (extent) {
                //     var url = data_arr['geoserver_url']+'?service=WFS&version=1.1.0&request=GetFeature&typeName='+data_arr['service_name']+'&outputFormat=application/json';
                //     url += '&srsname=EPSG:3857';
                //     url += '&bbox=' + extent.join(',');
                //     url += ',EPSG:3857';        
                //     return url;
                // },
      
                // loader: function(extent) {                 
                //     if( /*!table_data[data_arr['code']]*/  true ){
                //         // console.info('extent>',extent, data_arr['service_name'])
                //         var url = data_arr['geoserver_url'] +'?service=WFS&version=1.1.0&request=GetFeature&typeName='+ data_arr['service_name'] +'&outputFormat=application/json&maxFeatures=999999999';
                //         url += '&srsname=EPSG:3857';
                //         url += '&bbox=' + extent.join(',');
                //         url += ',EPSG:3857';
                //         $.ajax({
                //             url: url,
                //             method: 'GET',
                //             contentType: 'application/json; charset=utf-8',
                //             dataType: "json",
                //             cache: true,
                //             context: this,
                //             beforeSend: function( xhr ) {
                //                 block_righttop();
                //                 block('#show-table-data');
                //             }
                //         }).done(function(data) {
                //             var format = new ol.format.GeoJSON();
                //             this.addFeatures(format.readFeatures(data));
                //             table_data[data_arr['code']] = [];
                //             table_data[data_arr['code']] = format.readFeatures(data);

                //             var name_id = fnc_layer_rename(table_data[data_arr['code']][0].getId())
                //             match_layer_name[name_id] = [];
                //             match_layer_name[name_id] = data_arr['code'];

                //             fnc_genTableData(data_arr['code'], 'add');
                //         })
                //         .fail(function(xhr, status, error) {
                //             unblock('#show-table-data');
                //             alert_error(xhr.responseText);
                //         })
                //         .always(function(){
                //             unblock_righttop();
                //         });
                //     }else{                        
                //         this.addFeatures(table_data[data_arr['code']]);
                //         fnc_genTableData(data_arr['code'], 'add');
                //     }
                // },

                loader: function(extent) {
                    var _this = this;
                    if( !check_load_data[current_zoom][data_arr['code']] ){
                        // console.info('call')
                        var url = data_arr['geoserver_url'] +'?service=WFS&version=1.1.0&request=GetFeature&typeName='+ data_arr['service_name'] +'&outputFormat=application/json&maxFeatures=999999999';
                        url += '&srsname=EPSG:3857';
                        url += '&bbox=' + extent.join(',');
                        url += ',EPSG:3857';

                        block_righttop();           
                        fetch(url, {
                            method: 'GET',
                        })
                        .then(function(response){ 
                            return response.json();
                        })
                        .then(function(data){
                            _this.addFeatures(format.readFeatures(data));
                            table_data[data_arr['code']] = [];
                            table_data[data_arr['code']] = format.readFeatures(data);
                            check_load_data[current_zoom][data_arr['code']] = format.readFeatures(data);

                            var name_id = fnc_layer_rename(table_data[data_arr['code']][0].getId())
                            match_layer_name[name_id] = [];
                            match_layer_name[name_id] = data_arr['code'];

                            fnc_genTableData(data_arr['code'], 'add');
                        })
                        .catch(function(error){
                            if(error){
                                unblock('#show-table-data');
                                alert_error(error.message);
                            }
                        })
                        .finally(function () {
                            unblock_righttop();
                        });
                    }else{
                        // console.info('load')
                        _this.addFeatures(check_load_data[current_zoom][data_arr['code']]);
                        fnc_genTableData(data_arr['code'], 'add');
                    }

                },
                strategy: ol.loadingstrategy.bbox
            });

            data_polygon_layer[data_arr['code']] = new ol.layer.Vector({
                renderMode: 'image',
                source: data_polygon_source[data_arr['code']],
                updateWhileAnimating: false,
                updateWhileInteracting: false,
                preload: 3,
                style: function (feature) {
                    return highlightStyle;
                },
            });
        }

        //=========== option 1
        if(polygon_type == '2'){
            data_polygon_tilesource[data_arr['code']] = new ol.source.TileWMS({
                url: data_arr['geoserver_url'],
                params: {
                    'LAYERS': data_arr['service_name'],
                    'TILED': true,
                },
                serverType: 'geoserver',
                crossOrigin: 'anonymous',
                transition: 0
            });
            data_polygon_tilelayer[data_arr['code']] = new ol.layer.Tile({
                source: data_polygon_tilesource[data_arr['code']],
                style: function (feature) {
                    highlightStyle.getText().setText(feature.get('name'));
                    return highlightStyle;
                },
            });
        }

        //=========== option 2
        // data_polygon_tilesource[data_arr['code']] = new ol.source.ImageWMS({
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
        // data_polygon_tilelayer[data_arr['code']] = new ol.layer.Image({
        //     source: data_polygon_tilesource[data_arr['code']]
        // });

        //-------------------------------------------------------
        if(polygon_type == '1'){
            map.addLayer(data_polygon_layer[data_arr['code']]);
            data_polygon_layer[data_arr['code']].setZIndex(25);
        }

        if(polygon_type == '2'){
            map.addLayer(data_polygon_tilelayer[data_arr['code']]);
            data_polygon_tilelayer[data_arr['code']].setZIndex(25);
        }
        data_class_all.push(data_arr['code']);
        // console.info('ShowLayer =', data_class_all);
    } else {
        unblock_righttop();

        // Remove Table Data
        // table_data[data_arr['code']] = [];
        // delete table_data[data_arr['code']];
        fnc_genTableData(data_arr['code']);
        fnc_infowindow_close();

        if(polygon_type == '1'){
            map.removeLayer(data_polygon_layer[data_arr['code']]);
            data_polygon_layer[data_arr['code']].setSource(undefined);
        }

        if(polygon_type == '2'){
            map.removeLayer(data_polygon_tilelayer[data_arr['code']]);
            data_polygon_tilelayer[data_arr['code']].setSource(undefined);
        }
        data_class_all.splice(data_class_all.indexOf(data_arr['code']), 1);
        // console.info('ShowLayer =', data_class_all);
    }
}


function fnc_removeTab(tabname){
    $(".chk-dl[data-layer_name='"+ tabname +"']").trigger('click');
}


function fnc_zoomTo(n,tabname){    
    var f = table_data[data_class_all[data_class_all.indexOf(tabname)]][n];    
    var extent = f.getGeometry().getExtent();
    var coordinate = ol.extent.getCenter(extent);    
    // var pixel = map.getPixelFromCoordinate(coordinate);

    clear_highlight();
    selected.push(f);
    f.setStyle(highlightFocus);  

    var lonlat = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
    var lon = lonlat[0].toFixed(6);
    var lat = lonlat[1].toFixed(6);
    center_map(lon, lat);
    setTimeout(function(){
        fnc_infowindow_cleardata(); 
        fnc_infowindow_open(0, coordinate, f.getId(), f);
    },250);
    // console.info(f.getId(),f)

}


function fnc_genTableData(tabname,action){
    // console.info('tabname>',tabname)
    // console.info( table_data[tabname].length )

    block_righttop();
    block('#show-table-data');
    if(action == 'add'){
        if($("[data-tabname='"+ tabname +"']").length == 0){
            $('.data-show .nav-link,.data-show .tab-pane').removeClass('active');
            var tabname_ele = '<a class="nav-item nav-link active" data-toggle="tab" href="#nav-home-'+ tabname +'" data-tabname="'+ tabname +'">'+ tabname +' <i class="fas fa-times close" onclick="fnc_removeTab(\''+ tabname +'\')"></i></a>';
            $('#nav-tab').append(tabname_ele);
        
            var tabbody_ele = `<div class="tab-pane active" id="nav-home-${tabname}">
                                <div class="table-responsive">
                                    <table class="table table-bordered table-hover tbl-data">
                                    <thead>
                                    </thead>
                                    <tbody>
                                    </tbody>
                                    </table>
                                </div>
                            </div>`;
            $('.tab-content').append(tabbody_ele);
        }

        var n = 0;
        var tbl_name = '#nav-home-'+ tabname+' .tbl-data';
        $.each(table_data[data_class_all[data_class_all.indexOf(tabname)]], function(key,val){ //tab name
            // console.info(key, val)
            
            $(tbl_name +' thead').html('');
            $(tbl_name +' tbody').html('');
            
            if(n == 0){
                var th = '<tr>'
                th += '<th width="2"></th>';
                th += '<th width="10">#</th>';
                if($.inArray(match_layer_name[fnc_layer_rename(val.getId())], layer_showall_arr) !== -1){ //ถ้ามีในนี้คือโชว์ Attr ทั้งหมด
                    $.when(
                        $.each(val.values_, function(key2,val2){
                            if(key2 != 'geometry'){                        
                                th += '<th>'+ key2 +'</th>';
                            }
                        })
                    ).then(function () {
                        th += '</tr>';
                        $(tbl_name +' thead').append(th);
                    });
                }else{ //Fix Attr
                    $.when(
                        $.each(val.values_, function(key2,val2){
                            if(key2 != 'geometry' && ($.inArray(key2, match_field_fix_attr) !== -1)){                      
                                th += '<th>'+ match_field_th[key2] +'</th>';
                            }
                        })
                    ).then(function () {
                        th += '</tr>';
                        $(tbl_name +' thead').append(th);
                    });
                }
            }
            
            var td = '<tr>';
            td += '<td><a title="ZoomTo" onclick="fnc_zoomTo('+ n +',\''+ tabname +'\')"><i class="fas fa-search"></i></a></td>';
            td += '<td>'+(n + 1)+'</td>';
            if($.inArray(match_layer_name[fnc_layer_rename(val.getId())], layer_showall_arr) !== -1){ //ถ้ามีในนี้คือโชว์ Attr ทั้งหมด
                $.when(
                    $.each(val.values_, function(key3,val3){
                        if(key3 != 'geometry'){
                            td += '<td>'+ (val3 || '-') +'</td>';
                        }
                    })
                ).then(function () {
                    td += '</tr>';
                    $(tbl_name +' tbody').append(td);                        
                });
            }else{ //Fix Attr
                $.when(
                    $.each(val.values_, function(key3,val3){
                        if(key3 != 'geometry' && ($.inArray(key3, match_field_fix_attr) !== -1)){
                            td += '<td>'+ (val3 || '-') +'</td>';
                        }
                    })
                ).then(function () {
                    td += '</tr>';
                    $(tbl_name +' tbody').append(td);                        
                });
            }

            n++;
        });

    
    }
    else{
        //--- Remove Tab Table
        $('[data-tabname="'+ tabname +'"]').prev().trigger('click');
        $('[data-tabname="'+ tabname +'"],#nav-home-'+ tabname).remove();
    }

    setTimeout(function(){
        if(data_class_all.length > 0){
            $('.data-empty').addClass('hide');
            $('.data-show').removeClass('hide');
        }else{
            $('.data-empty').removeClass('hide');
            $('.data-show').addClass('hide');
        }   
        unblock_righttop();
        unblock('#show-table-data');     
    },100)
}


