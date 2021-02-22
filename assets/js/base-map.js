var map, center, view, element, popup
var osmLayer, googleTerrain, googleRoad, googleHybrid, googleSat
//---
var sketch
var draw, draw_getdata
var measure_type
var measureTooltipElement
var measureTooltip
var helpTooltipElement
var helpTooltip
var continueLineMsg = "Click to continue drawing the line"
var continuePolygonMsg = "Click to continue drawing the polygon"
var source = new ol.source.Vector()
var source_draw = new ol.source.Vector()
var lonlat_center = Array()
// lonlat_center = [100.859313, 16.19295];
// lonlat_center = [100.592867, 13.749932];
var current_zoom, zoomDefault

if ($(window).innerWidth() < 768) {
  //mobile
  lonlat_center = [99.346342, 18.625718]
  zoomDefault = 7
} else {
  lonlat_center = [99.464316, 18.898268]
  zoomDefault = 8
}

current_zoom = zoomDefault
//---
// a normal select interaction to handle click
var tools_action_type
var select = new ol.interaction.Select()
var dragBox = new ol.interaction.DragBox({
  className: "myDragBox",
})
var close_infowindow = true
//---
initMap()

function initMap(ele, callback) {
  //=== Run Map ===
  setTimeout(function () {
    _initMap(ele, function () {
      // console.info(ele);

      fnc_map_callback()

      if (callback) {
        callback(true)
      }
    })
  }, 500)
}

function _initMap(ele, callback) {
  if (!ele) {
    ele = "map"
  }

  // center = [11187672.017146109, 1544816.1908919835]; //x, y thailand
  center = ol.proj.fromLonLat(lonlat_center) //Long , Lati thailand
  // console.info('center =', center);
  view = new ol.View({
    center: center,
    zoom: zoomDefault,
  })

  //------------------------------------------------ home
  var button1 = document.createElement("button")
  button1.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:22px;height:22px"><path d="M0 0h24v24H0z" fill="none"/><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>'
  var handleFnc = function (e) {
    $(".ol-control button").removeClass("active")
    remove_action_tools_map_all()
    center_map(lonlat_center[0], lonlat_center[1], zoomDefault)
  }
  button1.addEventListener("click", handleFnc, false)
  var element1 = document.createElement("div")
  element1.className = "ol-home ol-unselectable ol-control"
  element1.setAttribute("data-html2canvas-ignore", "true")
  element1.appendChild(button1)

  //------------------------------------------------ zoomin
  var button2 = document.createElement("button")
  button2.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:23px;height:23px"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/><path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/></svg>'
  var handleFnc = function (e) {
    remove_action_tools_map_all()

    var ele = ".ol-zoomin"
    $(".ol-control:not(" + ele + ") button").removeClass("active")
    if ($(ele + " button").hasClass("active") == false) {
      $(ele + " button").addClass("active")
      zoom_boxselect()
      setCursorInMap("zoom-in")
      tools_action_type = "zoom-in"
    } else {
      $(ele + " button").removeClass("active")
    }
  }
  button2.addEventListener("click", handleFnc, false)
  var element2 = document.createElement("div")
  element2.className = "ol-zoomin ol-unselectable ol-control ol-collapsed"
  element2.setAttribute("data-html2canvas-ignore", "true")
  element2.appendChild(button2)
  //------------------------------------------------ zoomout
  var button3 = document.createElement("button")
  button3.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:23px;height:23px"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z"/></svg>'
  var handleFnc = function (e) {
    remove_action_tools_map_all()

    var ele = ".ol-zoomout"
    $(".ol-control:not(" + ele + ") button").removeClass("active")
    if ($(ele + " button").hasClass("active") == false) {
      $(ele + " button").addClass("active")
      zoom_boxselect()
      setCursorInMap("zoom-out")
      tools_action_type = "zoom-out"
    } else {
      $(ele + " button").removeClass("active")
    }
  }
  button3.addEventListener("click", handleFnc, false)
  var element3 = document.createElement("div")
  element3.className = "ol-zoomout ol-unselectable ol-control ol-collapsed"
  element3.setAttribute("data-html2canvas-ignore", "true")
  element3.appendChild(button3)
  //------------------------------------------------
  var button4 = document.createElement("button")
  button4.innerHTML =
    '<svg class="ol-control__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 612 612" style="width:20px;height:20px"><path d="M606.924 144.053L467.944 5.074c-6.765-6.765-17.728-6.765-24.489 0l-38.001 38.001 69.49 69.494c6.763 6.761 6.769 17.726 0 24.489l-24.489 24.489c-6.765 6.769-17.728 6.769-24.493 0L356.47 92.059l-61.228 61.23 69.494 69.49c6.761 6.761 6.761 17.728 0 24.493l-24.493 24.489c-6.765 6.769-17.728 6.765-24.489.004l-69.495-69.492-61.228 61.227 69.492 69.492c6.761 6.765 6.765 17.728 0 24.489l-24.495 24.493c-6.761 6.769-17.728 6.765-24.491 0l-69.49-69.49L5.075 443.454c-6.765 6.761-6.765 17.728 0 24.491l138.983 138.983c6.761 6.763 17.728 6.763 24.491 0l438.374-438.382c6.766-6.759 6.77-17.727.001-24.493zm-428.97 405.708c-11.5 11.504-30.15 11.504-41.656 0-11.5-11.504-11.5-30.15.004-41.657 11.5-11.5 30.152-11.5 41.652 0 11.503 11.507 11.503 30.153 0 41.657z"></path></svg>'
  var handleFnc = function (e) {
    remove_action_tools_map_all()

    var ele = ".ol-b1"
    $(".ol-control:not(" + ele + ") button").removeClass("active")
    if ($(ele + " button").hasClass("active") == false) {
      $(ele + " button").addClass("active")
      map_measure_line()
      tools_action_type = "measure_line"
    } else {
      $(ele + " button").removeClass("active")
    }
  }
  button4.addEventListener("click", handleFnc, false)
  var element4 = document.createElement("div")
  element4.className = "ol-b1 ol-unselectable ol-control ol-collapsed"
  element4.setAttribute("data-html2canvas-ignore", "true")
  element4.appendChild(button4)
  //------------------------------------------------
  var button5 = document.createElement("button")
  button5.innerHTML =
    '<svg class="ol-control__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 326.534 326.535" style="width:18px;height:18px"><path d="M326.533 38.375a38.369 38.369 0 00-23.688-35.451 38.37 38.37 0 00-41.816 8.317l-20.065 20.066 14.577 14.577a8.25 8.25 0 01-11.667 11.667l-14.577-14.577-37.83 37.831 14.576 14.577a8.248 8.248 0 010 11.667 8.25 8.25 0 01-11.667 0L179.8 92.473l-37.831 37.83 14.577 14.576a8.25 8.25 0 01-11.667 11.667l-14.577-14.577-37.83 37.83 14.576 14.577a8.25 8.25 0 010 11.667 8.25 8.25 0 01-11.667 0l-14.577-14.577-37.83 37.831 14.576 14.576a8.25 8.25 0 01-11.667 11.667l-14.576-14.576-20.066 20.066a38.372 38.372 0 0027.133 65.503l249.788-.001a38.377 38.377 0 0027.134-11.238 38.377 38.377 0 0011.239-27.133l-.002-249.786zM249.789 249.79l-118.778.002 118.779-118.78-.001 118.778z"></path></svg>'
  var handleFnc = function (e) {
    remove_action_tools_map_all()

    var ele = ".ol-b2"
    $(".ol-control:not(" + ele + ") button").removeClass("active")
    if ($(ele + " button").hasClass("active") == false) {
      $(ele + " button").addClass("active")
      map_measure_polygon()
      tools_action_type = "measure_polygon"
    } else {
      $(ele + " button").removeClass("active")
    }
  }
  button5.addEventListener("click", handleFnc, false)
  var element5 = document.createElement("div")
  element5.className = "ol-b2 ol-unselectable ol-control ol-collapsed"
  element5.setAttribute("data-html2canvas-ignore", "true")
  element5.appendChild(button5)
  //------------------------------------------------
  var button6 = document.createElement("button")
  button6.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:20px;height:20px"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'
  var handleFnc = function (e) {
    remove_action_tools_map_all()

    var ele = ".ol-b3"
    $(".ol-control:not(" + ele + ") button").removeClass("active")
    if ($(ele + " button").hasClass("active") == false) {
      $(ele + " button").addClass("active")
      getDataByDraw()
      tools_action_type = "getDataByDraw"
    } else {
      $(ele + " button").removeClass("active")
    }
  }
  button6.addEventListener("click", handleFnc, false)
  var element6 = document.createElement("div")
  element6.className = "ol-b3 ol-unselectable ol-control ol-collapsed"
  element6.setAttribute("data-html2canvas-ignore", "true")
  element6.appendChild(button6)
  //------------------------------------------------
  var button7 = document.createElement("button")
  button7.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width:20px;height:20px"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'
  var handleFnc = function (e) {
    remove_action_tools_map_all()

    // var ele = '.ol-b4';
    // $('.ol-control:not('+ele+') button').removeClass('active');
    // if($(ele+' button').hasClass('active') == false){
    //     $(ele+' button').addClass('active');
    //     tools_action_type = 'getDataByPoint';
    // }else{
    //     $(ele+' button').removeClass('active');
    // }

    $("#modal-lonlat").modal()
  }
  button7.addEventListener("click", handleFnc, false)
  var element7 = document.createElement("div")
  element7.className = "ol-b4 ol-unselectable ol-control ol-collapsed"
  element7.setAttribute("data-html2canvas-ignore", "true")
  element7.appendChild(button7)
  //------------------------------------------------ //show Table
  var button8 = document.createElement("button")
  button8.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" style="width:20px;height:20px"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M10 10.02h5V21h-5zM17 21h3c1.1 0 2-.9 2-2v-9h-5v11zm3-18H5c-1.1 0-2 .9-2 2v3h19V5c0-1.1-.9-2-2-2zM3 19c0 1.1.9 2 2 2h3V10H3v9z"/></svg>'
  var handleFnc = function (e) {
    var ele = ".ol-table"
    if ($(ele + " button").hasClass("active") == false) {
      $(ele + " button").addClass("active")
      $("#map").animate({ height: "70%" }, 200)
      $("#show-table-data").show()
    } else {
      $(ele + " button").removeClass("active")
      $("#map").animate({ height: "100%" }, 200)
      $("#show-table-data").hide()
    }
  }
  button8.addEventListener("click", handleFnc, false)
  var element8 = document.createElement("div")
  element8.className = "ol-table ol-unselectable ol-control ol-collapsed"
  element8.setAttribute("data-html2canvas-ignore", "true")
  element8.title = "Show Table"
  element8.appendChild(button8)

  //------------------------------------------------
  map = new ol.Map({
    target: ele,
    renderer: ["webgl"],
    // controls: ol.control.defaults({
    //     attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
    //         collapsible: true,
    //     })
    // }),
    controls: ol.control
      .defaults({
        attribution: false,
      })
      .extend([
        new ol.control.Control({
          element: element1,
        }),
        new ol.control.Control({
          element: element2,
        }),
        new ol.control.Control({
          element: element3,
        }),
        new ol.control.Control({
          element: element4,
        }),
        new ol.control.Control({
          element: element5,
        }),
        new ol.control.Control({
          element: element6,
        }),
        new ol.control.Control({
          element: element7,
        }),
        new ol.control.Control({
          element: element8,
        }),
      ]),

    interactions: ol.interaction.defaults({ mouseWheelZoom: false }).extend([
      new ol.interaction.MouseWheelZoom({
        //ตัด zoom มีทศนิยม
        constrainResolution: true, // force zooming to a integer zoom
      }),
    ]), //Lock Mouse Scroll Zoom
    // interactions: ol.interaction.defaults().extend([
    //     new ol.interaction.DragRotateAndZoom() //shift + drag = RotateAndZoom
    // ]),

    // interactions: ol.interaction.defaults().extend([
    //     new ol.interaction.Select()
    // ]),
    // interactions: ol.interaction.defaults().extend([
    //     new ol.interaction.DragBox()
    // ]),
  })

  //=================================
  //--- GoogleMap ---
  googleTerrain = new ol.layer.Tile({
    source: new ol.source.OSM({
      url: "//mt{0-3}.google.com/vt/lyrs=p&hl=th&x={x}&y={y}&z={z}",
      attributions: ['© Google <a target="_blank" href="https://developers.google.com/maps/terms">Terms of Use.</a>'],
    }),
  })
  googleRoad = new ol.layer.Tile({
    source: new ol.source.OSM({
      url: "//mt{0-3}.google.com/vt/lyrs=m&hl=th&x={x}&y={y}&z={z}",
      attributions: ['© Google <a target="_blank" href="https://developers.google.com/maps/terms">Terms of Use.</a>'],
    }),
  })
  googleHybrid = new ol.layer.Tile({
    source: new ol.source.OSM({
      url: "//mt{0-3}.google.com/vt/lyrs=s,h&hl=th&x={x}&y={y}&z={z}",
      attributions: ['© Google <a target="_blank" href="https://developers.google.com/maps/terms">Terms of Use.</a>'],
    }),
  })
  googleSat = new ol.layer.Tile({
    source: new ol.source.OSM({
      url: "//mt{0-3}.google.com/vt/lyrs=s&hl=th&x={x}&y={y}&z={z}",
      attributions: ['© Google <a target="_blank" href="https://developers.google.com/maps/terms">Terms of Use.</a>'],
    }),
  })
  //--- OpenStreetMap ---
  osmLayer = new ol.layer.Tile({
    source: new ol.source.OSM(),
  })

  // map.addLayer(osmLayer);
  // map.addLayer(googleTerrain);
  // map.addLayer(googleRoad);
  map.addLayer(googleHybrid)
  // map.addLayer(googleSat);

  map.setView(view)
  // map.addControl(new ol.control.FullScreen());
  // map.addControl(new ol.control.MousePosition());
  // map.addControl(new ol.control.OverviewMap());
  // map.addControl(new ol.control.ScaleLine());
  // map.addControl(new ol.control.ZoomSlider());
  // map.addControl(new ol.control.ZoomToExtent());

  if (callback) {
    callback(true)
  }
}

$("#map-type").change(function () {
  $(".ol-control button").removeClass("active")
  remove_action_tools_map_all()
  map.removeLayer(googleRoad)
  map.removeLayer(googleTerrain)
  map.removeLayer(googleHybrid)
  map.removeLayer(googleSat)
  map.removeLayer(osmLayer)
  if ($(this).val() == "road") {
    map.addLayer(googleRoad)
  } else if ($(this).val() == "terrain") {
    map.addLayer(googleTerrain)
  } else if ($(this).val() == "hybrid") {
    map.addLayer(googleHybrid)
  } else if ($(this).val() == "satellite") {
    map.addLayer(googleSat)
  } else if ($(this).val() == "osm") {
    map.addLayer(osmLayer)
  }
})

function center_map(lon, lat, zoom) {
  lon = parseFloat(lon)
  lat = parseFloat(lat)
  if (!zoom) {
    zoom = map.getView().getZoom()
  }
  // console.log("Long: " + lon + " Lat: " + lat);
  // map.getView().setCenter(ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857'));
  // map.getView().setZoom(zoom);

  var extent_center = ol.proj.transform([lon, lat], "EPSG:4326", "EPSG:3857")
  view.animate({
    center: extent_center,
    zoom: zoom,
    duration: 300,
  })
}

function setCursorInMap(type) {
  map.getViewport().style.cursor = type || "default"
}

function remove_action_tools_map_all() {
  tools_action_type = null
  setCursorInMap("default")
  map.removeInteraction(select)
  map.removeInteraction(dragBox)
  draw_clear()
  fnc_infowindow_close()
}

function zoom_boxselect() {
  // var select = new Select();
  // map.addInteraction(select);
  var selectedFeatures = select.getFeatures()
  // a DragBox interaction used to select features by drawing boxes
  // var dragBox = new DragBox();
  map.addInteraction(dragBox)
  var zoom = map.getView().getZoom()
  dragBox.on("boxend", function () {
    // var rotation = map.getView().getRotation();
    zoom = map.getView().getZoom()
    var extent = dragBox.getGeometry().getExtent()
    // console.info('>>', rotation, extent, zoom)
    var extent_center = ol.extent.getCenter(extent)
    var num_zoom = tools_action_type == "zoom-in" ? zoom + 2 : zoom - 2
    view.animate({
      center: extent_center,
      zoom: num_zoom,
      duration: 300,
    })
  })

  dragBox.on("boxstart", function () {
    selectedFeatures.clear()
  })
}

var pointerMoveHandler = function (evt) {
  if (tools_action_type == "measure_line" || tools_action_type == "measure_polygon" || tools_action_type == "getDataByDraw") {
    if (evt.dragging) {
      return
    }
    /** @type {string} */
    var helpMsg = "Click to start drawing"

    if (sketch) {
      var geom = sketch.getGeometry()
      if (geom instanceof ol.geom.Polygon) {
        helpMsg = continuePolygonMsg
      } else if (geom instanceof ol.geom.LineString) {
        helpMsg = continueLineMsg
      }
    }

    helpTooltipElement.innerHTML = helpMsg
    helpTooltip.setPosition(evt.coordinate)

    helpTooltipElement.classList.remove("hidden")
  }
}

var formatLength = function (line) {
  var length = ol.sphere.getLength(line)
  var output
  if (length > 100) {
    output = number_format(Math.round((length / 1000) * 100) / 100) + " " + "km"
  } else {
    output = number_format(Math.round(length * 100) / 100) + " " + "m"
  }
  return output
}

var formatArea = function (polygon) {
  var area = ol.sphere.getArea(polygon)
  var output
  if (area > 10000) {
    output = number_format(Math.round((area / 1000000) * 100) / 100) + " " + "km<sup>2</sup>"
  } else {
    output = number_format(Math.round(area * 100) / 100) + " " + "m<sup>2</sup>"
  }
  return output
}

function measure_addInteraction() {
  var type = measure_type == "LineString" ? "LineString" : "Polygon"
  draw = new ol.interaction.Draw({
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
          // color: 'rgba(0, 255, 255, 0.2)'
          color: "rgba(255, 113, 36, 0.7)",
        }),
      }),
    }),
  })
  map.addInteraction(draw)

  createMeasureTooltip()
  createHelpTooltip()

  var listener
  draw.on("drawstart", function (evt) {
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
      measureTooltipElement.innerHTML = output
      measureTooltip.setPosition(tooltipCoord)
    })
  })

  draw.on("drawend", function () {
    measureTooltipElement.className = "ol-tooltip ol-tooltip-static"
    measureTooltip.setOffset([0, -7])
    // unset sketch
    sketch = null
    // unset tooltip so that a new one can be created
    measureTooltipElement = null
    createMeasureTooltip()
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
    // Add the vector layer to the map.
    map.addLayer(vectorLayer)
    vectorLayer.setZIndex(26)
  })
}

function draw_clear() {
  //--- Clear draw ---
  if (source_draw) {
    source_draw.clear()
    $(".ol-tooltip-static").addClass("hidden")
    $(".ol-selectable .ol-tooltip").addClass("hidden")
    map.removeInteraction(draw)
    map.removeInteraction(draw_getdata)
  }
}

function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement)
  }
  helpTooltipElement = document.createElement("div")
  helpTooltipElement.className = "ol-tooltip hidden"
  helpTooltip = new ol.Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: "center-left",
  })
  map.addOverlay(helpTooltip)
}

function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement)
  }
  measureTooltipElement = document.createElement("div")
  measureTooltipElement.className = "ol-tooltip ol-tooltip-measure"
  measureTooltip = new ol.Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: "bottom-center",
  })
  map.addOverlay(measureTooltip)
}

function map_measure_line() {
  measure_type = "LineString"
  measure_addInteraction()
  map.on("pointermove", pointerMoveHandler)
  helpTooltipElement.classList.remove("hidden")
  map.getViewport().addEventListener("mouseout", function () {
    helpTooltipElement.classList.add("hidden")
  })
}

function map_measure_polygon() {
  measure_type = "Polygon"
  measure_addInteraction()
  map.on("pointermove", pointerMoveHandler)
  helpTooltipElement.classList.remove("hidden")
  map.getViewport().addEventListener("mouseout", function () {
    helpTooltipElement.classList.add("hidden")
  })
}

//---
var _featuresData = [],
  _iconFeatures = [],
  _vectorSource = [],
  _vectorLayer = []

function fnc_clear_marker(fname, lon, lat) {
  //=== Clear Marker ===
  if (_featuresData[fname]) {
    for (var j = 0; j < _featuresData[fname].length; j++) {
      // _vectorLayer[data_arr['name']] = [];
      if (_vectorSource[fname][j]) {
        // _vectorLayer[data_arr['name']] = [];
        _vectorSource[fname][j].clear()
      }
    }
  }
  //=== End Clear Marker ===
  //===
}

function fnc_marker_latlon(fname, lon, lat) {
  //=== Clear Marker ===
  if (_featuresData[fname]) {
    for (var j = 0; j < _featuresData[fname].length; j++) {
      // _vectorLayer[data_arr['name']] = [];
      if (_vectorSource[fname][j]) {
        // _vectorLayer[data_arr['name']] = [];
        _vectorSource[fname][j].clear()
      }
    }
  }
  //=== End Clear Marker ===
  //===

  var iconDefault = new ol.style.Style({
    image: new ol.style.Icon(
      /** @type {olx.style.IconOptions} */ ({
        anchor: [18, 6],
        anchorXUnits: "pixels",
        anchorYUnits: "pixels",
        src: base_url + "assets/images/pin-24-r.png",
        opacity: 1,
        scale: 1,
      })
    ),
  })

  var _lon = parseFloat(lon)
  var _lat = parseFloat(lat)
  _featuresData[fname] = []
  _featuresData[fname][0] = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([_lon, _lat])),
    fname: "marker-zoomto",
    lonlat: [_lon, _lat],
    population: 4001,
    rainfall: 501,
  })

  //   //--- Marker Drag ---------------------------
  //   var translate1 = new ol.interaction.Translate({
  //     features: new ol.Collection([_featuresData[fname][0]]),
  //   });
  //   map.addInteraction(translate1);

  //   //--- Marker Event ---------------------------
  //   var coordMarker1;
  //   translate1.on("translateend", function (evt) {
  //     var lonlat = ol.proj.transform(evt.coordinate, "EPSG:3857", "EPSG:4326");
  //     var lon = lonlat[0].toFixed(6);
  //     var lat = lonlat[1].toFixed(6);
  //     // console.info('>>>', lonlat);
  //     $("[name=longitude]").val(lon);
  //     $("[name=latitude]").val(lat);
  //   });

  //--------------------------------------------
  _iconFeatures[fname] = []
  _vectorSource[fname] = []
  _vectorLayer[fname] = []
  for (var i = 0; i < _featuresData[fname].length; i++) {
    _iconFeatures[fname][i] = [_featuresData[fname][i]]
    _vectorSource[fname][i] = new ol.source.Vector({
      features: _iconFeatures[fname][i], //add an array of features
    })
    _vectorLayer[fname][i] = new ol.layer.Vector({
      source: _vectorSource[fname][i],
      style: iconDefault,
    })

    //---
    map.addLayer(_vectorLayer[fname][i])
    _vectorLayer[fname][i].setZIndex(99)
  }
}
