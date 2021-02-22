<!DOCTYPE html>
<html>
  <head>
    <title>Simple Map</title>
    <link rel="stylesheet" href="https://openlayers.org/en/v5.1.3/css/ol.css" type="text/css">
    <!-- The line below is only needed for old environments like Internet Explorer and Android 4.x -->
    <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
    <script src="https://cdn.polyfill.io/v2/polyfill.min.js?features=requestAnimationFrame,Element.prototype.classList,URL"></script>
    <script src="https://openlayers.org/en/v5.1.3/build/ol.js"></script>
  </head>
  <body>
    <div id="map" class="map"></div>
    <script>
      var map = new ol.Map({
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM({
                url: '//mt{0-3}.google.com/vt/lyrs=m&hl=th&x={x}&y={y}&z={z}',
                attributions: [
                    '© Google <a target="_blank" href="https://developers.google.com/maps/terms">Terms of Use.</a>'
                ]
            })
          })
        ],
        target: 'map',
        view: new ol.View({
          center: ol.proj.transform([100.592867, 13.749932], 'EPSG:4326', 'EPSG:3857'),
          zoom: 5,
        })
      });

      var source = new ol.source.Vector({        
        format: new ol.format.GeoJSON(),

        // url: function (extent) {
        //     var url = 'http://119.59.123.116:8000/geoserver/ecolandscape/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=ecolandscape:ตำแหน่งหมู่บ้าน&outputFormat=application/json';
        //     url += '&srsname=EPSG:3857';
        //     url += '&bbox=' + extent.join(',');
        //     url += ',EPSG:3857';
        //     return url;
        // },

        // url: 'https://openlayers.org/en/latest/examples/data/geojson/countries.geojson',
        // url: 'http://119.59.123.116:8000/geoserver/ecolandscape/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ecolandscape:%E0%B8%82%E0%B8%AD%E0%B8%9A%E0%B9%80%E0%B8%82%E0%B8%95%E0%B8%88%E0%B8%B1%E0%B8%87%E0%B8%AB%E0%B8%A7%E0%B8%B1%E0%B8%94&maxFeatures=50&outputFormat=application%2Fjson',

        loader: function(extent) {
            console.info('extent>',extent)
            var url = 'http://119.59.123.116:8000/geoserver/ecolandscape/wfs?service=WFS&version=1.1.0&request=GetFeature&typeName=ecolandscape:ตำแหน่งหมู่บ้าน&outputFormat=application/json';
            url += '&srsname=EPSG:3857';
            url += '&bbox=' + extent.join(',');
            url += ',EPSG:3857';
            $.ajax({
                type: 'GET',
                url: url,
                context: this
            }).done(function(data) {                        
                var format = new ol.format.GeoJSON();
                // console.info('',format.readFeatures(data))
                this.addFeatures(format.readFeatures(data));

            });
        },

        // url: function (extent) {
        //   // var url = 'http://119.59.123.116:8000/geoserver/ecolandscape/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ecolandscape:%E0%B8%82%E0%B8%AD%E0%B8%9A%E0%B9%80%E0%B8%82%E0%B8%95%E0%B8%88%E0%B8%B1%E0%B8%87%E0%B8%AB%E0%B8%A7%E0%B8%B1%E0%B8%94&maxFeatures=50&outputFormat=application%2Fjson'

        //   // var url = 'http://119.59.123.116:8000/geoserver/ecolandscape/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ecolandscape:%E0%B8%82%E0%B8%AD%E0%B8%9A%E0%B9%80%E0%B8%82%E0%B8%95%E0%B8%88%E0%B8%B1%E0%B8%87%E0%B8%AB%E0%B8%A7%E0%B8%B1%E0%B8%94&maxFeatures=50&outputFormat=application%2Fjson'
        //   // url += '&srsname=EPSG:3857';
        //   // url += '&bbox=' + extent.join(',');
        //   // url += ',EPSG:3857';

        //   var url = '?service=WMS&version=1.1.0&request=GetMap&layers=ecolandscape:ขอบเขตจังหวัด&styles=&width=768&height=663&srs=EPSG:32647&format=application%2Fjson%3Btype%3Dgeojson&bbox=332765.3506254541,1900904.4279809152,734466.2212480446,2261105.2338220854'
        //   url += '&srsname=EPSG:3857';
        //   url += ',EPSG:32647';
        //   return url;
        // },
        strategy: ol.loadingstrategy.bbox
      });

      var vector = new ol.layer.Vector({
        source: source
      });
      map.addLayer(vector);
      vector.setZIndex(25);
    </script>
  </body>
</html>