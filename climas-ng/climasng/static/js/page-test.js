(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

require('./mapview/main');

$('header').disableSelection(); // unpopular but still better
$('nav > ul').mspp({});

},{"./mapview/main":2}],2:[function(require,module,exports){
var AppView;

if (!window.console) {
  window.console = {
    log: function() {
      return {};
    }
  };
}

AppView = require('./views/app');

$(function() {
  var appview;
  appview = new AppView();
  return appview.render();
});

},{"./views/app":4}],3:[function(require,module,exports){
var MapLayer;

MapLayer = Backbone.Model.extend({
  constructor: function(shortName, longName, path) {
    this.shortName = shortName;
    this.longName = longName;
    this.path = path;
    return null;
  }
});

module.exports = MapLayer;

},{}],4:[function(require,module,exports){
var AppView, MapLayer, debug,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

MapLayer = require('../models/maplayer');


/* jshint -W093 */

debug = function(itemToLog, itemLevel) {
  var levels, messageNum, threshold, thresholdNum;
  levels = ['debug', 'message', 'warning'];
  threshold = 'debug';
  if (!itemLevel) {
    itemLevel = levels[0];
  }
  thresholdNum = levels.indexOf(threshold);
  messageNum = levels.indexOf(itemLevel);
  if (thresholdNum > messageNum) {
    return;
  }
  if (itemToLog + '' === itemToLog) {
    return console.log("[" + itemLevel + "] " + itemToLog);
  } else {
    return console.log(itemToLog);
  }
};

AppView = Backbone.View.extend({
  tagName: 'div',
  className: 'splitmap showforms',
  id: 'splitmap',
  trackSplitter: false,
  trackPeriod: 100,
  events: {
    'click .btn-change': 'toggleForms',
    'click .btn-compare': 'toggleSplitter',
    'leftmapupdate': 'leftSideUpdate',
    'rightmapupdate': 'rightSideUpdate',
    'change select.left': 'leftSideUpdate',
    'change select.right': 'rightSideUpdate'
  },
  tick: function() {
    if (false) {
      debug(this.map.getPixelOrigin());
    }
    return setTimeout(this.tick, 2000);
  },
  initialize: function() {
    debug('AppView.initialize');
    this.mapLayer = new MapLayer('left', 'Left Map', 'left.map');
    _.bindAll.apply(_, [this].concat(_.functions(this)));
    return this.speciesInfoFetchProcess = this.fetchSpeciesInfo();
  },
  render: function() {
    debug('AppView.render');
    this.$el.append(AppView.templates.layout({
      leftTag: AppView.templates.leftTag(),
      rightTag: AppView.templates.rightTag(),
      leftForm: AppView.templates.leftForm(),
      rightForm: AppView.templates.rightForm()
    }));
    $('#contentwrap').append(this.$el);
    this.map = L.map('map', {
      center: [-20, 136],
      zoom: 5
    });
    this.map.on('move', this.resizeThings);
    L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
      subdomains: '1234',
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>,\ntiles &copy; <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>'
    }).addTo(this.map);
    this.leftForm = this.$('.left.form');
    this.buildLeftForm();
    this.rightForm = this.$('.right.form');
    this.buildRightForm();
    this.leftTag = this.$('.left.tag');
    this.rightTag = this.$('.right.tag');
    this.splitLine = this.$('.splitline');
    return this.splitThumb = this.$('.splitthumb');
  },
  leftSideUpdate: function() {
    var newLeftInfo, sppName;
    debug('AppView.leftSideUpdate');
    sppName = this.$('#leftmapspp').val();
    if (__indexOf.call(this.speciesSciNameList, sppName) < 0) {
      return false;
    }
    newLeftInfo = {
      speciesName: sppName,
      year: this.$('#leftmapyear').val(),
      scenario: this.$('#leftmapscenario').val(),
      gcm: this.$('#leftmapgcm').val()
    };
    if (this.leftInfo && _.isEqual(newLeftInfo, this.leftInfo)) {
      return false;
    }
    if (this.leftInfo && newLeftInfo.speciesName === this.leftInfo.speciesName && newLeftInfo.year === this.leftInfo.year && newLeftInfo.year === 'baseline') {
      return false;
    }
    this.leftInfo = newLeftInfo;
    this.addMapLayer('left');
    return this.addMapTag('left');
  },
  rightSideUpdate: function() {
    var newRightInfo, sppName;
    debug('AppView.rightSideUpdate');
    sppName = this.$('#rightmapspp').val();
    if (__indexOf.call(this.speciesSciNameList, sppName) < 0) {
      return false;
    }
    newRightInfo = {
      speciesName: sppName,
      year: this.$('#rightmapyear').val(),
      scenario: this.$('#rightmapscenario').val(),
      gcm: this.$('#rightmapgcm').val()
    };
    if (this.rightInfo && _.isEqual(newRightInfo, this.rightInfo)) {
      return false;
    }
    if (this.rightInfo && newRightInfo.speciesName === this.rightInfo.speciesName && newRightInfo.year === this.rightInfo.year && newRightInfo.year === 'baseline') {
      return false;
    }
    this.rightInfo = newRightInfo;
    this.addMapLayer('right');
    return this.addMapTag('right');
  },
  addMapTag: function(side) {
    var info, tag;
    debug('AppView.addMapTag');
    if (side === 'left') {
      info = this.leftInfo;
    }
    if (side === 'right') {
      info = this.rightInfo;
    }
    tag = "<b><i>" + info.speciesName + "</i></b>";
    if (info.year === 'baseline') {
      tag = "current " + tag + " distribution";
    } else if (info.gcm === 'all') {
      tag = "<b>median</b> projections for " + tag + " in <b>" + info.year + "</b> if <b>" + info.scenario + "</b>";
    } else {
      tag = "<b>" + info.gcm + "</b> projections for " + tag + " in <b>" + info.year + "</b> if <b>" + info.scenario + "</b>";
    }
    if (side === 'left') {
      this.leftTag.find('.leftlayername').html(tag);
    }
    if (side === 'right') {
      return this.rightTag.find('.rightlayername').html(tag);
    }
  },
  addMapLayer: function(side) {
    var futureModelPoint, layer, mapData, rasterApiUrl, sideInfo;
    debug('AppView.addMapLayer');
    if (side === 'left') {
      sideInfo = this.leftInfo;
    }
    if (side === 'right') {
      sideInfo = this.rightInfo;
    }
    futureModelPoint = [sideInfo.scenario, sideInfo.gcm, sideInfo.year].join('_');
    if (sideInfo.year === 'baseline') {
      futureModelPoint = '1990';
    }
    rasterApiUrl = 'http://localhost:10600/api/raster/1/wms_data_url';
    mapData = ['http://localhost:6543/speciesdata', sideInfo.speciesName.replace(' ', '_'), 'output', futureModelPoint + '.asc.gz'].join('/');
    layer = L.tileLayer.wms(rasterApiUrl, {
      DATA_URL: mapData,
      layers: 'DEFAULT',
      format: 'image/png',
      transparent: true
    });
    layer.addTo(this.map);
    if (side === 'left') {
      if (this.leftLayer) {
        this.map.removeLayer(this.leftLayer);
      }
      this.leftLayer = layer;
    }
    if (side === 'right') {
      if (this.rightLayer) {
        this.map.removeLayer(this.rightLayer);
      }
      this.rightLayer = layer;
    }
    return this.resizeThings();
  },
  centreMap: function(repeatedlyFor) {
    var later, recentre, _i, _results;
    debug('AppView.centreMap');
    if (!repeatedlyFor) {
      repeatedlyFor = 500;
    }
    recentre = (function(_this) {
      return function() {
        _this.map.invalidateSize(false);
        return _this.resizeThings();
      };
    })(this);
    _results = [];
    for (later = _i = 0; _i <= repeatedlyFor; later = _i += 25) {
      _results.push(setTimeout(recentre, later));
    }
    return _results;
  },
  toggleForms: function() {
    debug('AppView.toggleForms');
    this.$el.toggleClass('showforms');
    return this.centreMap();
  },
  toggleSplitter: function() {
    debug('AppView.toggleSplitter');
    this.$el.toggleClass('split');
    if (this.$el.hasClass('split')) {
      this.activateSplitter();
    } else {
      this.deactivateSplitter();
    }
    return this.centreMap();
  },
  fetchSpeciesInfo: function() {
    debug('AppView.fetchSpeciesInfo');
    return $.ajax({
      url: '/speciesdata/species.json'
    }).done((function(_this) {
      return function(data) {
        var commonNameWriter, speciesLookupList, speciesSciNameList;
        speciesLookupList = [];
        speciesSciNameList = [];
        commonNameWriter = function(sciName) {
          var sciNamePostfix;
          sciNamePostfix = " (" + sciName + ")";
          return function(cnIndex, cn) {
            return speciesLookupList.push({
              label: cn + sciNamePostfix,
              value: sciName
            });
          };
        };
        $.each(data, function(sciName, commonNames) {
          speciesSciNameList.push(sciName);
          if (commonNames) {
            return $.each(commonNames, commonNameWriter(sciName));
          } else {
            return speciesLookupList.push({
              label: sciName,
              value: sciName
            });
          }
        });
        _this.speciesLookupList = speciesLookupList;
        return _this.speciesSciNameList = speciesSciNameList;
      };
    })(this));
  },
  buildLeftForm: function() {
    debug('AppView.buildLeftForm');
    return this.speciesInfoFetchProcess.done((function(_this) {
      return function() {
        var $leftmapspp;
        $leftmapspp = _this.$('#leftmapspp');
        return $leftmapspp.autocomplete({
          source: _this.speciesLookupList,
          appendTo: _this.$el,
          close: function() {
            return _this.$el.trigger('leftmapupdate');
          }
        });
      };
    })(this));
  },
  buildRightForm: function() {
    debug('AppView.buildRightForm');
    return this.speciesInfoFetchProcess.done((function(_this) {
      return function() {
        var $rightmapspp;
        $rightmapspp = _this.$('#rightmapspp');
        return $rightmapspp.autocomplete({
          source: _this.speciesLookupList,
          appendTo: _this.$el,
          close: function() {
            return _this.$el.trigger('rightmapupdate');
          }
        });
      };
    })(this));
  },
  startSplitterTracking: function() {
    debug('AppView.startSplitterTracking');
    this.trackSplitter = true;
    this.splitLine.addClass('dragging');
    return this.locateSplitter();
  },
  locateSplitter: function() {
    debug('AppView.locateSplitter');
    if (this.trackSplitter) {
      this.resizeThings();
      if (this.trackSplitter === 0) {
        this.trackSplitter = false;
      } else if (this.trackSplitter !== true) {
        this.trackSplitter -= 1;
      }
      return setTimeout(this.locateSplitter, this.trackPeriod);
    }
  },
  resizeThings: function() {
    var $mapBox, bottomRight, layerBottom, layerTop, leftLeft, leftMap, mapBounds, mapBox, newLeftWidth, rightMap, rightRight, splitPoint, splitX, topLeft;
    debug('AppView.resizeThings');
    if (this.leftLayer) {
      leftMap = $(this.leftLayer.getContainer());
    }
    if (this.rightLayer) {
      rightMap = $(this.rightLayer.getContainer());
    }
    if (this.$el.hasClass('split')) {
      newLeftWidth = this.splitThumb.position().left + (this.splitThumb.width() / 2.0);
      mapBox = this.map.getContainer();
      $mapBox = $(mapBox);
      mapBounds = mapBox.getBoundingClientRect();
      topLeft = this.map.containerPointToLayerPoint([0, 0]);
      splitPoint = this.map.containerPointToLayerPoint([newLeftWidth, 0]);
      bottomRight = this.map.containerPointToLayerPoint([$mapBox.width(), $mapBox.height()]);
      layerTop = topLeft.y;
      layerBottom = bottomRight.y;
      splitX = splitPoint.x - mapBounds.left;
      leftLeft = topLeft.x - mapBounds.left;
      rightRight = bottomRight.x;
      this.splitLine.css('left', newLeftWidth);
      this.leftTag.css('clip', "rect(0 " + newLeftWidth + "px auto 0)");
      if (this.leftLayer) {
        leftMap.css('clip', "rect(" + layerTop + "px " + splitX + "px " + layerBottom + "px " + leftLeft + "px)");
      }
      if (this.rightLayer) {
        return rightMap.css('clip', "rect(" + layerTop + "px " + rightRight + "px " + layerBottom + "px " + splitX + "px)");
      }
    } else {
      this.leftTag.css('clip', 'inherit');
      if (this.leftLayer) {
        leftMap.css('clip', 'inherit');
      }
      if (this.rightLayer) {
        return rightMap.css('clip', 'rect(0,0,0,0)');
      }
    }
  },
  stopSplitterTracking: function() {
    debug('AppView.stopSplitterTracking');
    this.splitLine.removeClass('dragging');
    return this.trackSplitter = 5;
  },
  activateSplitter: function() {
    debug('AppView.activateSplitter');
    this.splitThumb.draggable({
      containment: $('#mapwrapper'),
      scroll: false,
      start: this.startSplitterTracking,
      drag: this.resizeThings,
      stop: this.stopSplitterTracking
    });
    return this.resizeThings();
  },
  deactivateSplitter: function() {
    debug('AppView.deactivateSplitter');
    this.splitThumb.draggable('destroy');
    return this.resizeThings();
  }
}, {
  templates: {
    layout: _.template("<div class=\"splitline\"></div>\n<div class=\"splitthumb\"><span>&#x276e; &#x276f;</span></div>\n<div class=\"left tag\"><%= leftTag %></div>\n<div class=\"right tag\"><%= rightTag %></div>\n<div class=\"left form\"><%= leftForm %></div>\n<div class=\"right form\"><%= rightForm %></div>\n<div id=\"mapwrapper\"><div id=\"map\"></div></div>"),
    leftTag: _.template("<div class=\"show\">\n    <span class=\"leftlayername\">plain map</span>\n    <br>\n    <button class=\"btn-change\">settings</button>\n    <button class=\"btn-compare\">show/hide comparison map</button>\n</div>\n<div class=\"edit\">\n    <input id=\"leftmapspp\" name=\"leftmapspp\" placeholder=\"&hellip; species or group &hellip;\" />\n    <button class=\"btn-change\">done</button>\n    <button class=\"btn-compare\">compare +/-</button>\n</div>"),
    rightTag: _.template("<div class=\"show\">\n    <span class=\"rightlayername\">(no distribution)</span>\n</div>\n<div class=\"edit\">\n    <input id=\"rightmapspp\" name=\"rightmapspp\" placeholder=\"&hellip; species or group &hellip;\" />\n</div>"),
    leftForm: _.template("<p>\n<select class=\"left\" id=\"leftmapyear\">\n    <option value=\"baseline\">baseline</option>\n    <option value=\"2015\">2015</option>\n    <option value=\"2035\">2035</option>\n    <option value=\"2055\">2055</option>\n    <option value=\"2075\">2075</option>\n</select>\n</p><p>\n<select class=\"left\" id=\"leftmapscenario\">\n    <option>RCP3PD</option>\n    <option>RCP6</option>\n</select>\n</p><p>\n<select class=\"left\" id=\"leftmapgcm\">\n    <option value=\"all\">median</option>\n    <option value=\"csiro-mk30\">CSIRO Mark 3.0</option>\n</select>\n</p><p>\n<button class=\"btn-change\">done</button>\n</p><p>\n<button class=\"btn-compare\">compare + / -</button>\n</p>"),
    rightForm: _.template("<p>\n<select class=\"right\" id=\"rightmapyear\">\n    <option value=\"baseline\">baseline</option>\n    <option value=\"2015\">2015</option>\n    <option value=\"2035\">2035</option>\n    <option value=\"2055\">2055</option>\n    <option value=\"2075\">2075</option>\n</select>\n</p><p>\n<select class=\"right\" id=\"rightmapscenario\">\n    <option>RCP3PD</option>\n    <option>RCP6</option>\n</select>\n</p><p>\n<select class=\"right\" id=\"rightmapgcm\">\n    <option value=\"all\">median</option>\n    <option value=\"csiro-mk30\">CSIRO Mark 3.0</option>\n</select>\n</p><p>\n<button class=\"btn-change\">done</button>\n</p><p>\n<button class=\"btn-compare\">compare +/-</button>\n</p>")
  }
});

module.exports = AppView;

},{"../models/maplayer":3}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvcHZyZHdiL2pjdS9jbGltYXNuZy9jbGltYXMtbmcvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9mYWtlX2IxODIzOGY3LmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L21haW4uanMiLCIvVXNlcnMvcHZyZHdiL2pjdS9jbGltYXNuZy9jbGltYXMtbmcvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvbW9kZWxzL21hcGxheWVyLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L3ZpZXdzL2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5yZXF1aXJlKCcuL21hcHZpZXcvbWFpbicpO1xuXG4kKCdoZWFkZXInKS5kaXNhYmxlU2VsZWN0aW9uKCk7IC8vIHVucG9wdWxhciBidXQgc3RpbGwgYmV0dGVyXG4kKCduYXYgPiB1bCcpLm1zcHAoe30pO1xuIiwidmFyIEFwcFZpZXc7XG5cbmlmICghd2luZG93LmNvbnNvbGUpIHtcbiAgd2luZG93LmNvbnNvbGUgPSB7XG4gICAgbG9nOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH07XG59XG5cbkFwcFZpZXcgPSByZXF1aXJlKCcuL3ZpZXdzL2FwcCcpO1xuXG4kKGZ1bmN0aW9uKCkge1xuICB2YXIgYXBwdmlldztcbiAgYXBwdmlldyA9IG5ldyBBcHBWaWV3KCk7XG4gIHJldHVybiBhcHB2aWV3LnJlbmRlcigpO1xufSk7XG4iLCJ2YXIgTWFwTGF5ZXI7XG5cbk1hcExheWVyID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcbiAgY29uc3RydWN0b3I6IGZ1bmN0aW9uKHNob3J0TmFtZSwgbG9uZ05hbWUsIHBhdGgpIHtcbiAgICB0aGlzLnNob3J0TmFtZSA9IHNob3J0TmFtZTtcbiAgICB0aGlzLmxvbmdOYW1lID0gbG9uZ05hbWU7XG4gICAgdGhpcy5wYXRoID0gcGF0aDtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwTGF5ZXI7XG4iLCJ2YXIgQXBwVmlldywgTWFwTGF5ZXIsIGRlYnVnLFxuICBfX2luZGV4T2YgPSBbXS5pbmRleE9mIHx8IGZ1bmN0aW9uKGl0ZW0pIHsgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDsgaSA8IGw7IGkrKykgeyBpZiAoaSBpbiB0aGlzICYmIHRoaXNbaV0gPT09IGl0ZW0pIHJldHVybiBpOyB9IHJldHVybiAtMTsgfTtcblxuTWFwTGF5ZXIgPSByZXF1aXJlKCcuLi9tb2RlbHMvbWFwbGF5ZXInKTtcblxuXG4vKiBqc2hpbnQgLVcwOTMgKi9cblxuZGVidWcgPSBmdW5jdGlvbihpdGVtVG9Mb2csIGl0ZW1MZXZlbCkge1xuICB2YXIgbGV2ZWxzLCBtZXNzYWdlTnVtLCB0aHJlc2hvbGQsIHRocmVzaG9sZE51bTtcbiAgbGV2ZWxzID0gWydkZWJ1ZycsICdtZXNzYWdlJywgJ3dhcm5pbmcnXTtcbiAgdGhyZXNob2xkID0gJ2RlYnVnJztcbiAgaWYgKCFpdGVtTGV2ZWwpIHtcbiAgICBpdGVtTGV2ZWwgPSBsZXZlbHNbMF07XG4gIH1cbiAgdGhyZXNob2xkTnVtID0gbGV2ZWxzLmluZGV4T2YodGhyZXNob2xkKTtcbiAgbWVzc2FnZU51bSA9IGxldmVscy5pbmRleE9mKGl0ZW1MZXZlbCk7XG4gIGlmICh0aHJlc2hvbGROdW0gPiBtZXNzYWdlTnVtKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChpdGVtVG9Mb2cgKyAnJyA9PT0gaXRlbVRvTG9nKSB7XG4gICAgcmV0dXJuIGNvbnNvbGUubG9nKFwiW1wiICsgaXRlbUxldmVsICsgXCJdIFwiICsgaXRlbVRvTG9nKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gY29uc29sZS5sb2coaXRlbVRvTG9nKTtcbiAgfVxufTtcblxuQXBwVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcbiAgdGFnTmFtZTogJ2RpdicsXG4gIGNsYXNzTmFtZTogJ3NwbGl0bWFwIHNob3dmb3JtcycsXG4gIGlkOiAnc3BsaXRtYXAnLFxuICB0cmFja1NwbGl0dGVyOiBmYWxzZSxcbiAgdHJhY2tQZXJpb2Q6IDEwMCxcbiAgZXZlbnRzOiB7XG4gICAgJ2NsaWNrIC5idG4tY2hhbmdlJzogJ3RvZ2dsZUZvcm1zJyxcbiAgICAnY2xpY2sgLmJ0bi1jb21wYXJlJzogJ3RvZ2dsZVNwbGl0dGVyJyxcbiAgICAnbGVmdG1hcHVwZGF0ZSc6ICdsZWZ0U2lkZVVwZGF0ZScsXG4gICAgJ3JpZ2h0bWFwdXBkYXRlJzogJ3JpZ2h0U2lkZVVwZGF0ZScsXG4gICAgJ2NoYW5nZSBzZWxlY3QubGVmdCc6ICdsZWZ0U2lkZVVwZGF0ZScsXG4gICAgJ2NoYW5nZSBzZWxlY3QucmlnaHQnOiAncmlnaHRTaWRlVXBkYXRlJ1xuICB9LFxuICB0aWNrOiBmdW5jdGlvbigpIHtcbiAgICBpZiAoZmFsc2UpIHtcbiAgICAgIGRlYnVnKHRoaXMubWFwLmdldFBpeGVsT3JpZ2luKCkpO1xuICAgIH1cbiAgICByZXR1cm4gc2V0VGltZW91dCh0aGlzLnRpY2ssIDIwMDApO1xuICB9LFxuICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICBkZWJ1ZygnQXBwVmlldy5pbml0aWFsaXplJyk7XG4gICAgdGhpcy5tYXBMYXllciA9IG5ldyBNYXBMYXllcignbGVmdCcsICdMZWZ0IE1hcCcsICdsZWZ0Lm1hcCcpO1xuICAgIF8uYmluZEFsbC5hcHBseShfLCBbdGhpc10uY29uY2F0KF8uZnVuY3Rpb25zKHRoaXMpKSk7XG4gICAgcmV0dXJuIHRoaXMuc3BlY2llc0luZm9GZXRjaFByb2Nlc3MgPSB0aGlzLmZldGNoU3BlY2llc0luZm8oKTtcbiAgfSxcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICBkZWJ1ZygnQXBwVmlldy5yZW5kZXInKTtcbiAgICB0aGlzLiRlbC5hcHBlbmQoQXBwVmlldy50ZW1wbGF0ZXMubGF5b3V0KHtcbiAgICAgIGxlZnRUYWc6IEFwcFZpZXcudGVtcGxhdGVzLmxlZnRUYWcoKSxcbiAgICAgIHJpZ2h0VGFnOiBBcHBWaWV3LnRlbXBsYXRlcy5yaWdodFRhZygpLFxuICAgICAgbGVmdEZvcm06IEFwcFZpZXcudGVtcGxhdGVzLmxlZnRGb3JtKCksXG4gICAgICByaWdodEZvcm06IEFwcFZpZXcudGVtcGxhdGVzLnJpZ2h0Rm9ybSgpXG4gICAgfSkpO1xuICAgICQoJyNjb250ZW50d3JhcCcpLmFwcGVuZCh0aGlzLiRlbCk7XG4gICAgdGhpcy5tYXAgPSBMLm1hcCgnbWFwJywge1xuICAgICAgY2VudGVyOiBbLTIwLCAxMzZdLFxuICAgICAgem9vbTogNVxuICAgIH0pO1xuICAgIHRoaXMubWFwLm9uKCdtb3ZlJywgdGhpcy5yZXNpemVUaGluZ3MpO1xuICAgIEwudGlsZUxheWVyKCdodHRwOi8vb3RpbGV7c30ubXFjZG4uY29tL3RpbGVzLzEuMC4wL21hcC97en0ve3h9L3t5fS5wbmcnLCB7XG4gICAgICBzdWJkb21haW5zOiAnMTIzNCcsXG4gICAgICBtYXhab29tOiAxOCxcbiAgICAgIGF0dHJpYnV0aW9uOiAnTWFwIGRhdGEgJmNvcHk7IDxhIGhyZWY9XCJodHRwOi8vb3BlbnN0cmVldG1hcC5vcmdcIj5PcGVuU3RyZWV0TWFwPC9hPixcXG50aWxlcyAmY29weTsgPGEgaHJlZj1cImh0dHA6Ly93d3cubWFwcXVlc3QuY29tL1wiIHRhcmdldD1cIl9ibGFua1wiPk1hcFF1ZXN0PC9hPidcbiAgICB9KS5hZGRUbyh0aGlzLm1hcCk7XG4gICAgdGhpcy5sZWZ0Rm9ybSA9IHRoaXMuJCgnLmxlZnQuZm9ybScpO1xuICAgIHRoaXMuYnVpbGRMZWZ0Rm9ybSgpO1xuICAgIHRoaXMucmlnaHRGb3JtID0gdGhpcy4kKCcucmlnaHQuZm9ybScpO1xuICAgIHRoaXMuYnVpbGRSaWdodEZvcm0oKTtcbiAgICB0aGlzLmxlZnRUYWcgPSB0aGlzLiQoJy5sZWZ0LnRhZycpO1xuICAgIHRoaXMucmlnaHRUYWcgPSB0aGlzLiQoJy5yaWdodC50YWcnKTtcbiAgICB0aGlzLnNwbGl0TGluZSA9IHRoaXMuJCgnLnNwbGl0bGluZScpO1xuICAgIHJldHVybiB0aGlzLnNwbGl0VGh1bWIgPSB0aGlzLiQoJy5zcGxpdHRodW1iJyk7XG4gIH0sXG4gIGxlZnRTaWRlVXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbmV3TGVmdEluZm8sIHNwcE5hbWU7XG4gICAgZGVidWcoJ0FwcFZpZXcubGVmdFNpZGVVcGRhdGUnKTtcbiAgICBzcHBOYW1lID0gdGhpcy4kKCcjbGVmdG1hcHNwcCcpLnZhbCgpO1xuICAgIGlmIChfX2luZGV4T2YuY2FsbCh0aGlzLnNwZWNpZXNTY2lOYW1lTGlzdCwgc3BwTmFtZSkgPCAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIG5ld0xlZnRJbmZvID0ge1xuICAgICAgc3BlY2llc05hbWU6IHNwcE5hbWUsXG4gICAgICB5ZWFyOiB0aGlzLiQoJyNsZWZ0bWFweWVhcicpLnZhbCgpLFxuICAgICAgc2NlbmFyaW86IHRoaXMuJCgnI2xlZnRtYXBzY2VuYXJpbycpLnZhbCgpLFxuICAgICAgZ2NtOiB0aGlzLiQoJyNsZWZ0bWFwZ2NtJykudmFsKClcbiAgICB9O1xuICAgIGlmICh0aGlzLmxlZnRJbmZvICYmIF8uaXNFcXVhbChuZXdMZWZ0SW5mbywgdGhpcy5sZWZ0SW5mbykpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHRoaXMubGVmdEluZm8gJiYgbmV3TGVmdEluZm8uc3BlY2llc05hbWUgPT09IHRoaXMubGVmdEluZm8uc3BlY2llc05hbWUgJiYgbmV3TGVmdEluZm8ueWVhciA9PT0gdGhpcy5sZWZ0SW5mby55ZWFyICYmIG5ld0xlZnRJbmZvLnllYXIgPT09ICdiYXNlbGluZScpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy5sZWZ0SW5mbyA9IG5ld0xlZnRJbmZvO1xuICAgIHRoaXMuYWRkTWFwTGF5ZXIoJ2xlZnQnKTtcbiAgICByZXR1cm4gdGhpcy5hZGRNYXBUYWcoJ2xlZnQnKTtcbiAgfSxcbiAgcmlnaHRTaWRlVXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbmV3UmlnaHRJbmZvLCBzcHBOYW1lO1xuICAgIGRlYnVnKCdBcHBWaWV3LnJpZ2h0U2lkZVVwZGF0ZScpO1xuICAgIHNwcE5hbWUgPSB0aGlzLiQoJyNyaWdodG1hcHNwcCcpLnZhbCgpO1xuICAgIGlmIChfX2luZGV4T2YuY2FsbCh0aGlzLnNwZWNpZXNTY2lOYW1lTGlzdCwgc3BwTmFtZSkgPCAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIG5ld1JpZ2h0SW5mbyA9IHtcbiAgICAgIHNwZWNpZXNOYW1lOiBzcHBOYW1lLFxuICAgICAgeWVhcjogdGhpcy4kKCcjcmlnaHRtYXB5ZWFyJykudmFsKCksXG4gICAgICBzY2VuYXJpbzogdGhpcy4kKCcjcmlnaHRtYXBzY2VuYXJpbycpLnZhbCgpLFxuICAgICAgZ2NtOiB0aGlzLiQoJyNyaWdodG1hcGdjbScpLnZhbCgpXG4gICAgfTtcbiAgICBpZiAodGhpcy5yaWdodEluZm8gJiYgXy5pc0VxdWFsKG5ld1JpZ2h0SW5mbywgdGhpcy5yaWdodEluZm8pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmICh0aGlzLnJpZ2h0SW5mbyAmJiBuZXdSaWdodEluZm8uc3BlY2llc05hbWUgPT09IHRoaXMucmlnaHRJbmZvLnNwZWNpZXNOYW1lICYmIG5ld1JpZ2h0SW5mby55ZWFyID09PSB0aGlzLnJpZ2h0SW5mby55ZWFyICYmIG5ld1JpZ2h0SW5mby55ZWFyID09PSAnYmFzZWxpbmUnKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMucmlnaHRJbmZvID0gbmV3UmlnaHRJbmZvO1xuICAgIHRoaXMuYWRkTWFwTGF5ZXIoJ3JpZ2h0Jyk7XG4gICAgcmV0dXJuIHRoaXMuYWRkTWFwVGFnKCdyaWdodCcpO1xuICB9LFxuICBhZGRNYXBUYWc6IGZ1bmN0aW9uKHNpZGUpIHtcbiAgICB2YXIgaW5mbywgdGFnO1xuICAgIGRlYnVnKCdBcHBWaWV3LmFkZE1hcFRhZycpO1xuICAgIGlmIChzaWRlID09PSAnbGVmdCcpIHtcbiAgICAgIGluZm8gPSB0aGlzLmxlZnRJbmZvO1xuICAgIH1cbiAgICBpZiAoc2lkZSA9PT0gJ3JpZ2h0Jykge1xuICAgICAgaW5mbyA9IHRoaXMucmlnaHRJbmZvO1xuICAgIH1cbiAgICB0YWcgPSBcIjxiPjxpPlwiICsgaW5mby5zcGVjaWVzTmFtZSArIFwiPC9pPjwvYj5cIjtcbiAgICBpZiAoaW5mby55ZWFyID09PSAnYmFzZWxpbmUnKSB7XG4gICAgICB0YWcgPSBcImN1cnJlbnQgXCIgKyB0YWcgKyBcIiBkaXN0cmlidXRpb25cIjtcbiAgICB9IGVsc2UgaWYgKGluZm8uZ2NtID09PSAnYWxsJykge1xuICAgICAgdGFnID0gXCI8Yj5tZWRpYW48L2I+IHByb2plY3Rpb25zIGZvciBcIiArIHRhZyArIFwiIGluIDxiPlwiICsgaW5mby55ZWFyICsgXCI8L2I+IGlmIDxiPlwiICsgaW5mby5zY2VuYXJpbyArIFwiPC9iPlwiO1xuICAgIH0gZWxzZSB7XG4gICAgICB0YWcgPSBcIjxiPlwiICsgaW5mby5nY20gKyBcIjwvYj4gcHJvamVjdGlvbnMgZm9yIFwiICsgdGFnICsgXCIgaW4gPGI+XCIgKyBpbmZvLnllYXIgKyBcIjwvYj4gaWYgPGI+XCIgKyBpbmZvLnNjZW5hcmlvICsgXCI8L2I+XCI7XG4gICAgfVxuICAgIGlmIChzaWRlID09PSAnbGVmdCcpIHtcbiAgICAgIHRoaXMubGVmdFRhZy5maW5kKCcubGVmdGxheWVybmFtZScpLmh0bWwodGFnKTtcbiAgICB9XG4gICAgaWYgKHNpZGUgPT09ICdyaWdodCcpIHtcbiAgICAgIHJldHVybiB0aGlzLnJpZ2h0VGFnLmZpbmQoJy5yaWdodGxheWVybmFtZScpLmh0bWwodGFnKTtcbiAgICB9XG4gIH0sXG4gIGFkZE1hcExheWVyOiBmdW5jdGlvbihzaWRlKSB7XG4gICAgdmFyIGZ1dHVyZU1vZGVsUG9pbnQsIGxheWVyLCBtYXBEYXRhLCByYXN0ZXJBcGlVcmwsIHNpZGVJbmZvO1xuICAgIGRlYnVnKCdBcHBWaWV3LmFkZE1hcExheWVyJyk7XG4gICAgaWYgKHNpZGUgPT09ICdsZWZ0Jykge1xuICAgICAgc2lkZUluZm8gPSB0aGlzLmxlZnRJbmZvO1xuICAgIH1cbiAgICBpZiAoc2lkZSA9PT0gJ3JpZ2h0Jykge1xuICAgICAgc2lkZUluZm8gPSB0aGlzLnJpZ2h0SW5mbztcbiAgICB9XG4gICAgZnV0dXJlTW9kZWxQb2ludCA9IFtzaWRlSW5mby5zY2VuYXJpbywgc2lkZUluZm8uZ2NtLCBzaWRlSW5mby55ZWFyXS5qb2luKCdfJyk7XG4gICAgaWYgKHNpZGVJbmZvLnllYXIgPT09ICdiYXNlbGluZScpIHtcbiAgICAgIGZ1dHVyZU1vZGVsUG9pbnQgPSAnMTk5MCc7XG4gICAgfVxuICAgIHJhc3RlckFwaVVybCA9ICdodHRwOi8vbG9jYWxob3N0OjEwNjAwL2FwaS9yYXN0ZXIvMS93bXNfZGF0YV91cmwnO1xuICAgIG1hcERhdGEgPSBbJ2h0dHA6Ly9sb2NhbGhvc3Q6NjU0My9zcGVjaWVzZGF0YScsIHNpZGVJbmZvLnNwZWNpZXNOYW1lLnJlcGxhY2UoJyAnLCAnXycpLCAnb3V0cHV0JywgZnV0dXJlTW9kZWxQb2ludCArICcuYXNjLmd6J10uam9pbignLycpO1xuICAgIGxheWVyID0gTC50aWxlTGF5ZXIud21zKHJhc3RlckFwaVVybCwge1xuICAgICAgREFUQV9VUkw6IG1hcERhdGEsXG4gICAgICBsYXllcnM6ICdERUZBVUxUJyxcbiAgICAgIGZvcm1hdDogJ2ltYWdlL3BuZycsXG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZVxuICAgIH0pO1xuICAgIGxheWVyLmFkZFRvKHRoaXMubWFwKTtcbiAgICBpZiAoc2lkZSA9PT0gJ2xlZnQnKSB7XG4gICAgICBpZiAodGhpcy5sZWZ0TGF5ZXIpIHtcbiAgICAgICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIodGhpcy5sZWZ0TGF5ZXIpO1xuICAgICAgfVxuICAgICAgdGhpcy5sZWZ0TGF5ZXIgPSBsYXllcjtcbiAgICB9XG4gICAgaWYgKHNpZGUgPT09ICdyaWdodCcpIHtcbiAgICAgIGlmICh0aGlzLnJpZ2h0TGF5ZXIpIHtcbiAgICAgICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIodGhpcy5yaWdodExheWVyKTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmlnaHRMYXllciA9IGxheWVyO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5yZXNpemVUaGluZ3MoKTtcbiAgfSxcbiAgY2VudHJlTWFwOiBmdW5jdGlvbihyZXBlYXRlZGx5Rm9yKSB7XG4gICAgdmFyIGxhdGVyLCByZWNlbnRyZSwgX2ksIF9yZXN1bHRzO1xuICAgIGRlYnVnKCdBcHBWaWV3LmNlbnRyZU1hcCcpO1xuICAgIGlmICghcmVwZWF0ZWRseUZvcikge1xuICAgICAgcmVwZWF0ZWRseUZvciA9IDUwMDtcbiAgICB9XG4gICAgcmVjZW50cmUgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMubWFwLmludmFsaWRhdGVTaXplKGZhbHNlKTtcbiAgICAgICAgcmV0dXJuIF90aGlzLnJlc2l6ZVRoaW5ncygpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKTtcbiAgICBfcmVzdWx0cyA9IFtdO1xuICAgIGZvciAobGF0ZXIgPSBfaSA9IDA7IF9pIDw9IHJlcGVhdGVkbHlGb3I7IGxhdGVyID0gX2kgKz0gMjUpIHtcbiAgICAgIF9yZXN1bHRzLnB1c2goc2V0VGltZW91dChyZWNlbnRyZSwgbGF0ZXIpKTtcbiAgICB9XG4gICAgcmV0dXJuIF9yZXN1bHRzO1xuICB9LFxuICB0b2dnbGVGb3JtczogZnVuY3Rpb24oKSB7XG4gICAgZGVidWcoJ0FwcFZpZXcudG9nZ2xlRm9ybXMnKTtcbiAgICB0aGlzLiRlbC50b2dnbGVDbGFzcygnc2hvd2Zvcm1zJyk7XG4gICAgcmV0dXJuIHRoaXMuY2VudHJlTWFwKCk7XG4gIH0sXG4gIHRvZ2dsZVNwbGl0dGVyOiBmdW5jdGlvbigpIHtcbiAgICBkZWJ1ZygnQXBwVmlldy50b2dnbGVTcGxpdHRlcicpO1xuICAgIHRoaXMuJGVsLnRvZ2dsZUNsYXNzKCdzcGxpdCcpO1xuICAgIGlmICh0aGlzLiRlbC5oYXNDbGFzcygnc3BsaXQnKSkge1xuICAgICAgdGhpcy5hY3RpdmF0ZVNwbGl0dGVyKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGVhY3RpdmF0ZVNwbGl0dGVyKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNlbnRyZU1hcCgpO1xuICB9LFxuICBmZXRjaFNwZWNpZXNJbmZvOiBmdW5jdGlvbigpIHtcbiAgICBkZWJ1ZygnQXBwVmlldy5mZXRjaFNwZWNpZXNJbmZvJyk7XG4gICAgcmV0dXJuICQuYWpheCh7XG4gICAgICB1cmw6ICcvc3BlY2llc2RhdGEvc3BlY2llcy5qc29uJ1xuICAgIH0pLmRvbmUoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgY29tbW9uTmFtZVdyaXRlciwgc3BlY2llc0xvb2t1cExpc3QsIHNwZWNpZXNTY2lOYW1lTGlzdDtcbiAgICAgICAgc3BlY2llc0xvb2t1cExpc3QgPSBbXTtcbiAgICAgICAgc3BlY2llc1NjaU5hbWVMaXN0ID0gW107XG4gICAgICAgIGNvbW1vbk5hbWVXcml0ZXIgPSBmdW5jdGlvbihzY2lOYW1lKSB7XG4gICAgICAgICAgdmFyIHNjaU5hbWVQb3N0Zml4O1xuICAgICAgICAgIHNjaU5hbWVQb3N0Zml4ID0gXCIgKFwiICsgc2NpTmFtZSArIFwiKVwiO1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbihjbkluZGV4LCBjbikge1xuICAgICAgICAgICAgcmV0dXJuIHNwZWNpZXNMb29rdXBMaXN0LnB1c2goe1xuICAgICAgICAgICAgICBsYWJlbDogY24gKyBzY2lOYW1lUG9zdGZpeCxcbiAgICAgICAgICAgICAgdmFsdWU6IHNjaU5hbWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgICAgICQuZWFjaChkYXRhLCBmdW5jdGlvbihzY2lOYW1lLCBjb21tb25OYW1lcykge1xuICAgICAgICAgIHNwZWNpZXNTY2lOYW1lTGlzdC5wdXNoKHNjaU5hbWUpO1xuICAgICAgICAgIGlmIChjb21tb25OYW1lcykge1xuICAgICAgICAgICAgcmV0dXJuICQuZWFjaChjb21tb25OYW1lcywgY29tbW9uTmFtZVdyaXRlcihzY2lOYW1lKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBzcGVjaWVzTG9va3VwTGlzdC5wdXNoKHtcbiAgICAgICAgICAgICAgbGFiZWw6IHNjaU5hbWUsXG4gICAgICAgICAgICAgIHZhbHVlOiBzY2lOYW1lXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBfdGhpcy5zcGVjaWVzTG9va3VwTGlzdCA9IHNwZWNpZXNMb29rdXBMaXN0O1xuICAgICAgICByZXR1cm4gX3RoaXMuc3BlY2llc1NjaU5hbWVMaXN0ID0gc3BlY2llc1NjaU5hbWVMaXN0O1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIGJ1aWxkTGVmdEZvcm06IGZ1bmN0aW9uKCkge1xuICAgIGRlYnVnKCdBcHBWaWV3LmJ1aWxkTGVmdEZvcm0nKTtcbiAgICByZXR1cm4gdGhpcy5zcGVjaWVzSW5mb0ZldGNoUHJvY2Vzcy5kb25lKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJGxlZnRtYXBzcHA7XG4gICAgICAgICRsZWZ0bWFwc3BwID0gX3RoaXMuJCgnI2xlZnRtYXBzcHAnKTtcbiAgICAgICAgcmV0dXJuICRsZWZ0bWFwc3BwLmF1dG9jb21wbGV0ZSh7XG4gICAgICAgICAgc291cmNlOiBfdGhpcy5zcGVjaWVzTG9va3VwTGlzdCxcbiAgICAgICAgICBhcHBlbmRUbzogX3RoaXMuJGVsLFxuICAgICAgICAgIGNsb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcy4kZWwudHJpZ2dlcignbGVmdG1hcHVwZGF0ZScpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgYnVpbGRSaWdodEZvcm06IGZ1bmN0aW9uKCkge1xuICAgIGRlYnVnKCdBcHBWaWV3LmJ1aWxkUmlnaHRGb3JtJyk7XG4gICAgcmV0dXJuIHRoaXMuc3BlY2llc0luZm9GZXRjaFByb2Nlc3MuZG9uZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyICRyaWdodG1hcHNwcDtcbiAgICAgICAgJHJpZ2h0bWFwc3BwID0gX3RoaXMuJCgnI3JpZ2h0bWFwc3BwJyk7XG4gICAgICAgIHJldHVybiAkcmlnaHRtYXBzcHAuYXV0b2NvbXBsZXRlKHtcbiAgICAgICAgICBzb3VyY2U6IF90aGlzLnNwZWNpZXNMb29rdXBMaXN0LFxuICAgICAgICAgIGFwcGVuZFRvOiBfdGhpcy4kZWwsXG4gICAgICAgICAgY2xvc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIF90aGlzLiRlbC50cmlnZ2VyKCdyaWdodG1hcHVwZGF0ZScpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgc3RhcnRTcGxpdHRlclRyYWNraW5nOiBmdW5jdGlvbigpIHtcbiAgICBkZWJ1ZygnQXBwVmlldy5zdGFydFNwbGl0dGVyVHJhY2tpbmcnKTtcbiAgICB0aGlzLnRyYWNrU3BsaXR0ZXIgPSB0cnVlO1xuICAgIHRoaXMuc3BsaXRMaW5lLmFkZENsYXNzKCdkcmFnZ2luZycpO1xuICAgIHJldHVybiB0aGlzLmxvY2F0ZVNwbGl0dGVyKCk7XG4gIH0sXG4gIGxvY2F0ZVNwbGl0dGVyOiBmdW5jdGlvbigpIHtcbiAgICBkZWJ1ZygnQXBwVmlldy5sb2NhdGVTcGxpdHRlcicpO1xuICAgIGlmICh0aGlzLnRyYWNrU3BsaXR0ZXIpIHtcbiAgICAgIHRoaXMucmVzaXplVGhpbmdzKCk7XG4gICAgICBpZiAodGhpcy50cmFja1NwbGl0dGVyID09PSAwKSB7XG4gICAgICAgIHRoaXMudHJhY2tTcGxpdHRlciA9IGZhbHNlO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnRyYWNrU3BsaXR0ZXIgIT09IHRydWUpIHtcbiAgICAgICAgdGhpcy50cmFja1NwbGl0dGVyIC09IDE7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2V0VGltZW91dCh0aGlzLmxvY2F0ZVNwbGl0dGVyLCB0aGlzLnRyYWNrUGVyaW9kKTtcbiAgICB9XG4gIH0sXG4gIHJlc2l6ZVRoaW5nczogZnVuY3Rpb24oKSB7XG4gICAgdmFyICRtYXBCb3gsIGJvdHRvbVJpZ2h0LCBsYXllckJvdHRvbSwgbGF5ZXJUb3AsIGxlZnRMZWZ0LCBsZWZ0TWFwLCBtYXBCb3VuZHMsIG1hcEJveCwgbmV3TGVmdFdpZHRoLCByaWdodE1hcCwgcmlnaHRSaWdodCwgc3BsaXRQb2ludCwgc3BsaXRYLCB0b3BMZWZ0O1xuICAgIGRlYnVnKCdBcHBWaWV3LnJlc2l6ZVRoaW5ncycpO1xuICAgIGlmICh0aGlzLmxlZnRMYXllcikge1xuICAgICAgbGVmdE1hcCA9ICQodGhpcy5sZWZ0TGF5ZXIuZ2V0Q29udGFpbmVyKCkpO1xuICAgIH1cbiAgICBpZiAodGhpcy5yaWdodExheWVyKSB7XG4gICAgICByaWdodE1hcCA9ICQodGhpcy5yaWdodExheWVyLmdldENvbnRhaW5lcigpKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuJGVsLmhhc0NsYXNzKCdzcGxpdCcpKSB7XG4gICAgICBuZXdMZWZ0V2lkdGggPSB0aGlzLnNwbGl0VGh1bWIucG9zaXRpb24oKS5sZWZ0ICsgKHRoaXMuc3BsaXRUaHVtYi53aWR0aCgpIC8gMi4wKTtcbiAgICAgIG1hcEJveCA9IHRoaXMubWFwLmdldENvbnRhaW5lcigpO1xuICAgICAgJG1hcEJveCA9ICQobWFwQm94KTtcbiAgICAgIG1hcEJvdW5kcyA9IG1hcEJveC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIHRvcExlZnQgPSB0aGlzLm1hcC5jb250YWluZXJQb2ludFRvTGF5ZXJQb2ludChbMCwgMF0pO1xuICAgICAgc3BsaXRQb2ludCA9IHRoaXMubWFwLmNvbnRhaW5lclBvaW50VG9MYXllclBvaW50KFtuZXdMZWZ0V2lkdGgsIDBdKTtcbiAgICAgIGJvdHRvbVJpZ2h0ID0gdGhpcy5tYXAuY29udGFpbmVyUG9pbnRUb0xheWVyUG9pbnQoWyRtYXBCb3gud2lkdGgoKSwgJG1hcEJveC5oZWlnaHQoKV0pO1xuICAgICAgbGF5ZXJUb3AgPSB0b3BMZWZ0Lnk7XG4gICAgICBsYXllckJvdHRvbSA9IGJvdHRvbVJpZ2h0Lnk7XG4gICAgICBzcGxpdFggPSBzcGxpdFBvaW50LnggLSBtYXBCb3VuZHMubGVmdDtcbiAgICAgIGxlZnRMZWZ0ID0gdG9wTGVmdC54IC0gbWFwQm91bmRzLmxlZnQ7XG4gICAgICByaWdodFJpZ2h0ID0gYm90dG9tUmlnaHQueDtcbiAgICAgIHRoaXMuc3BsaXRMaW5lLmNzcygnbGVmdCcsIG5ld0xlZnRXaWR0aCk7XG4gICAgICB0aGlzLmxlZnRUYWcuY3NzKCdjbGlwJywgXCJyZWN0KDAgXCIgKyBuZXdMZWZ0V2lkdGggKyBcInB4IGF1dG8gMClcIik7XG4gICAgICBpZiAodGhpcy5sZWZ0TGF5ZXIpIHtcbiAgICAgICAgbGVmdE1hcC5jc3MoJ2NsaXAnLCBcInJlY3QoXCIgKyBsYXllclRvcCArIFwicHggXCIgKyBzcGxpdFggKyBcInB4IFwiICsgbGF5ZXJCb3R0b20gKyBcInB4IFwiICsgbGVmdExlZnQgKyBcInB4KVwiKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnJpZ2h0TGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuIHJpZ2h0TWFwLmNzcygnY2xpcCcsIFwicmVjdChcIiArIGxheWVyVG9wICsgXCJweCBcIiArIHJpZ2h0UmlnaHQgKyBcInB4IFwiICsgbGF5ZXJCb3R0b20gKyBcInB4IFwiICsgc3BsaXRYICsgXCJweClcIik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubGVmdFRhZy5jc3MoJ2NsaXAnLCAnaW5oZXJpdCcpO1xuICAgICAgaWYgKHRoaXMubGVmdExheWVyKSB7XG4gICAgICAgIGxlZnRNYXAuY3NzKCdjbGlwJywgJ2luaGVyaXQnKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnJpZ2h0TGF5ZXIpIHtcbiAgICAgICAgcmV0dXJuIHJpZ2h0TWFwLmNzcygnY2xpcCcsICdyZWN0KDAsMCwwLDApJyk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBzdG9wU3BsaXR0ZXJUcmFja2luZzogZnVuY3Rpb24oKSB7XG4gICAgZGVidWcoJ0FwcFZpZXcuc3RvcFNwbGl0dGVyVHJhY2tpbmcnKTtcbiAgICB0aGlzLnNwbGl0TGluZS5yZW1vdmVDbGFzcygnZHJhZ2dpbmcnKTtcbiAgICByZXR1cm4gdGhpcy50cmFja1NwbGl0dGVyID0gNTtcbiAgfSxcbiAgYWN0aXZhdGVTcGxpdHRlcjogZnVuY3Rpb24oKSB7XG4gICAgZGVidWcoJ0FwcFZpZXcuYWN0aXZhdGVTcGxpdHRlcicpO1xuICAgIHRoaXMuc3BsaXRUaHVtYi5kcmFnZ2FibGUoe1xuICAgICAgY29udGFpbm1lbnQ6ICQoJyNtYXB3cmFwcGVyJyksXG4gICAgICBzY3JvbGw6IGZhbHNlLFxuICAgICAgc3RhcnQ6IHRoaXMuc3RhcnRTcGxpdHRlclRyYWNraW5nLFxuICAgICAgZHJhZzogdGhpcy5yZXNpemVUaGluZ3MsXG4gICAgICBzdG9wOiB0aGlzLnN0b3BTcGxpdHRlclRyYWNraW5nXG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXMucmVzaXplVGhpbmdzKCk7XG4gIH0sXG4gIGRlYWN0aXZhdGVTcGxpdHRlcjogZnVuY3Rpb24oKSB7XG4gICAgZGVidWcoJ0FwcFZpZXcuZGVhY3RpdmF0ZVNwbGl0dGVyJyk7XG4gICAgdGhpcy5zcGxpdFRodW1iLmRyYWdnYWJsZSgnZGVzdHJveScpO1xuICAgIHJldHVybiB0aGlzLnJlc2l6ZVRoaW5ncygpO1xuICB9XG59LCB7XG4gIHRlbXBsYXRlczoge1xuICAgIGxheW91dDogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInNwbGl0bGluZVxcXCI+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwic3BsaXR0aHVtYlxcXCI+PHNwYW4+JiN4Mjc2ZTsgJiN4Mjc2Zjs8L3NwYW4+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwibGVmdCB0YWdcXFwiPjwlPSBsZWZ0VGFnICU+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwicmlnaHQgdGFnXFxcIj48JT0gcmlnaHRUYWcgJT48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJsZWZ0IGZvcm1cXFwiPjwlPSBsZWZ0Rm9ybSAlPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcInJpZ2h0IGZvcm1cXFwiPjwlPSByaWdodEZvcm0gJT48L2Rpdj5cXG48ZGl2IGlkPVxcXCJtYXB3cmFwcGVyXFxcIj48ZGl2IGlkPVxcXCJtYXBcXFwiPjwvZGl2PjwvZGl2PlwiKSxcbiAgICBsZWZ0VGFnOiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwic2hvd1xcXCI+XFxuICAgIDxzcGFuIGNsYXNzPVxcXCJsZWZ0bGF5ZXJuYW1lXFxcIj5wbGFpbiBtYXA8L3NwYW4+XFxuICAgIDxicj5cXG4gICAgPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNoYW5nZVxcXCI+c2V0dGluZ3M8L2J1dHRvbj5cXG4gICAgPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNvbXBhcmVcXFwiPnNob3cvaGlkZSBjb21wYXJpc29uIG1hcDwvYnV0dG9uPlxcbjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcImVkaXRcXFwiPlxcbiAgICA8aW5wdXQgaWQ9XFxcImxlZnRtYXBzcHBcXFwiIG5hbWU9XFxcImxlZnRtYXBzcHBcXFwiIHBsYWNlaG9sZGVyPVxcXCImaGVsbGlwOyBzcGVjaWVzIG9yIGdyb3VwICZoZWxsaXA7XFxcIiAvPlxcbiAgICA8YnV0dG9uIGNsYXNzPVxcXCJidG4tY2hhbmdlXFxcIj5kb25lPC9idXR0b24+XFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0bi1jb21wYXJlXFxcIj5jb21wYXJlICsvLTwvYnV0dG9uPlxcbjwvZGl2PlwiKSxcbiAgICByaWdodFRhZzogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInNob3dcXFwiPlxcbiAgICA8c3BhbiBjbGFzcz1cXFwicmlnaHRsYXllcm5hbWVcXFwiPihubyBkaXN0cmlidXRpb24pPC9zcGFuPlxcbjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcImVkaXRcXFwiPlxcbiAgICA8aW5wdXQgaWQ9XFxcInJpZ2h0bWFwc3BwXFxcIiBuYW1lPVxcXCJyaWdodG1hcHNwcFxcXCIgcGxhY2Vob2xkZXI9XFxcIiZoZWxsaXA7IHNwZWNpZXMgb3IgZ3JvdXAgJmhlbGxpcDtcXFwiIC8+XFxuPC9kaXY+XCIpLFxuICAgIGxlZnRGb3JtOiBfLnRlbXBsYXRlKFwiPHA+XFxuPHNlbGVjdCBjbGFzcz1cXFwibGVmdFxcXCIgaWQ9XFxcImxlZnRtYXB5ZWFyXFxcIj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwiYmFzZWxpbmVcXFwiPmJhc2VsaW5lPC9vcHRpb24+XFxuICAgIDxvcHRpb24gdmFsdWU9XFxcIjIwMTVcXFwiPjIwMTU8L29wdGlvbj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwiMjAzNVxcXCI+MjAzNTwvb3B0aW9uPlxcbiAgICA8b3B0aW9uIHZhbHVlPVxcXCIyMDU1XFxcIj4yMDU1PC9vcHRpb24+XFxuICAgIDxvcHRpb24gdmFsdWU9XFxcIjIwNzVcXFwiPjIwNzU8L29wdGlvbj5cXG48L3NlbGVjdD5cXG48L3A+PHA+XFxuPHNlbGVjdCBjbGFzcz1cXFwibGVmdFxcXCIgaWQ9XFxcImxlZnRtYXBzY2VuYXJpb1xcXCI+XFxuICAgIDxvcHRpb24+UkNQM1BEPC9vcHRpb24+XFxuICAgIDxvcHRpb24+UkNQNjwvb3B0aW9uPlxcbjwvc2VsZWN0PlxcbjwvcD48cD5cXG48c2VsZWN0IGNsYXNzPVxcXCJsZWZ0XFxcIiBpZD1cXFwibGVmdG1hcGdjbVxcXCI+XFxuICAgIDxvcHRpb24gdmFsdWU9XFxcImFsbFxcXCI+bWVkaWFuPC9vcHRpb24+XFxuICAgIDxvcHRpb24gdmFsdWU9XFxcImNzaXJvLW1rMzBcXFwiPkNTSVJPIE1hcmsgMy4wPC9vcHRpb24+XFxuPC9zZWxlY3Q+XFxuPC9wPjxwPlxcbjxidXR0b24gY2xhc3M9XFxcImJ0bi1jaGFuZ2VcXFwiPmRvbmU8L2J1dHRvbj5cXG48L3A+PHA+XFxuPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNvbXBhcmVcXFwiPmNvbXBhcmUgKyAvIC08L2J1dHRvbj5cXG48L3A+XCIpLFxuICAgIHJpZ2h0Rm9ybTogXy50ZW1wbGF0ZShcIjxwPlxcbjxzZWxlY3QgY2xhc3M9XFxcInJpZ2h0XFxcIiBpZD1cXFwicmlnaHRtYXB5ZWFyXFxcIj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwiYmFzZWxpbmVcXFwiPmJhc2VsaW5lPC9vcHRpb24+XFxuICAgIDxvcHRpb24gdmFsdWU9XFxcIjIwMTVcXFwiPjIwMTU8L29wdGlvbj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwiMjAzNVxcXCI+MjAzNTwvb3B0aW9uPlxcbiAgICA8b3B0aW9uIHZhbHVlPVxcXCIyMDU1XFxcIj4yMDU1PC9vcHRpb24+XFxuICAgIDxvcHRpb24gdmFsdWU9XFxcIjIwNzVcXFwiPjIwNzU8L29wdGlvbj5cXG48L3NlbGVjdD5cXG48L3A+PHA+XFxuPHNlbGVjdCBjbGFzcz1cXFwicmlnaHRcXFwiIGlkPVxcXCJyaWdodG1hcHNjZW5hcmlvXFxcIj5cXG4gICAgPG9wdGlvbj5SQ1AzUEQ8L29wdGlvbj5cXG4gICAgPG9wdGlvbj5SQ1A2PC9vcHRpb24+XFxuPC9zZWxlY3Q+XFxuPC9wPjxwPlxcbjxzZWxlY3QgY2xhc3M9XFxcInJpZ2h0XFxcIiBpZD1cXFwicmlnaHRtYXBnY21cXFwiPlxcbiAgICA8b3B0aW9uIHZhbHVlPVxcXCJhbGxcXFwiPm1lZGlhbjwvb3B0aW9uPlxcbiAgICA8b3B0aW9uIHZhbHVlPVxcXCJjc2lyby1tazMwXFxcIj5DU0lSTyBNYXJrIDMuMDwvb3B0aW9uPlxcbjwvc2VsZWN0PlxcbjwvcD48cD5cXG48YnV0dG9uIGNsYXNzPVxcXCJidG4tY2hhbmdlXFxcIj5kb25lPC9idXR0b24+XFxuPC9wPjxwPlxcbjxidXR0b24gY2xhc3M9XFxcImJ0bi1jb21wYXJlXFxcIj5jb21wYXJlICsvLTwvYnV0dG9uPlxcbjwvcD5cIilcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXBwVmlldztcbiJdfQ==
