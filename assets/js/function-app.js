var data_class_all = []
var data_polygon_tilesource = [],
  data_polygon_tilelayer = []
var data_polygon_source = [],
  data_polygon_layer = [],
  data_cluster_source = []
var wmsSource, wmsLayer
var data_vector_source = []
var polygon_type = $("#getmaptype").val()
//---
var data_layer_name = []
var data_layer_url = []
var infowindow_tbl_data = []
var table_data = []
var check_load_data = []

var selected = []
var selected2 = [] //polygon

var highlightFocus = new ol.style.Style({
  fill: new ol.style.Fill({
    color: "rgba(255, 255, 255, 0.01)",
  }),
  stroke: new ol.style.Stroke({
    color: "#FFE202",
    width: 3,
  }),
  image: new ol.style.Circle({
    radius: 1,
    fill: new ol.style.Fill({
      color: "rgba(255, 255, 255, 0.01)",
    }),
    stroke: new ol.style.Stroke({
      color: "#FFE202",
      width: 3,
    }),
  }),
  zIndex: 30,
})

$(function () {
  $(document).on("click", ".menu-left:not(.menu-print)", function () {
    $(".menu-left").removeClass("active")
    $(this).addClass("active")
    //---
    $(".sidebar-tab").removeClass("active")
    $(".sidebar-tab.tab" + $(this).attr("data-tab")).addClass("active")
  })

  var myWindow
  $(document).on("click", ".menu-print", function (e) {
    // window.print();
    html2canvas(document.getElementById("map")).then(function (canvas) {
      var img = canvas.toDataURL("image/png")
      myWindow = window.open("", "window_print")
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
            `)
      myWindow.document.title = $("title").text()
      myWindow.document.write('<img class="img" src="' + img + '">')
      myWindow.document.close()
    })

    // var canvas = document.getElementById('canvas');
    // var dataURL = canvas.toDataURL();
    //     var img = canvas.toDataURL("image/png")
    //     var myWindow = window.open()
    //     myWindow.document.write('<img src="'+ img +'">');
    //     myWindow.document.close();
  })

  $(document).on("change", "#select_province", function () {
    var select_layer_txt = ".chk-dl[data-service_name2=41]"
    if ($(this).val() === "") {
      if ($(select_layer_txt).prop("checked") === true) {
        $(select_layer_txt).trigger("click")
      }
    } else {
      if ($(select_layer_txt).prop("checked") === false) {
        $(select_layer_txt).trigger("click")
      } else {
        fnc_tbl_zoomTo($(this).val(), $("#select_province").data("name"))
      }
    }
  })

  $(document).on("change", "#select_riverbasin", function () {
    var select_layer_txt = ".chk-dl[data-service_name2=77]"
    if ($(this).val() === "") {
      if ($(select_layer_txt).prop("checked") === true) {
        $(select_layer_txt).trigger("click")
      }
    } else {
      if ($(select_layer_txt).prop("checked") === false) {
        $(select_layer_txt).trigger("click")
        $("#select_riverbasin").attr("data-wait", "true")
      } else {
        fnc_tbl_zoomTo($(this).val(), $("#select_riverbasin").data("name"))
      }
    }
  })

  $(document).on("click", ".chk-go", function () {
    var ele = $(this).attr("id")
    if ($(this).prop("indeterminate") === true || $(this).prop("checked") === true) {
      $('[data-group="' + ele + '"]:not(:checked)').trigger("click")
    } else {
      $('[data-group="' + ele + '"]:checked').trigger("click")
    }
  })

  $(document).on("click", ".chk-dl", function () {
    var ele = $(this).attr("data-group")
    var count = $('[data-group="' + ele + '"]:checked').length
    var countall = $('[data-group="' + ele + '"]').length
    if (count == countall) {
      $("#" + ele).prop("indeterminate", false)
      $("#" + ele).prop("checked", true)
    } else {
      if (count >= 1) {
        $("#" + ele).prop("checked", false)
        $("#" + ele).prop("indeterminate", true)
      } else {
        $("#" + ele).prop("checked", false)
        $("#" + ele).prop("indeterminate", false)
      }
    }
  })

  $(document).on("click", ".chk-dl", function () {
    var _this = this
    var data_arr = Array()
    data_arr["geoserver_url"] = $("#geoserver_url").val()
    data_arr["code"] = $(_this).attr("data-layer_name")
    data_arr["layer_name"] = $(_this).attr("data-layer_name")
    data_arr["service_name"] = $(_this).attr("data-service_name")
    data_arr["service_name2"] = $(_this).attr("data-service_name2")
    data_arr["service_style"] = $(_this).attr("data-service_style")
    if ($(_this).prop("checked") === true) {
      setTimeout(function () {
        fnc_data_polygon("show", data_arr)
      }, 50)
    } else {
      fnc_data_polygon("hide", data_arr)
    }
  })

  //--- infowindow select
  $(document).on("change", "#infowindow-select", function () {
    var layer_name = $(this).val()
    // var layer_name_re = layer_name.split('.')[0];
    var f = infowindow_tbl_data[layer_name]
    // console.info( f.getGeometry() )
    var extent = f.getGeometry().getExtent()
    var coordinate = ol.extent.getCenter(extent)
    var pixel = map.getPixelFromCoordinate(coordinate)

    var features = []
    map.forEachFeatureAtPixel(pixel, function (feature) {
      features.push(feature)
    })

    var i = 0
    clear_highlight()
    features.forEach(function (f) {
      selected.push(f)
      f.setStyle(highlightFocus)
      popup.setPosition(coordinate)
      i++
    })

    var tbl_data = ""
    $.each(f.values_, function (key, val) {
      if (key != "geometry") {
        tbl_data += "<tr>"
        tbl_data += "<th>" + key + "</th><td>" + (val || "-") + "</td>"
        tbl_data += "</tr>"
      }
    })

    $("#infowindow-tbl").html(tbl_data)
  })
  //--- end infowindow select

  //--- Modal Lat lon ---
  $(document).on("wheel", "input[type=number]", function (e) {
    $(this).blur()
  })
  $("#btn-zoomto-latlon").click(function () {
    var _lon = $("[name=input-lon]").val()
    var _lat = $("[name=input-lat]").val()
    if (_lon && _lat) {
      fnc_frm_zoomTo(_lon, _lat)
      $("#modal-lonlat").modal("hide")
    }
  })
  $("#btn-remove-zoomto-latlon").click(function () {
    fnc_clear_marker("currentmarker")
    $("#modal-lonlat").modal("hide")
  })

  $("#modal-lonlat").on("shown.bs.modal", function () {
    // $("[name=input-lon]").val(number_format(lonlat_center[0], 6));
    // $("[name=input-lat]").val(number_format(lonlat_center[1], 6));
    $("[name=input-lon]").val(number_format(lonlat_center[0], 6))
    $("[name=input-lat]").val(number_format(lonlat_center[1], 6))
  })
  $("#modal-lonlat").on("hidden.bs.modal", function () {
    $("[name=input-lon]").val("")
    $("[name=input-lat]").val("")
  })
  //--- End Modal Lat lon ---

  $(".mobile-open-menuleft").on("click", function () {
    if ($(".col-c.col1").is(":visible") != true) {
      //show
      $(this).addClass("active")
      $(".col-c.col1")
        .css("display", "flex")
        .animate({ left: "0px" }, 200, function () {
          layersDataSetHeight()
        })
    } else {
      //hide
      $(this).removeClass("active")
      $(".col-c.col1").animate({ left: "-300px" }, 200).fadeOut()
    }
  })
})

function fnc_map_callback() {
  map.on("moveend", function (e) {
    current_zoom = number_format(map.getView().getZoom())
    if (!check_load_data[current_zoom]) {
      check_load_data[current_zoom] = []
    }
  })

  var tooltip = document.getElementById("tooltip"),
    title_tooltip = ""
  var overlay = new ol.Overlay({
    element: tooltip,
    offset: [10, 0],
    positioning: "bottom-left",
  })
  map.addOverlay(overlay)

  //--- Tooltip ----
  function displayTooltip(evt) {
    var pixel = evt.pixel
    var feature = map.forEachFeatureAtPixel(pixel, function (feature) {
      return feature
    })
    if (feature) {
      title_tooltip = feature.get("fname")
      tooltip.style.display = "block"
      overlay.setPosition(evt.coordinate)
      tooltip.innerHTML = title_tooltip
    } else {
      tooltip.style.display = "none"
    }
  }

  map.on("pointermove", displayTooltip)

  //--- InfoWindow ----
  var infowindow = document.getElementById("popup-marker")
  var infowindow_body = document.getElementById("infowindow-body")
  var infowindow_close = document.getElementById("infowindow-close")
  popup = new ol.Overlay({
    element: infowindow,
    offset: [-12, -25], // x, y
    autoPan: true,
    positioning: "bottom-center",
    stopEvent: true,
  })
  map.addOverlay(popup)

  infowindow_close.onclick = function () {
    popup.setPosition(undefined)
    infowindow_close.blur()
    return false
  }

  //  display popup on click
  map.on("singleclick", function (evt) {
    // console.info(evt);
    var coordinate = evt.coordinate
    var lonlat = ol.proj.transform(coordinate, "EPSG:3857", "EPSG:4326")
    var lon = lonlat[0].toFixed(6)
    var lat = lonlat[1].toFixed(6)
    console.info("lon_lat:", lon + ", " + lat)

    clear_highlight()
    fnc_infowindow_close()
    if (tools_action_type != "zoom-in" && tools_action_type != "zoom-out" && tools_action_type != "measure_line" && tools_action_type != "measure_polygon" && tools_action_type != "getDataByDraw") {
      if (data_class_all.length > 0) {
        var features = []
        map.forEachFeatureAtPixel(evt.pixel, function (feature) {
          features.push(feature)
        })

        var i = 0
        fnc_infowindow_cleardata()
        features.forEach(function (f) {
          if (f.values_.fname !== "marker-zoomto") {
            selected.push(f)
            f.setStyle(highlightFocus)
            fnc_infowindow_open(i, coordinate, f.getId(), f)
            i++
          }
        })
      }
    }
  })
  //--- End InfoWindow ----

  //--- Default Layer ---
  setTimeout(function () {
    $("input[data-default_checked='true']").trigger("click")
  }, 1000)
  //------
} //map call back

function layersDataSetHeight() {
  console.info("layersDataSetHeight()")
  var h_full = $(window).outerHeight()
  var h_minus = $(".navbar").outerHeight() + $(".show-map-type").outerHeight() + $(".layers-title").outerHeight()
  var h_ld = h_full - h_minus
  $(".layers-body").css("height", h_ld)

  var h_full2 = $("#show-table-data").outerHeight()
  var h_minus2 = $(".nav.nav-tabs").outerHeight() + 40
  var h_ld2 = h_full2 - h_minus2
  $(".tab-content").css("height", h_ld2)
}

function mapSetHeight() {
  console.info("mapSetHeight()")
  var b_full = $("body").outerHeight()
  var h_full = $(".navbar").outerHeight()
  var t_map = b_full - h_full + 2 + "px"
  // var t_map = 65 + "%";
  $("#map").css({ height: t_map })
}

document.onreadystatechange = function () {
  if (document.readyState === "interactive") {
    console.clear()

    layersDataSetHeight()
    mapSetHeight()
    $(window).resize(function () {
      layersDataSetHeight()
      mapSetHeight()
    })
    //---
    // setTimeout(function () {
    //   $("input[data-service_name2=11]").trigger("click");
    // }, 1500);
    //---
  }
}

function clear_highlight() {
  if (selected !== null) {
    //clear focus by point
    selected.forEach((element) => {
      element.setStyle(undefined)
    })
    selected = []
  }
  if (selected2 !== null) {
    //clear focus by polygon
    selected2.forEach((element) => {
      element.setStyle(undefined)
    })
    selected2 = []
  }
}

function getDataByDraw() {
  map.on("pointermove", pointerMoveHandler)
  var type = "Polygon"
  draw_getdata = new ol.interaction.Draw({
    source: source_draw,
    type: type,
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: "rgba(201, 233, 252, 0.2)",
      }),
      stroke: new ol.style.Stroke({
        color: "rgba(253, 204, 52, 0.6)",
        lineDash: [5, 5],
        width: 2,
      }),
      image: new ol.style.Circle({
        radius: 5,
        stroke: new ol.style.Stroke({
          color: "rgba(0, 0, 0, 0.7)",
        }),
        fill: new ol.style.Fill({
          color: "rgba(255, 113, 36, 0.7)",
        }),
      }),
    }),
  })
  map.addInteraction(draw_getdata)

  // createMeasureTooltip();
  createHelpTooltip()

  var selectedFeatures = select.getFeatures()
  var listener
  draw_getdata.on("drawstart", function (evt) {
    fnc_infowindow_close()
    close_infowindow = false
    // set sketch
    sketch = evt.feature

    /** @type {import("../src/ol/coordinate.js").Coordinate|undefined} */
    var tooltipCoord = evt.coordinate

    listener = sketch.getGeometry().on("change", function (evt) {
      var geom = evt.target
      var output
      if (geom instanceof ol.geom.Polygon) {
        output = formatArea(geom)
        tooltipCoord = geom.getInteriorPoint().getCoordinates()
      } else if (geom instanceof ol.geom.LineString) {
        output = formatLength(geom)
        tooltipCoord = geom.getLastCoordinate()
      }
      // measureTooltipElement.innerHTML = output;
      // measureTooltip.setPosition(tooltipCoord);
    })
  })

  draw_getdata.on("drawend", function () {
    // measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
    // measureTooltip.setOffset([0, -7]);

    // unset tooltip so that a new one can be created
    // measureTooltipElement = null;
    // createMeasureTooltip();
    new ol.Observable.unByKey(listener)
    //---
    var vectorLayer = new ol.layer.Vector({
      renderMode: "image",
      source: source_draw,
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: "rgba(255, 255, 255, 0)",
        }),
        stroke: new ol.style.Stroke({
          color: "#ffcc33",
          width: 2,
          // lineDash: [5, 5],
        }),
        image: new ol.style.Circle({
          radius: 5,
          stroke: new ol.style.Stroke({
            color: "rgba(0, 0, 0, 0.2)",
          }),
          fill: new ol.style.Fill({
            color: "rgba(0, 0, 0, 0.2)",
          }),
        }),
      }),
    })

    console.info("drawend")
    // Add the vector layer to the map.
    map.addLayer(vectorLayer)
    vectorLayer.setZIndex(26)

    var candidateFeatures = []
    var extent = sketch.getGeometry().getExtent()
    // extent_center = ol.extent.getCenter(extent);

    data_class_all.forEach(function (ele) {
      data_polygon_source[ele].forEachFeatureIntersectingExtent(extent, function (feature) {
        selected2.push(feature)
        feature.setStyle(highlightFocus)
        candidateFeatures.push(feature)
      })
    })

    // console.info('extent_center',extent_center);
    var i = 0
    var extent_center
    candidateFeatures.forEach(function (f) {
      fnc_infowindow_open(i, null, f.getId(), f)
      i++
    })

    setTimeout(function () {
      // unset sketch
      sketch = null
      // source_draw.clear();
      $(".ol-b3 button").trigger("click")
    }, 500)
  })
}

var infowindow_chk_dup = []
function fnc_infowindow_open(i, coordinates, layer_name, layer_data) {
  setTimeout(function () {
    if ($.inArray(layer_name, infowindow_chk_dup) === -1) {
      infowindow_chk_dup.push(layer_name)
      // console.info('>>>', coordinates, fdata);
      //========================================================================
      $("#infowindow-select option").removeAttr("selected")
      $("#infowindow-select").append('<option value="' + layer_name + '" ' + (i == 0 ? "selected" : "") + ">" + layer_name + "</option>")
      // $('#infowindow-tbl').prepend('');
      infowindow_tbl_data[layer_name] = layer_data
      $("#infowindow-select").trigger("change")
    }
    if (coordinates) {
      popup.setPosition(coordinates)
    }
    // $('#popup-content').html(mcontent);
  }, 100)
  $("#popup-marker").addClass("show")
  setTimeout(function () {
    close_infowindow = true
  }, 1000)
}

function fnc_infowindow_cleardata() {
  infowindow_chk_dup = []
  $("#infowindow-select").html("")
  $("#infowindow-tbl").html("")
}

function fnc_infowindow_close() {
  if (close_infowindow == true) {
    fnc_infowindow_cleardata()
    $("#popup-marker").removeClass("show")
    popup.setPosition(null)
  }
}

var show_tile = "1"
function fnc_data_polygon(data_show, data_arr) {
  // console.info(data_show, data_arr)
  if (data_show == "show") {
    data_polygon_tilesource[data_arr["code"]] = []
    data_polygon_tilelayer[data_arr["code"]] = []
    //---
    data_polygon_source[data_arr["code"]] = []
    data_polygon_layer[data_arr["code"]] = []

    var highlightStyle = [
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          // color: $("[data-layer_name='" + data_arr["code"] + "']").attr("data-style_color") || getRandomColor(),
          color: "rgba(255, 255, 255, 0.01)",
          width: 7,
        }),
        fill: new ol.style.Fill({
          color: "rgba(255,255,255, 0.01)",
        }),
        image: new ol.style.Circle({
          radius: 1,
          fill: new ol.style.Fill({
            color: "rgba(255, 255, 255, 0.01)",
          }),
          stroke: new ol.style.Stroke({
            color: "rgba(255, 255, 255, 0.01)",
            width: 7,
          }),
        }),
        geometry: function (feature) {
          return feature.getGeometry()
        },
      }),
    ]

    //=========== option first
    if (polygon_type == "1") {
      block_righttop()
      var format = new ol.format.GeoJSON()
      data_polygon_source[data_arr["code"]] = new ol.source.Vector({
        format: format,
        loader: function (extent) {
          var _this = this
          //------------------------------------------------------------
          var filecache = "layer_" + data_arr["service_name2"] + ".json"
          console.info("filecache:", filecache)
          fileExists(base_url + "application/cache/" + filecache, function (resp) {
            var url = ""

            if (resp) {
              // url = base_url + "application/cache/" + filecache
              console.info("cacheStatus", true)
              _this.addFeatures(format.readFeatures(resp))
              table_data[data_arr["code"]] = []
              table_data[data_arr["code"]] = format.readFeatures(resp)

              fnc_genTableData(data_arr["code"], "add")

              if ($("#select_riverbasin").attr("data-wait") === "true") {
                fnc_tbl_zoomTo($("#select_riverbasin").val(), $("#select_riverbasin").data("name"))
                $("#select_riverbasin").attr("data-wait", "false")
              }
            } else {
              //------------------
              url = base_url + "calldata/" + data_arr["code"] + "/" + data_arr["service_name"] + "/" + data_arr["service_name2"] + "/" + data_arr["service_style"] + "/" + extent.join(",") //php

              // url = data_arr["geoserver_url"] + "?service=WFS&version=1.0.0&request=GetFeature&typeName=" + data_arr["service_name"] + "&outputFormat=application/json&srsname=EPSG:3857&bbox=" + extent.join(",") + ",EPSG:3857"
              console.info("cacheStatus", "callData")

              $.ajax({
                type: "GET",
                url: url,
                context: this,
                dataType: "json",
              })
                .done(function (data) {
                  _this.addFeatures(format.readFeatures(data))
                  table_data[data_arr["code"]] = []
                  table_data[data_arr["code"]] = format.readFeatures(data)

                  fnc_genTableData(data_arr["code"], "add")

                  if ($("#select_riverbasin").attr("data-wait") === "true") {
                    fnc_tbl_zoomTo($("#select_riverbasin").val(), $("#select_riverbasin").data("name"))
                    $("#select_riverbasin").attr("data-wait", "false")
                  }
                })
                .fail(function (xhr, status, error) {
                  // error handling
                  if (error) {
                    unblock("#show-table-data")
                    alert_error("" + data_arr["code"] + "<br>ไม่สามารถโหลดข้อมูลได้<br>" + xhr.responseText, function () {
                      $('[data-layer_name="' + data_arr["code"] + '"]').prop("checked", false)
                    })
                  }
                })
                .always(function () {
                  unblock_righttop()
                })
            }

            //------------------
            // fetch(url, {
            //   method: "GET",
            // })
            //   .then(function (response) {
            //     return response.json()
            //   })
            //   .then(function (data) {
            //     _this.addFeatures(format.readFeatures(data))
            //     table_data[data_arr["code"]] = []
            //     table_data[data_arr["code"]] = format.readFeatures(data)

            //     fnc_genTableData(data_arr["code"], "add")
            //   })
            //   .catch(function (error) {
            //     if (error) {
            //       unblock("#show-table-data")
            //       alert_error(error.message)
            //     }
            //   })
            //   .finally(function () {
            //     unblock_righttop()
            //   })
          })

          //------------------------------------------------------------
          // var url = base_url + "calldata/" + data_arr["code"] + "/" + data_arr["service_name"] + "/" + data_arr["service_name2"] + "/" + extent.join(",")
          // block_righttop()
          // fetch(url, {
          //   method: "GET",
          // })
          //   .then(function (response) {
          //     return response.json()
          //   })
          //   .then(function (data) {
          //     _this.addFeatures(format.readFeatures(data))
          //     table_data[data_arr["code"]] = []
          //     table_data[data_arr["code"]] = format.readFeatures(data)

          //     fnc_genTableData(data_arr["code"], "add")
          //   })
          //   .catch(function (error) {
          //     if (error) {
          //       unblock("#show-table-data")
          //       alert_error(error.message)
          //     }
          //   })
          //   .finally(function () {
          //     unblock_righttop()
          //   })

          //------------------------------------------------------------
        },
        strategy: ol.loadingstrategy.bbox,
      })

      data_polygon_layer[data_arr["code"]] = new ol.layer.Vector({
        source: data_polygon_source[data_arr["code"]],
        updateWhileAnimating: false,
        updateWhileInteracting: false,
        // preload: 3,
        // loadTilesWhileAnimating: true,
        // loadTilesWhileInteracting: true,
        renderer: "webgl",
        style: function (feature) {
          // console.log("sss>: ", feature)

          return highlightStyle
        },
      })
    }

    //=========== option 2
    if (polygon_type == "2" || show_tile == "1") {
      //889
      // data_polygon_tilesource[data_arr["code"]] = new ol.source.TileWMS({
      //   url: data_arr["geoserver_url"],
      //   params: {
      //     LAYERS: data_arr["service_name"],
      //     TILED: true,
      //     STYLES: data_arr["service_style"] != "default" ? data_arr["service_style"] : null,
      //   },
      //   serverType: "geoserver",
      //   crossOrigin: null, //"anonymous",
      //   transition: 0,
      // })
      // data_polygon_tilelayer[data_arr["code"]] = new ol.layer.Tile({
      //   source: data_polygon_tilesource[data_arr["code"]],
      //   // style: function (feature) {
      //   //   highlightStyle.getText().setText(feature.get("name"))
      //   //   return highlightStyle
      //   // },
      // })

      //=========== option 2
      data_polygon_tilesource[data_arr["code"]] = new ol.source.ImageWMS({
        url: data_arr["geoserver_url"],
        params: {
          LAYERS: data_arr["service_name"],
          TILED: true,
          STYLES: data_arr["service_style"] != "default" ? data_arr["service_style"] : null,
          FORMAT: "image/png",
          TRANSPARENT: "true",
        },
        serverType: "geoserver",
        crossOrigin: null, //"anonymous",
        transition: 0,
      })
      data_polygon_tilelayer[data_arr["code"]] = new ol.layer.Image({
        source: data_polygon_tilesource[data_arr["code"]],
      })
    }

    //-------------------------------------------------------
    if (polygon_type == "1") {
      map.addLayer(data_polygon_layer[data_arr["code"]])
      data_polygon_layer[data_arr["code"]].setZIndex(data_class_all.length + 1)
    }

    if (polygon_type == "2" || show_tile == "1") {
      //889
      map.addLayer(data_polygon_tilelayer[data_arr["code"]])
      data_polygon_tilelayer[data_arr["code"]].setZIndex(data_class_all.length)
    }
    data_class_all.push(data_arr["code"])
    // console.info('ShowLayer =', data_class_all);
  } else {
    unblock_righttop()

    // Remove Table Data
    // table_data[data_arr['code']] = [];
    // delete table_data[data_arr['code']];
    fnc_genTableData(data_arr["code"])
    fnc_infowindow_close()

    if (polygon_type == "1") {
      map.removeLayer(data_polygon_layer[data_arr["code"]])
      data_polygon_layer[data_arr["code"]].setSource(undefined)
    }

    if (polygon_type == "2" || show_tile == "1") {
      //889
      map.removeLayer(data_polygon_tilelayer[data_arr["code"]])
      data_polygon_tilelayer[data_arr["code"]].setSource(undefined)
    }
    data_class_all.splice(data_class_all.indexOf(data_arr["code"]), 1)
    // console.info('ShowLayer =', data_class_all);
  }
}

function fnc_removeTab(tabname) {
  $(".chk-dl[data-layer_name='" + tabname + "']").trigger("click")
}

function fnc_tbl_zoomTo(n, tabname) {
  var f = table_data[data_class_all[data_class_all.indexOf(tabname)]][n]
  var extent = f.getGeometry().getExtent()
  var coordinate = ol.extent.getCenter(extent)
  // var pixel = map.getPixelFromCoordinate(coordinate);

  clear_highlight()
  selected.push(f)
  f.setStyle(highlightFocus)

  var lonlat = ol.proj.transform(coordinate, "EPSG:3857", "EPSG:4326")
  var lon = lonlat[0].toFixed(6)
  var lat = lonlat[1].toFixed(6)
  center_map(lon, lat)
  setTimeout(function () {
    fnc_infowindow_cleardata()
    fnc_infowindow_open(0, coordinate, f.getId(), f)
  }, 300)
  // console.info(f.getId(),f)
}

var replay = 1
function fnc_frm_zoomTo(lon, lat) {
  fnc_clear_marker("currentmarker")
  var _lon = parseFloat(lon).toFixed(6)
  var _lat = parseFloat(lat).toFixed(6)

  center_map(_lon, _lat)
  var coordinate = ol.proj.transform([_lon, _lat], "EPSG:4326", "EPSG:3857")
  var pixel = map.getPixelFromCoordinate(coordinate)
  var features = [],
    features_data = []
  map.forEachFeatureAtPixel(pixel, function (feature) {
    features.push(feature)
  })

  var lonlat = ol.proj.transform(coordinate, "EPSG:3857", "EPSG:4326")
  var lon = lonlat[0].toFixed(6)
  var lat = lonlat[1].toFixed(6)

  if (features.length == 0) {
    // replay = 0;
    setTimeout(function () {
      fnc_frm_zoomTo(_lon, _lat)
      center_map(_lon, _lat, 7)
      fnc_marker_latlon("currentmarker", _lon, _lat)
    }, 800)
  } else {
    // replay = 1;
    fnc_marker_latlon("currentmarker", _lon, _lat)
    //---
    fnc_infowindow_cleardata()
    setTimeout(function () {
      var i = 0
      features.forEach(function (f) {
        if (f.values_.fname !== "marker-zoomto") {
          selected.push(f)
          f.setStyle(highlightFocus)
          fnc_infowindow_open(i, coordinate, f.getId(), f)
          i++
        }
      })
    }, 300)
  }
}

function fnc_genTableData(tabname, action) {
  // console.info('tabname>',tabname)
  // console.info( table_data[tabname].length )

  if (action == "add") {
    if ($("[data-tabname='" + tabname + "']").length == 0) {
      block_righttop()
      block("#show-table-data")
      $(".data-show .nav-link,.data-show .tab-pane").removeClass("active")
      var tabname_ele = '<a class="nav-item nav-link active" data-toggle="tab" href="#nav-home-' + tabname + '" data-tabname="' + tabname + '">' + tabname + ' <i class="fas fa-times close" onclick="fnc_removeTab(\'' + tabname + "')\"></i></a>"
      $("#nav-tab").append(tabname_ele)

      var tabbody_ele = `<div class="tab-pane active" id="nav-home-${tabname}">
                                <div class="table-responsive">
                                    <table class="table table-bordered table-hover tbl-data">
                                    <thead>
                                    </thead>
                                    <tbody>
                                    </tbody>
                                    </table>
                                </div>
                            </div>`
      $(".tab-content").append(tabbody_ele)

      var n = 0
      var tbl_name = "#nav-home-" + tabname + " .tbl-data"
      if (table_data[data_class_all[data_class_all.indexOf(tabname)]].length === 0) {
        var td = "<tr>"
        td += '<td class="text-center">ไม่มีข้อมูล</td>'
        td += "</tr>"
        $(tbl_name + " tbody").append(td)
      } else {
        $.each(table_data[data_class_all[data_class_all.indexOf(tabname)]], function (key, val) {
          //tab name
          // console.info(key, val)

          $(tbl_name + " thead").html("")
          $(tbl_name + " tbody").html("")

          if (n == 0) {
            var th = "<tr>"
            th += '<th width="2"></th>'
            th += '<th width="10">#</th>'
            $.when(
              $.each(val.values_, function (key2, val2) {
                if (key2 != "geometry") {
                  th += "<th>" + key2 + "</th>"
                }
              })
            ).then(function () {
              th += "</tr>"
              $(tbl_name + " thead").append(th)
            })
          }

          var td = "<tr>"
          td += '<td><a title="ZoomTo" onclick="fnc_tbl_zoomTo(' + n + ",'" + tabname + '\')"><i class="fas fa-search"></i></a></td>'
          td += "<td>" + (n + 1) + "</td>"
          $.when(
            $.each(val.values_, function (key3, val3) {
              if (key3 != "geometry") {
                td += "<td>" + (val3 || "<div class='text-center'>-</div>") + "</td>"
              }
            })
          ).then(function () {
            td += "</tr>"
            $(tbl_name + " tbody").append(td)
          })

          n++
        })
      }
    }
  } else {
    //--- Remove Tab Table
    if ($('[data-tabname="' + tabname + '"]').prev().length > 0) {
      $('[data-tabname="' + tabname + '"]')
        .prev()
        .trigger("click")
    } else if ($('[data-tabname="' + tabname + '"]').prev().length == 0 && $('[data-tabname="' + tabname + '"]').next().length > 0) {
      $('[data-tabname="' + tabname + '"]')
        .next()
        .trigger("click")
    }
    $('[data-tabname="' + tabname + '"],#nav-home-' + tabname).remove() //remove tab
    delete table_data[tabname] //remove data
  }

  setTimeout(function () {
    if (data_class_all.length > 0) {
      $(".data-empty").addClass("hide")
      $(".data-show").removeClass("hide")
    } else {
      $(".data-empty").removeClass("hide")
      $(".data-show").addClass("hide")
    }
    unblock_righttop()
    unblock("#show-table-data")
  }, 100)
}
