(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

require('./mapview/main');

$('header').disableSelection(); // unpopular but still better
$('nav > ul').mspp({});

},{"./mapview/main":2}],2:[function(require,module,exports){
(function() {
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

}).call(this);

},{"./views/app":5}],3:[function(require,module,exports){
(function() {
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

}).call(this);

},{}],4:[function(require,module,exports){
(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(fn, scope) {
      var i, _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push(__indexOf.call(this, i) >= 0 ? fn.call(scope, this[i], i, this) : void 0);
      }
      return _results;
    };
  }

  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(needle) {
      var i, _i, _ref;
      for (i = _i = 0, _ref = this.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (this[i] === needle) {
          return i;
        }
      }
      return -1;
    };
  }

}).call(this);

},{}],5:[function(require,module,exports){
(function() {
  var AppView, MapLayer, debug,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  MapLayer = require('../models/maplayer');

  require('../util/shims');


  /* jshint -W093 */

  debug = function(itemToLog, itemLevel) {
    var levels, messageNum, threshold, thresholdNum;
    levels = ['verydebug', 'debug', 'message', 'warning'];
    threshold = 'verydebug';
    if (!itemLevel) {
      itemLevel = 'debug';
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
    speciesDataUrl: "" + location.protocol + "//" + location.host + "/speciesdata",
    rasterApiUrl: "" + location.protocol + "//localhost:10600/api/raster/1/wms_data_url",
    trackSplitter: false,
    trackPeriod: 100,
    events: {
      'click .btn-change': 'toggleForms',
      'click .btn-compare': 'toggleSplitter',
      'click .btn-copy-ltr': 'copyMapLeftToRight',
      'click .btn-copy-rtl': 'copyMapRightToLeft',
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
    copyMapLeftToRight: function() {
      debug('AppView.copyMapLeftToRight');
      if (!this.leftInfo) {
        return;
      }
      this.$('#rightmapspp').val(this.leftInfo.speciesName);
      this.$('#rightmapyear').val(this.leftInfo.year);
      this.$('#rightmapscenario').val(this.leftInfo.scenario);
      this.$('#rightmapgcm').val(this.leftInfo.gcm);
      return this.rightSideUpdate();
    },
    copyMapRightToLeft: function() {
      debug('AppView.copyMapRightToLeft');
      if (!this.rightInfo) {
        return;
      }
      this.$('#leftmapspp').val(this.rightInfo.speciesName);
      this.$('#leftmapyear').val(this.rightInfo.year);
      this.$('#leftmapscenario').val(this.rightInfo.scenario);
      this.$('#leftmapgcm').val(this.rightInfo.gcm);
      return this.leftSideUpdate();
    },
    leftSideUpdate: function() {
      var newLeftInfo, sppName;
      debug('AppView.leftSideUpdate');
      sppName = this.$('#leftmapspp').val();
      if (__indexOf.call(this.speciesSciNameList, sppName) >= 0) {
        this.$('.btn-copy-rtl').prop('disabled', false);
      } else {
        this.$('.btn-copy-rtl').prop('disabled', true);
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
      if (__indexOf.call(this.speciesSciNameList, sppName) >= 0) {
        this.$('.btn-copy-ltr').prop('disabled', false);
      } else {
        this.$('.btn-copy-ltr').prop('disabled', true);
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
      var futureModelPoint, layer, loadClass, mapData, sideInfo;
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
      mapData = [this.speciesDataUrl, sideInfo.speciesName.replace(' ', '_'), 'output', futureModelPoint + '.asc.gz'].join('/');
      layer = L.tileLayer.wms(this.rasterApiUrl, {
        DATA_URL: mapData,
        layers: 'DEFAULT',
        format: 'image/png',
        transparent: true
      });
      loadClass = '' + side + 'loading';
      layer.on('loading', (function(_this) {
        return function() {
          return _this.$el.addClass(loadClass);
        };
      })(this));
      layer.on('load', (function(_this) {
        return function() {
          return _this.$el.removeClass(loadClass);
        };
      })(this));
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
        this.leftTag.attr('style', "clip: rect(0, " + newLeftWidth + "px, auto, 0)");
        if (this.leftLayer) {
          leftMap.attr('style', "clip: rect(" + layerTop + "px, " + splitX + "px, " + layerBottom + "px, " + leftLeft + "px)");
        }
        if (this.rightLayer) {
          return rightMap.attr('style', "clip: rect(" + layerTop + "px, " + rightRight + "px, " + layerBottom + "px, " + splitX + "px)");
        }
      } else {
        this.leftTag.attr('style', 'clip: inherit');
        if (this.leftLayer) {
          leftMap.attr('style', 'clip: inherit');
        }
        if (this.rightLayer) {
          return rightMap.attr('style', 'clip: rect(0,0,0,0)');
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
      layout: _.template("<div class=\"splitline\">&nbsp;</div>\n<div class=\"splitthumb\"><span>&#x276e; &#x276f;</span></div>\n<div class=\"left tag\"><%= leftTag %></div>\n<div class=\"right tag\"><%= rightTag %></div>\n<div class=\"left form\"><%= leftForm %></div>\n<div class=\"right form\"><%= rightForm %></div>\n<div class=\"left loader\"><img src=\"/static/images/spinner.loadinfo.net.gif\" /></div>\n<div class=\"right loader\"><img src=\"/static/images/spinner.loadinfo.net.gif\" /></div>\n<div id=\"mapwrapper\"><div id=\"map\"></div></div>"),
      leftTag: _.template("<div class=\"show\">\n    <span class=\"leftlayername\">plain map</span>\n    <br>\n    <button class=\"btn-change\">settings</button>\n    <button class=\"btn-compare\">show/hide comparison map</button>\n</div>\n<div class=\"edit\">\n    <input id=\"leftmapspp\" name=\"leftmapspp\" placeholder=\"&hellip; species or group &hellip;\" />\n    <!--\n    <button class=\"btn-change\">hide settings</button>\n    <button class=\"btn-compare\">compare +/-</button>\n    -->\n</div>"),
      rightTag: _.template("<div class=\"show\">\n    <span class=\"rightlayername\">(no distribution)</span>\n    <br>\n    <button class=\"btn-change\">settings</button>\n    <button class=\"btn-compare\">show/hide comparison map</button>\n</div>\n<div class=\"edit\">\n    <input id=\"rightmapspp\" name=\"rightmapspp\" placeholder=\"&hellip; species or group &hellip;\" />\n</div>"),
      leftForm: _.template("<p>\n<button class=\"btn-copy-rtl\">copy right map &laquo;</button>\n</p><p>\n<select class=\"left\" id=\"leftmapyear\">\n    <option value=\"baseline\">baseline</option>\n    <option value=\"2015\">2015</option>\n    <option value=\"2035\">2035</option>\n    <option value=\"2055\">2055</option>\n    <option value=\"2075\">2075</option>\n</select>\n</p><p>\n<select class=\"left\" id=\"leftmapscenario\">\n    <option>RCP3PD</option>\n    <option>RCP6</option>\n</select>\n</p><p>\n<select class=\"left\" id=\"leftmapgcm\">\n    <option value=\"all\">median</option>\n    <option value=\"csiro-mk30\">CSIRO Mark 3.0</option>\n</select>\n</p><p>\n<button class=\"btn-change\">hide settings</button>\n</p><p>\n<button class=\"btn-compare\">compare +/-</button>\n</p>"),
      rightForm: _.template("<p>\n<button class=\"btn-copy-ltr\">&raquo; copy left map</button>\n</p><p>\n<select class=\"right\" id=\"rightmapyear\">\n    <option value=\"baseline\">baseline</option>\n    <option value=\"2015\">2015</option>\n    <option value=\"2035\">2035</option>\n    <option value=\"2055\">2055</option>\n    <option value=\"2075\">2075</option>\n</select>\n</p><p>\n<select class=\"right\" id=\"rightmapscenario\">\n    <option>RCP3PD</option>\n    <option>RCP6</option>\n</select>\n</p><p>\n<select class=\"right\" id=\"rightmapgcm\">\n    <option value=\"all\">median</option>\n    <option value=\"csiro-mk30\">CSIRO Mark 3.0</option>\n</select>\n</p><p>\n<button class=\"btn-change\">hide settings</button>\n</p><p>\n<button class=\"btn-compare\">compare +/-</button>\n</p>")
    }
  });

  module.exports = AppView;

}).call(this);

},{"../models/maplayer":3,"../util/shims":4}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvcHZyZHdiL2pjdS9jbGltYXNuZy9jbGltYXMtbmcvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9mYWtlXzM3NjljYzJiLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L21haW4uanMiLCIvVXNlcnMvcHZyZHdiL2pjdS9jbGltYXNuZy9jbGltYXMtbmcvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvbW9kZWxzL21hcGxheWVyLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L3V0aWwvc2hpbXMuanMiLCIvVXNlcnMvcHZyZHdiL2pjdS9jbGltYXNuZy9jbGltYXMtbmcvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvdmlld3MvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxucmVxdWlyZSgnLi9tYXB2aWV3L21haW4nKTtcblxuJCgnaGVhZGVyJykuZGlzYWJsZVNlbGVjdGlvbigpOyAvLyB1bnBvcHVsYXIgYnV0IHN0aWxsIGJldHRlclxuJCgnbmF2ID4gdWwnKS5tc3BwKHt9KTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIEFwcFZpZXc7XG5cbiAgaWYgKCF3aW5kb3cuY29uc29sZSkge1xuICAgIHdpbmRvdy5jb25zb2xlID0ge1xuICAgICAgbG9nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBBcHBWaWV3ID0gcmVxdWlyZSgnLi92aWV3cy9hcHAnKTtcblxuICAkKGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcHB2aWV3O1xuICAgIGFwcHZpZXcgPSBuZXcgQXBwVmlldygpO1xuICAgIHJldHVybiBhcHB2aWV3LnJlbmRlcigpO1xuICB9KTtcblxufSkuY2FsbCh0aGlzKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIE1hcExheWVyO1xuXG4gIE1hcExheWVyID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24oc2hvcnROYW1lLCBsb25nTmFtZSwgcGF0aCkge1xuICAgICAgdGhpcy5zaG9ydE5hbWUgPSBzaG9ydE5hbWU7XG4gICAgICB0aGlzLmxvbmdOYW1lID0gbG9uZ05hbWU7XG4gICAgICB0aGlzLnBhdGggPSBwYXRoO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9KTtcblxuICBtb2R1bGUuZXhwb3J0cyA9IE1hcExheWVyO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgX19pbmRleE9mID0gW10uaW5kZXhPZiB8fCBmdW5jdGlvbihpdGVtKSB7IGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5sZW5ndGg7IGkgPCBsOyBpKyspIHsgaWYgKGkgaW4gdGhpcyAmJiB0aGlzW2ldID09PSBpdGVtKSByZXR1cm4gaTsgfSByZXR1cm4gLTE7IH07XG5cbiAgaWYgKCFBcnJheS5wcm90b3R5cGUuZm9yRWFjaCkge1xuICAgIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24oZm4sIHNjb3BlKSB7XG4gICAgICB2YXIgaSwgX2ksIF9yZWYsIF9yZXN1bHRzO1xuICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoaSA9IF9pID0gMCwgX3JlZiA9IHRoaXMubGVuZ3RoOyAwIDw9IF9yZWYgPyBfaSA8PSBfcmVmIDogX2kgPj0gX3JlZjsgaSA9IDAgPD0gX3JlZiA/ICsrX2kgOiAtLV9pKSB7XG4gICAgICAgIF9yZXN1bHRzLnB1c2goX19pbmRleE9mLmNhbGwodGhpcywgaSkgPj0gMCA/IGZuLmNhbGwoc2NvcGUsIHRoaXNbaV0sIGksIHRoaXMpIDogdm9pZCAwKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICB9O1xuICB9XG5cbiAgaWYgKCFBcnJheS5wcm90b3R5cGUuaW5kZXhPZikge1xuICAgIEFycmF5LnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24obmVlZGxlKSB7XG4gICAgICB2YXIgaSwgX2ksIF9yZWY7XG4gICAgICBmb3IgKGkgPSBfaSA9IDAsIF9yZWYgPSB0aGlzLmxlbmd0aDsgMCA8PSBfcmVmID8gX2kgPD0gX3JlZiA6IF9pID49IF9yZWY7IGkgPSAwIDw9IF9yZWYgPyArK19pIDogLS1faSkge1xuICAgICAgICBpZiAodGhpc1tpXSA9PT0gbmVlZGxlKSB7XG4gICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuICB9XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBBcHBWaWV3LCBNYXBMYXllciwgZGVidWcsXG4gICAgX19pbmRleE9mID0gW10uaW5kZXhPZiB8fCBmdW5jdGlvbihpdGVtKSB7IGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5sZW5ndGg7IGkgPCBsOyBpKyspIHsgaWYgKGkgaW4gdGhpcyAmJiB0aGlzW2ldID09PSBpdGVtKSByZXR1cm4gaTsgfSByZXR1cm4gLTE7IH07XG5cbiAgTWFwTGF5ZXIgPSByZXF1aXJlKCcuLi9tb2RlbHMvbWFwbGF5ZXInKTtcblxuICByZXF1aXJlKCcuLi91dGlsL3NoaW1zJyk7XG5cblxuICAvKiBqc2hpbnQgLVcwOTMgKi9cblxuICBkZWJ1ZyA9IGZ1bmN0aW9uKGl0ZW1Ub0xvZywgaXRlbUxldmVsKSB7XG4gICAgdmFyIGxldmVscywgbWVzc2FnZU51bSwgdGhyZXNob2xkLCB0aHJlc2hvbGROdW07XG4gICAgbGV2ZWxzID0gWyd2ZXJ5ZGVidWcnLCAnZGVidWcnLCAnbWVzc2FnZScsICd3YXJuaW5nJ107XG4gICAgdGhyZXNob2xkID0gJ3ZlcnlkZWJ1Zyc7XG4gICAgaWYgKCFpdGVtTGV2ZWwpIHtcbiAgICAgIGl0ZW1MZXZlbCA9ICdkZWJ1Zyc7XG4gICAgfVxuICAgIHRocmVzaG9sZE51bSA9IGxldmVscy5pbmRleE9mKHRocmVzaG9sZCk7XG4gICAgbWVzc2FnZU51bSA9IGxldmVscy5pbmRleE9mKGl0ZW1MZXZlbCk7XG4gICAgaWYgKHRocmVzaG9sZE51bSA+IG1lc3NhZ2VOdW0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGl0ZW1Ub0xvZyArICcnID09PSBpdGVtVG9Mb2cpIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhcIltcIiArIGl0ZW1MZXZlbCArIFwiXSBcIiArIGl0ZW1Ub0xvZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmxvZyhpdGVtVG9Mb2cpO1xuICAgIH1cbiAgfTtcblxuICBBcHBWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuICAgIHRhZ05hbWU6ICdkaXYnLFxuICAgIGNsYXNzTmFtZTogJ3NwbGl0bWFwIHNob3dmb3JtcycsXG4gICAgaWQ6ICdzcGxpdG1hcCcsXG4gICAgc3BlY2llc0RhdGFVcmw6IFwiXCIgKyBsb2NhdGlvbi5wcm90b2NvbCArIFwiLy9cIiArIGxvY2F0aW9uLmhvc3QgKyBcIi9zcGVjaWVzZGF0YVwiLFxuICAgIHJhc3RlckFwaVVybDogXCJcIiArIGxvY2F0aW9uLnByb3RvY29sICsgXCIvL2xvY2FsaG9zdDoxMDYwMC9hcGkvcmFzdGVyLzEvd21zX2RhdGFfdXJsXCIsXG4gICAgdHJhY2tTcGxpdHRlcjogZmFsc2UsXG4gICAgdHJhY2tQZXJpb2Q6IDEwMCxcbiAgICBldmVudHM6IHtcbiAgICAgICdjbGljayAuYnRuLWNoYW5nZSc6ICd0b2dnbGVGb3JtcycsXG4gICAgICAnY2xpY2sgLmJ0bi1jb21wYXJlJzogJ3RvZ2dsZVNwbGl0dGVyJyxcbiAgICAgICdjbGljayAuYnRuLWNvcHktbHRyJzogJ2NvcHlNYXBMZWZ0VG9SaWdodCcsXG4gICAgICAnY2xpY2sgLmJ0bi1jb3B5LXJ0bCc6ICdjb3B5TWFwUmlnaHRUb0xlZnQnLFxuICAgICAgJ2xlZnRtYXB1cGRhdGUnOiAnbGVmdFNpZGVVcGRhdGUnLFxuICAgICAgJ3JpZ2h0bWFwdXBkYXRlJzogJ3JpZ2h0U2lkZVVwZGF0ZScsXG4gICAgICAnY2hhbmdlIHNlbGVjdC5sZWZ0JzogJ2xlZnRTaWRlVXBkYXRlJyxcbiAgICAgICdjaGFuZ2Ugc2VsZWN0LnJpZ2h0JzogJ3JpZ2h0U2lkZVVwZGF0ZSdcbiAgICB9LFxuICAgIHRpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGZhbHNlKSB7XG4gICAgICAgIGRlYnVnKHRoaXMubWFwLmdldFBpeGVsT3JpZ2luKCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNldFRpbWVvdXQodGhpcy50aWNrLCAyMDAwKTtcbiAgICB9LFxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuaW5pdGlhbGl6ZScpO1xuICAgICAgdGhpcy5tYXBMYXllciA9IG5ldyBNYXBMYXllcignbGVmdCcsICdMZWZ0IE1hcCcsICdsZWZ0Lm1hcCcpO1xuICAgICAgXy5iaW5kQWxsLmFwcGx5KF8sIFt0aGlzXS5jb25jYXQoXy5mdW5jdGlvbnModGhpcykpKTtcbiAgICAgIHJldHVybiB0aGlzLnNwZWNpZXNJbmZvRmV0Y2hQcm9jZXNzID0gdGhpcy5mZXRjaFNwZWNpZXNJbmZvKCk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcucmVuZGVyJyk7XG4gICAgICB0aGlzLiRlbC5hcHBlbmQoQXBwVmlldy50ZW1wbGF0ZXMubGF5b3V0KHtcbiAgICAgICAgbGVmdFRhZzogQXBwVmlldy50ZW1wbGF0ZXMubGVmdFRhZygpLFxuICAgICAgICByaWdodFRhZzogQXBwVmlldy50ZW1wbGF0ZXMucmlnaHRUYWcoKSxcbiAgICAgICAgbGVmdEZvcm06IEFwcFZpZXcudGVtcGxhdGVzLmxlZnRGb3JtKCksXG4gICAgICAgIHJpZ2h0Rm9ybTogQXBwVmlldy50ZW1wbGF0ZXMucmlnaHRGb3JtKClcbiAgICAgIH0pKTtcbiAgICAgICQoJyNjb250ZW50d3JhcCcpLmFwcGVuZCh0aGlzLiRlbCk7XG4gICAgICB0aGlzLm1hcCA9IEwubWFwKCdtYXAnLCB7XG4gICAgICAgIGNlbnRlcjogWy0yMCwgMTM2XSxcbiAgICAgICAgem9vbTogNVxuICAgICAgfSk7XG4gICAgICB0aGlzLm1hcC5vbignbW92ZScsIHRoaXMucmVzaXplVGhpbmdzKTtcbiAgICAgIEwudGlsZUxheWVyKCdodHRwOi8vb3RpbGV7c30ubXFjZG4uY29tL3RpbGVzLzEuMC4wL21hcC97en0ve3h9L3t5fS5wbmcnLCB7XG4gICAgICAgIHN1YmRvbWFpbnM6ICcxMjM0JyxcbiAgICAgICAgbWF4Wm9vbTogMTgsXG4gICAgICAgIGF0dHJpYnV0aW9uOiAnTWFwIGRhdGEgJmNvcHk7IDxhIGhyZWY9XCJodHRwOi8vb3BlbnN0cmVldG1hcC5vcmdcIj5PcGVuU3RyZWV0TWFwPC9hPixcXG50aWxlcyAmY29weTsgPGEgaHJlZj1cImh0dHA6Ly93d3cubWFwcXVlc3QuY29tL1wiIHRhcmdldD1cIl9ibGFua1wiPk1hcFF1ZXN0PC9hPidcbiAgICAgIH0pLmFkZFRvKHRoaXMubWFwKTtcbiAgICAgIHRoaXMubGVmdEZvcm0gPSB0aGlzLiQoJy5sZWZ0LmZvcm0nKTtcbiAgICAgIHRoaXMuYnVpbGRMZWZ0Rm9ybSgpO1xuICAgICAgdGhpcy5yaWdodEZvcm0gPSB0aGlzLiQoJy5yaWdodC5mb3JtJyk7XG4gICAgICB0aGlzLmJ1aWxkUmlnaHRGb3JtKCk7XG4gICAgICB0aGlzLmxlZnRUYWcgPSB0aGlzLiQoJy5sZWZ0LnRhZycpO1xuICAgICAgdGhpcy5yaWdodFRhZyA9IHRoaXMuJCgnLnJpZ2h0LnRhZycpO1xuICAgICAgdGhpcy5zcGxpdExpbmUgPSB0aGlzLiQoJy5zcGxpdGxpbmUnKTtcbiAgICAgIHJldHVybiB0aGlzLnNwbGl0VGh1bWIgPSB0aGlzLiQoJy5zcGxpdHRodW1iJyk7XG4gICAgfSxcbiAgICBjb3B5TWFwTGVmdFRvUmlnaHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuY29weU1hcExlZnRUb1JpZ2h0Jyk7XG4gICAgICBpZiAoIXRoaXMubGVmdEluZm8pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy4kKCcjcmlnaHRtYXBzcHAnKS52YWwodGhpcy5sZWZ0SW5mby5zcGVjaWVzTmFtZSk7XG4gICAgICB0aGlzLiQoJyNyaWdodG1hcHllYXInKS52YWwodGhpcy5sZWZ0SW5mby55ZWFyKTtcbiAgICAgIHRoaXMuJCgnI3JpZ2h0bWFwc2NlbmFyaW8nKS52YWwodGhpcy5sZWZ0SW5mby5zY2VuYXJpbyk7XG4gICAgICB0aGlzLiQoJyNyaWdodG1hcGdjbScpLnZhbCh0aGlzLmxlZnRJbmZvLmdjbSk7XG4gICAgICByZXR1cm4gdGhpcy5yaWdodFNpZGVVcGRhdGUoKTtcbiAgICB9LFxuICAgIGNvcHlNYXBSaWdodFRvTGVmdDogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5jb3B5TWFwUmlnaHRUb0xlZnQnKTtcbiAgICAgIGlmICghdGhpcy5yaWdodEluZm8pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy4kKCcjbGVmdG1hcHNwcCcpLnZhbCh0aGlzLnJpZ2h0SW5mby5zcGVjaWVzTmFtZSk7XG4gICAgICB0aGlzLiQoJyNsZWZ0bWFweWVhcicpLnZhbCh0aGlzLnJpZ2h0SW5mby55ZWFyKTtcbiAgICAgIHRoaXMuJCgnI2xlZnRtYXBzY2VuYXJpbycpLnZhbCh0aGlzLnJpZ2h0SW5mby5zY2VuYXJpbyk7XG4gICAgICB0aGlzLiQoJyNsZWZ0bWFwZ2NtJykudmFsKHRoaXMucmlnaHRJbmZvLmdjbSk7XG4gICAgICByZXR1cm4gdGhpcy5sZWZ0U2lkZVVwZGF0ZSgpO1xuICAgIH0sXG4gICAgbGVmdFNpZGVVcGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG5ld0xlZnRJbmZvLCBzcHBOYW1lO1xuICAgICAgZGVidWcoJ0FwcFZpZXcubGVmdFNpZGVVcGRhdGUnKTtcbiAgICAgIHNwcE5hbWUgPSB0aGlzLiQoJyNsZWZ0bWFwc3BwJykudmFsKCk7XG4gICAgICBpZiAoX19pbmRleE9mLmNhbGwodGhpcy5zcGVjaWVzU2NpTmFtZUxpc3QsIHNwcE5hbWUpID49IDApIHtcbiAgICAgICAgdGhpcy4kKCcuYnRuLWNvcHktcnRsJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLiQoJy5idG4tY29weS1ydGwnKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBuZXdMZWZ0SW5mbyA9IHtcbiAgICAgICAgc3BlY2llc05hbWU6IHNwcE5hbWUsXG4gICAgICAgIHllYXI6IHRoaXMuJCgnI2xlZnRtYXB5ZWFyJykudmFsKCksXG4gICAgICAgIHNjZW5hcmlvOiB0aGlzLiQoJyNsZWZ0bWFwc2NlbmFyaW8nKS52YWwoKSxcbiAgICAgICAgZ2NtOiB0aGlzLiQoJyNsZWZ0bWFwZ2NtJykudmFsKClcbiAgICAgIH07XG4gICAgICBpZiAodGhpcy5sZWZ0SW5mbyAmJiBfLmlzRXF1YWwobmV3TGVmdEluZm8sIHRoaXMubGVmdEluZm8pKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmxlZnRJbmZvICYmIG5ld0xlZnRJbmZvLnNwZWNpZXNOYW1lID09PSB0aGlzLmxlZnRJbmZvLnNwZWNpZXNOYW1lICYmIG5ld0xlZnRJbmZvLnllYXIgPT09IHRoaXMubGVmdEluZm8ueWVhciAmJiBuZXdMZWZ0SW5mby55ZWFyID09PSAnYmFzZWxpbmUnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHRoaXMubGVmdEluZm8gPSBuZXdMZWZ0SW5mbztcbiAgICAgIHRoaXMuYWRkTWFwTGF5ZXIoJ2xlZnQnKTtcbiAgICAgIHJldHVybiB0aGlzLmFkZE1hcFRhZygnbGVmdCcpO1xuICAgIH0sXG4gICAgcmlnaHRTaWRlVXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBuZXdSaWdodEluZm8sIHNwcE5hbWU7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5yaWdodFNpZGVVcGRhdGUnKTtcbiAgICAgIHNwcE5hbWUgPSB0aGlzLiQoJyNyaWdodG1hcHNwcCcpLnZhbCgpO1xuICAgICAgaWYgKF9faW5kZXhPZi5jYWxsKHRoaXMuc3BlY2llc1NjaU5hbWVMaXN0LCBzcHBOYW1lKSA+PSAwKSB7XG4gICAgICAgIHRoaXMuJCgnLmJ0bi1jb3B5LWx0cicpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy4kKCcuYnRuLWNvcHktbHRyJykucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgbmV3UmlnaHRJbmZvID0ge1xuICAgICAgICBzcGVjaWVzTmFtZTogc3BwTmFtZSxcbiAgICAgICAgeWVhcjogdGhpcy4kKCcjcmlnaHRtYXB5ZWFyJykudmFsKCksXG4gICAgICAgIHNjZW5hcmlvOiB0aGlzLiQoJyNyaWdodG1hcHNjZW5hcmlvJykudmFsKCksXG4gICAgICAgIGdjbTogdGhpcy4kKCcjcmlnaHRtYXBnY20nKS52YWwoKVxuICAgICAgfTtcbiAgICAgIGlmICh0aGlzLnJpZ2h0SW5mbyAmJiBfLmlzRXF1YWwobmV3UmlnaHRJbmZvLCB0aGlzLnJpZ2h0SW5mbykpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMucmlnaHRJbmZvICYmIG5ld1JpZ2h0SW5mby5zcGVjaWVzTmFtZSA9PT0gdGhpcy5yaWdodEluZm8uc3BlY2llc05hbWUgJiYgbmV3UmlnaHRJbmZvLnllYXIgPT09IHRoaXMucmlnaHRJbmZvLnllYXIgJiYgbmV3UmlnaHRJbmZvLnllYXIgPT09ICdiYXNlbGluZScpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdGhpcy5yaWdodEluZm8gPSBuZXdSaWdodEluZm87XG4gICAgICB0aGlzLmFkZE1hcExheWVyKCdyaWdodCcpO1xuICAgICAgcmV0dXJuIHRoaXMuYWRkTWFwVGFnKCdyaWdodCcpO1xuICAgIH0sXG4gICAgYWRkTWFwVGFnOiBmdW5jdGlvbihzaWRlKSB7XG4gICAgICB2YXIgaW5mbywgdGFnO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYWRkTWFwVGFnJyk7XG4gICAgICBpZiAoc2lkZSA9PT0gJ2xlZnQnKSB7XG4gICAgICAgIGluZm8gPSB0aGlzLmxlZnRJbmZvO1xuICAgICAgfVxuICAgICAgaWYgKHNpZGUgPT09ICdyaWdodCcpIHtcbiAgICAgICAgaW5mbyA9IHRoaXMucmlnaHRJbmZvO1xuICAgICAgfVxuICAgICAgdGFnID0gXCI8Yj48aT5cIiArIGluZm8uc3BlY2llc05hbWUgKyBcIjwvaT48L2I+XCI7XG4gICAgICBpZiAoaW5mby55ZWFyID09PSAnYmFzZWxpbmUnKSB7XG4gICAgICAgIHRhZyA9IFwiY3VycmVudCBcIiArIHRhZyArIFwiIGRpc3RyaWJ1dGlvblwiO1xuICAgICAgfSBlbHNlIGlmIChpbmZvLmdjbSA9PT0gJ2FsbCcpIHtcbiAgICAgICAgdGFnID0gXCI8Yj5tZWRpYW48L2I+IHByb2plY3Rpb25zIGZvciBcIiArIHRhZyArIFwiIGluIDxiPlwiICsgaW5mby55ZWFyICsgXCI8L2I+IGlmIDxiPlwiICsgaW5mby5zY2VuYXJpbyArIFwiPC9iPlwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGFnID0gXCI8Yj5cIiArIGluZm8uZ2NtICsgXCI8L2I+IHByb2plY3Rpb25zIGZvciBcIiArIHRhZyArIFwiIGluIDxiPlwiICsgaW5mby55ZWFyICsgXCI8L2I+IGlmIDxiPlwiICsgaW5mby5zY2VuYXJpbyArIFwiPC9iPlwiO1xuICAgICAgfVxuICAgICAgaWYgKHNpZGUgPT09ICdsZWZ0Jykge1xuICAgICAgICB0aGlzLmxlZnRUYWcuZmluZCgnLmxlZnRsYXllcm5hbWUnKS5odG1sKHRhZyk7XG4gICAgICB9XG4gICAgICBpZiAoc2lkZSA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICByZXR1cm4gdGhpcy5yaWdodFRhZy5maW5kKCcucmlnaHRsYXllcm5hbWUnKS5odG1sKHRhZyk7XG4gICAgICB9XG4gICAgfSxcbiAgICBhZGRNYXBMYXllcjogZnVuY3Rpb24oc2lkZSkge1xuICAgICAgdmFyIGZ1dHVyZU1vZGVsUG9pbnQsIGxheWVyLCBsb2FkQ2xhc3MsIG1hcERhdGEsIHNpZGVJbmZvO1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYWRkTWFwTGF5ZXInKTtcbiAgICAgIGlmIChzaWRlID09PSAnbGVmdCcpIHtcbiAgICAgICAgc2lkZUluZm8gPSB0aGlzLmxlZnRJbmZvO1xuICAgICAgfVxuICAgICAgaWYgKHNpZGUgPT09ICdyaWdodCcpIHtcbiAgICAgICAgc2lkZUluZm8gPSB0aGlzLnJpZ2h0SW5mbztcbiAgICAgIH1cbiAgICAgIGZ1dHVyZU1vZGVsUG9pbnQgPSBbc2lkZUluZm8uc2NlbmFyaW8sIHNpZGVJbmZvLmdjbSwgc2lkZUluZm8ueWVhcl0uam9pbignXycpO1xuICAgICAgaWYgKHNpZGVJbmZvLnllYXIgPT09ICdiYXNlbGluZScpIHtcbiAgICAgICAgZnV0dXJlTW9kZWxQb2ludCA9ICcxOTkwJztcbiAgICAgIH1cbiAgICAgIG1hcERhdGEgPSBbdGhpcy5zcGVjaWVzRGF0YVVybCwgc2lkZUluZm8uc3BlY2llc05hbWUucmVwbGFjZSgnICcsICdfJyksICdvdXRwdXQnLCBmdXR1cmVNb2RlbFBvaW50ICsgJy5hc2MuZ3onXS5qb2luKCcvJyk7XG4gICAgICBsYXllciA9IEwudGlsZUxheWVyLndtcyh0aGlzLnJhc3RlckFwaVVybCwge1xuICAgICAgICBEQVRBX1VSTDogbWFwRGF0YSxcbiAgICAgICAgbGF5ZXJzOiAnREVGQVVMVCcsXG4gICAgICAgIGZvcm1hdDogJ2ltYWdlL3BuZycsXG4gICAgICAgIHRyYW5zcGFyZW50OiB0cnVlXG4gICAgICB9KTtcbiAgICAgIGxvYWRDbGFzcyA9ICcnICsgc2lkZSArICdsb2FkaW5nJztcbiAgICAgIGxheWVyLm9uKCdsb2FkaW5nJywgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuJGVsLmFkZENsYXNzKGxvYWRDbGFzcyk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgICBsYXllci5vbignbG9hZCcsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLiRlbC5yZW1vdmVDbGFzcyhsb2FkQ2xhc3MpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgbGF5ZXIuYWRkVG8odGhpcy5tYXApO1xuICAgICAgaWYgKHNpZGUgPT09ICdsZWZ0Jykge1xuICAgICAgICBpZiAodGhpcy5sZWZ0TGF5ZXIpIHtcbiAgICAgICAgICB0aGlzLm1hcC5yZW1vdmVMYXllcih0aGlzLmxlZnRMYXllcik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sZWZ0TGF5ZXIgPSBsYXllcjtcbiAgICAgIH1cbiAgICAgIGlmIChzaWRlID09PSAncmlnaHQnKSB7XG4gICAgICAgIGlmICh0aGlzLnJpZ2h0TGF5ZXIpIHtcbiAgICAgICAgICB0aGlzLm1hcC5yZW1vdmVMYXllcih0aGlzLnJpZ2h0TGF5ZXIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmlnaHRMYXllciA9IGxheWVyO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMucmVzaXplVGhpbmdzKCk7XG4gICAgfSxcbiAgICBjZW50cmVNYXA6IGZ1bmN0aW9uKHJlcGVhdGVkbHlGb3IpIHtcbiAgICAgIHZhciBsYXRlciwgcmVjZW50cmUsIF9pLCBfcmVzdWx0cztcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmNlbnRyZU1hcCcpO1xuICAgICAgaWYgKCFyZXBlYXRlZGx5Rm9yKSB7XG4gICAgICAgIHJlcGVhdGVkbHlGb3IgPSA1MDA7XG4gICAgICB9XG4gICAgICByZWNlbnRyZSA9IChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgX3RoaXMubWFwLmludmFsaWRhdGVTaXplKGZhbHNlKTtcbiAgICAgICAgICByZXR1cm4gX3RoaXMucmVzaXplVGhpbmdzKCk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICBmb3IgKGxhdGVyID0gX2kgPSAwOyBfaSA8PSByZXBlYXRlZGx5Rm9yOyBsYXRlciA9IF9pICs9IDI1KSB7XG4gICAgICAgIF9yZXN1bHRzLnB1c2goc2V0VGltZW91dChyZWNlbnRyZSwgbGF0ZXIpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICB9LFxuICAgIHRvZ2dsZUZvcm1zOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnRvZ2dsZUZvcm1zJyk7XG4gICAgICB0aGlzLiRlbC50b2dnbGVDbGFzcygnc2hvd2Zvcm1zJyk7XG4gICAgICByZXR1cm4gdGhpcy5jZW50cmVNYXAoKTtcbiAgICB9LFxuICAgIHRvZ2dsZVNwbGl0dGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnRvZ2dsZVNwbGl0dGVyJyk7XG4gICAgICB0aGlzLiRlbC50b2dnbGVDbGFzcygnc3BsaXQnKTtcbiAgICAgIGlmICh0aGlzLiRlbC5oYXNDbGFzcygnc3BsaXQnKSkge1xuICAgICAgICB0aGlzLmFjdGl2YXRlU3BsaXR0ZXIoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZGVhY3RpdmF0ZVNwbGl0dGVyKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5jZW50cmVNYXAoKTtcbiAgICB9LFxuICAgIGZldGNoU3BlY2llc0luZm86IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuZmV0Y2hTcGVjaWVzSW5mbycpO1xuICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgIHVybDogJy9zcGVjaWVzZGF0YS9zcGVjaWVzLmpzb24nXG4gICAgICB9KS5kb25lKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgIHZhciBjb21tb25OYW1lV3JpdGVyLCBzcGVjaWVzTG9va3VwTGlzdCwgc3BlY2llc1NjaU5hbWVMaXN0O1xuICAgICAgICAgIHNwZWNpZXNMb29rdXBMaXN0ID0gW107XG4gICAgICAgICAgc3BlY2llc1NjaU5hbWVMaXN0ID0gW107XG4gICAgICAgICAgY29tbW9uTmFtZVdyaXRlciA9IGZ1bmN0aW9uKHNjaU5hbWUpIHtcbiAgICAgICAgICAgIHZhciBzY2lOYW1lUG9zdGZpeDtcbiAgICAgICAgICAgIHNjaU5hbWVQb3N0Zml4ID0gXCIgKFwiICsgc2NpTmFtZSArIFwiKVwiO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGNuSW5kZXgsIGNuKSB7XG4gICAgICAgICAgICAgIHJldHVybiBzcGVjaWVzTG9va3VwTGlzdC5wdXNoKHtcbiAgICAgICAgICAgICAgICBsYWJlbDogY24gKyBzY2lOYW1lUG9zdGZpeCxcbiAgICAgICAgICAgICAgICB2YWx1ZTogc2NpTmFtZVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfTtcbiAgICAgICAgICAkLmVhY2goZGF0YSwgZnVuY3Rpb24oc2NpTmFtZSwgY29tbW9uTmFtZXMpIHtcbiAgICAgICAgICAgIHNwZWNpZXNTY2lOYW1lTGlzdC5wdXNoKHNjaU5hbWUpO1xuICAgICAgICAgICAgaWYgKGNvbW1vbk5hbWVzKSB7XG4gICAgICAgICAgICAgIHJldHVybiAkLmVhY2goY29tbW9uTmFtZXMsIGNvbW1vbk5hbWVXcml0ZXIoc2NpTmFtZSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNwZWNpZXNMb29rdXBMaXN0LnB1c2goe1xuICAgICAgICAgICAgICAgIGxhYmVsOiBzY2lOYW1lLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBzY2lOYW1lXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIF90aGlzLnNwZWNpZXNMb29rdXBMaXN0ID0gc3BlY2llc0xvb2t1cExpc3Q7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLnNwZWNpZXNTY2lOYW1lTGlzdCA9IHNwZWNpZXNTY2lOYW1lTGlzdDtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9LFxuICAgIGJ1aWxkTGVmdEZvcm06IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYnVpbGRMZWZ0Rm9ybScpO1xuICAgICAgcmV0dXJuIHRoaXMuc3BlY2llc0luZm9GZXRjaFByb2Nlc3MuZG9uZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciAkbGVmdG1hcHNwcDtcbiAgICAgICAgICAkbGVmdG1hcHNwcCA9IF90aGlzLiQoJyNsZWZ0bWFwc3BwJyk7XG4gICAgICAgICAgcmV0dXJuICRsZWZ0bWFwc3BwLmF1dG9jb21wbGV0ZSh7XG4gICAgICAgICAgICBzb3VyY2U6IF90aGlzLnNwZWNpZXNMb29rdXBMaXN0LFxuICAgICAgICAgICAgYXBwZW5kVG86IF90aGlzLiRlbCxcbiAgICAgICAgICAgIGNsb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLiRlbC50cmlnZ2VyKCdsZWZ0bWFwdXBkYXRlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgfSxcbiAgICBidWlsZFJpZ2h0Rm9ybTogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5idWlsZFJpZ2h0Rm9ybScpO1xuICAgICAgcmV0dXJuIHRoaXMuc3BlY2llc0luZm9GZXRjaFByb2Nlc3MuZG9uZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciAkcmlnaHRtYXBzcHA7XG4gICAgICAgICAgJHJpZ2h0bWFwc3BwID0gX3RoaXMuJCgnI3JpZ2h0bWFwc3BwJyk7XG4gICAgICAgICAgcmV0dXJuICRyaWdodG1hcHNwcC5hdXRvY29tcGxldGUoe1xuICAgICAgICAgICAgc291cmNlOiBfdGhpcy5zcGVjaWVzTG9va3VwTGlzdCxcbiAgICAgICAgICAgIGFwcGVuZFRvOiBfdGhpcy4kZWwsXG4gICAgICAgICAgICBjbG9zZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBfdGhpcy4kZWwudHJpZ2dlcigncmlnaHRtYXB1cGRhdGUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9LFxuICAgIHN0YXJ0U3BsaXR0ZXJUcmFja2luZzogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5zdGFydFNwbGl0dGVyVHJhY2tpbmcnKTtcbiAgICAgIHRoaXMudHJhY2tTcGxpdHRlciA9IHRydWU7XG4gICAgICB0aGlzLnNwbGl0TGluZS5hZGRDbGFzcygnZHJhZ2dpbmcnKTtcbiAgICAgIHJldHVybiB0aGlzLmxvY2F0ZVNwbGl0dGVyKCk7XG4gICAgfSxcbiAgICBsb2NhdGVTcGxpdHRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5sb2NhdGVTcGxpdHRlcicpO1xuICAgICAgaWYgKHRoaXMudHJhY2tTcGxpdHRlcikge1xuICAgICAgICB0aGlzLnJlc2l6ZVRoaW5ncygpO1xuICAgICAgICBpZiAodGhpcy50cmFja1NwbGl0dGVyID09PSAwKSB7XG4gICAgICAgICAgdGhpcy50cmFja1NwbGl0dGVyID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy50cmFja1NwbGl0dGVyICE9PSB0cnVlKSB7XG4gICAgICAgICAgdGhpcy50cmFja1NwbGl0dGVyIC09IDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQodGhpcy5sb2NhdGVTcGxpdHRlciwgdGhpcy50cmFja1BlcmlvZCk7XG4gICAgICB9XG4gICAgfSxcbiAgICByZXNpemVUaGluZ3M6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyICRtYXBCb3gsIGJvdHRvbVJpZ2h0LCBsYXllckJvdHRvbSwgbGF5ZXJUb3AsIGxlZnRMZWZ0LCBsZWZ0TWFwLCBtYXBCb3VuZHMsIG1hcEJveCwgbmV3TGVmdFdpZHRoLCByaWdodE1hcCwgcmlnaHRSaWdodCwgc3BsaXRQb2ludCwgc3BsaXRYLCB0b3BMZWZ0O1xuICAgICAgZGVidWcoJ0FwcFZpZXcucmVzaXplVGhpbmdzJyk7XG4gICAgICBpZiAodGhpcy5sZWZ0TGF5ZXIpIHtcbiAgICAgICAgbGVmdE1hcCA9ICQodGhpcy5sZWZ0TGF5ZXIuZ2V0Q29udGFpbmVyKCkpO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMucmlnaHRMYXllcikge1xuICAgICAgICByaWdodE1hcCA9ICQodGhpcy5yaWdodExheWVyLmdldENvbnRhaW5lcigpKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLiRlbC5oYXNDbGFzcygnc3BsaXQnKSkge1xuICAgICAgICBuZXdMZWZ0V2lkdGggPSB0aGlzLnNwbGl0VGh1bWIucG9zaXRpb24oKS5sZWZ0ICsgKHRoaXMuc3BsaXRUaHVtYi53aWR0aCgpIC8gMi4wKTtcbiAgICAgICAgbWFwQm94ID0gdGhpcy5tYXAuZ2V0Q29udGFpbmVyKCk7XG4gICAgICAgICRtYXBCb3ggPSAkKG1hcEJveCk7XG4gICAgICAgIG1hcEJvdW5kcyA9IG1hcEJveC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgdG9wTGVmdCA9IHRoaXMubWFwLmNvbnRhaW5lclBvaW50VG9MYXllclBvaW50KFswLCAwXSk7XG4gICAgICAgIHNwbGl0UG9pbnQgPSB0aGlzLm1hcC5jb250YWluZXJQb2ludFRvTGF5ZXJQb2ludChbbmV3TGVmdFdpZHRoLCAwXSk7XG4gICAgICAgIGJvdHRvbVJpZ2h0ID0gdGhpcy5tYXAuY29udGFpbmVyUG9pbnRUb0xheWVyUG9pbnQoWyRtYXBCb3gud2lkdGgoKSwgJG1hcEJveC5oZWlnaHQoKV0pO1xuICAgICAgICBsYXllclRvcCA9IHRvcExlZnQueTtcbiAgICAgICAgbGF5ZXJCb3R0b20gPSBib3R0b21SaWdodC55O1xuICAgICAgICBzcGxpdFggPSBzcGxpdFBvaW50LnggLSBtYXBCb3VuZHMubGVmdDtcbiAgICAgICAgbGVmdExlZnQgPSB0b3BMZWZ0LnggLSBtYXBCb3VuZHMubGVmdDtcbiAgICAgICAgcmlnaHRSaWdodCA9IGJvdHRvbVJpZ2h0Lng7XG4gICAgICAgIHRoaXMuc3BsaXRMaW5lLmNzcygnbGVmdCcsIG5ld0xlZnRXaWR0aCk7XG4gICAgICAgIHRoaXMubGVmdFRhZy5hdHRyKCdzdHlsZScsIFwiY2xpcDogcmVjdCgwLCBcIiArIG5ld0xlZnRXaWR0aCArIFwicHgsIGF1dG8sIDApXCIpO1xuICAgICAgICBpZiAodGhpcy5sZWZ0TGF5ZXIpIHtcbiAgICAgICAgICBsZWZ0TWFwLmF0dHIoJ3N0eWxlJywgXCJjbGlwOiByZWN0KFwiICsgbGF5ZXJUb3AgKyBcInB4LCBcIiArIHNwbGl0WCArIFwicHgsIFwiICsgbGF5ZXJCb3R0b20gKyBcInB4LCBcIiArIGxlZnRMZWZ0ICsgXCJweClcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucmlnaHRMYXllcikge1xuICAgICAgICAgIHJldHVybiByaWdodE1hcC5hdHRyKCdzdHlsZScsIFwiY2xpcDogcmVjdChcIiArIGxheWVyVG9wICsgXCJweCwgXCIgKyByaWdodFJpZ2h0ICsgXCJweCwgXCIgKyBsYXllckJvdHRvbSArIFwicHgsIFwiICsgc3BsaXRYICsgXCJweClcIik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubGVmdFRhZy5hdHRyKCdzdHlsZScsICdjbGlwOiBpbmhlcml0Jyk7XG4gICAgICAgIGlmICh0aGlzLmxlZnRMYXllcikge1xuICAgICAgICAgIGxlZnRNYXAuYXR0cignc3R5bGUnLCAnY2xpcDogaW5oZXJpdCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnJpZ2h0TGF5ZXIpIHtcbiAgICAgICAgICByZXR1cm4gcmlnaHRNYXAuYXR0cignc3R5bGUnLCAnY2xpcDogcmVjdCgwLDAsMCwwKScpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBzdG9wU3BsaXR0ZXJUcmFja2luZzogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5zdG9wU3BsaXR0ZXJUcmFja2luZycpO1xuICAgICAgdGhpcy5zcGxpdExpbmUucmVtb3ZlQ2xhc3MoJ2RyYWdnaW5nJyk7XG4gICAgICByZXR1cm4gdGhpcy50cmFja1NwbGl0dGVyID0gNTtcbiAgICB9LFxuICAgIGFjdGl2YXRlU3BsaXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYWN0aXZhdGVTcGxpdHRlcicpO1xuICAgICAgdGhpcy5zcGxpdFRodW1iLmRyYWdnYWJsZSh7XG4gICAgICAgIGNvbnRhaW5tZW50OiAkKCcjbWFwd3JhcHBlcicpLFxuICAgICAgICBzY3JvbGw6IGZhbHNlLFxuICAgICAgICBzdGFydDogdGhpcy5zdGFydFNwbGl0dGVyVHJhY2tpbmcsXG4gICAgICAgIGRyYWc6IHRoaXMucmVzaXplVGhpbmdzLFxuICAgICAgICBzdG9wOiB0aGlzLnN0b3BTcGxpdHRlclRyYWNraW5nXG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzLnJlc2l6ZVRoaW5ncygpO1xuICAgIH0sXG4gICAgZGVhY3RpdmF0ZVNwbGl0dGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmRlYWN0aXZhdGVTcGxpdHRlcicpO1xuICAgICAgdGhpcy5zcGxpdFRodW1iLmRyYWdnYWJsZSgnZGVzdHJveScpO1xuICAgICAgcmV0dXJuIHRoaXMucmVzaXplVGhpbmdzKCk7XG4gICAgfVxuICB9LCB7XG4gICAgdGVtcGxhdGVzOiB7XG4gICAgICBsYXlvdXQ6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXNzPVxcXCJzcGxpdGxpbmVcXFwiPiZuYnNwOzwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcInNwbGl0dGh1bWJcXFwiPjxzcGFuPiYjeDI3NmU7ICYjeDI3NmY7PC9zcGFuPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcImxlZnQgdGFnXFxcIj48JT0gbGVmdFRhZyAlPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcInJpZ2h0IHRhZ1xcXCI+PCU9IHJpZ2h0VGFnICU+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwibGVmdCBmb3JtXFxcIj48JT0gbGVmdEZvcm0gJT48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJyaWdodCBmb3JtXFxcIj48JT0gcmlnaHRGb3JtICU+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwibGVmdCBsb2FkZXJcXFwiPjxpbWcgc3JjPVxcXCIvc3RhdGljL2ltYWdlcy9zcGlubmVyLmxvYWRpbmZvLm5ldC5naWZcXFwiIC8+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwicmlnaHQgbG9hZGVyXFxcIj48aW1nIHNyYz1cXFwiL3N0YXRpYy9pbWFnZXMvc3Bpbm5lci5sb2FkaW5mby5uZXQuZ2lmXFxcIiAvPjwvZGl2PlxcbjxkaXYgaWQ9XFxcIm1hcHdyYXBwZXJcXFwiPjxkaXYgaWQ9XFxcIm1hcFxcXCI+PC9kaXY+PC9kaXY+XCIpLFxuICAgICAgbGVmdFRhZzogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInNob3dcXFwiPlxcbiAgICA8c3BhbiBjbGFzcz1cXFwibGVmdGxheWVybmFtZVxcXCI+cGxhaW4gbWFwPC9zcGFuPlxcbiAgICA8YnI+XFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0bi1jaGFuZ2VcXFwiPnNldHRpbmdzPC9idXR0b24+XFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0bi1jb21wYXJlXFxcIj5zaG93L2hpZGUgY29tcGFyaXNvbiBtYXA8L2J1dHRvbj5cXG48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJlZGl0XFxcIj5cXG4gICAgPGlucHV0IGlkPVxcXCJsZWZ0bWFwc3BwXFxcIiBuYW1lPVxcXCJsZWZ0bWFwc3BwXFxcIiBwbGFjZWhvbGRlcj1cXFwiJmhlbGxpcDsgc3BlY2llcyBvciBncm91cCAmaGVsbGlwO1xcXCIgLz5cXG4gICAgPCEtLVxcbiAgICA8YnV0dG9uIGNsYXNzPVxcXCJidG4tY2hhbmdlXFxcIj5oaWRlIHNldHRpbmdzPC9idXR0b24+XFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0bi1jb21wYXJlXFxcIj5jb21wYXJlICsvLTwvYnV0dG9uPlxcbiAgICAtLT5cXG48L2Rpdj5cIiksXG4gICAgICByaWdodFRhZzogXy50ZW1wbGF0ZShcIjxkaXYgY2xhc3M9XFxcInNob3dcXFwiPlxcbiAgICA8c3BhbiBjbGFzcz1cXFwicmlnaHRsYXllcm5hbWVcXFwiPihubyBkaXN0cmlidXRpb24pPC9zcGFuPlxcbiAgICA8YnI+XFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0bi1jaGFuZ2VcXFwiPnNldHRpbmdzPC9idXR0b24+XFxuICAgIDxidXR0b24gY2xhc3M9XFxcImJ0bi1jb21wYXJlXFxcIj5zaG93L2hpZGUgY29tcGFyaXNvbiBtYXA8L2J1dHRvbj5cXG48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJlZGl0XFxcIj5cXG4gICAgPGlucHV0IGlkPVxcXCJyaWdodG1hcHNwcFxcXCIgbmFtZT1cXFwicmlnaHRtYXBzcHBcXFwiIHBsYWNlaG9sZGVyPVxcXCImaGVsbGlwOyBzcGVjaWVzIG9yIGdyb3VwICZoZWxsaXA7XFxcIiAvPlxcbjwvZGl2PlwiKSxcbiAgICAgIGxlZnRGb3JtOiBfLnRlbXBsYXRlKFwiPHA+XFxuPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNvcHktcnRsXFxcIj5jb3B5IHJpZ2h0IG1hcCAmbGFxdW87PC9idXR0b24+XFxuPC9wPjxwPlxcbjxzZWxlY3QgY2xhc3M9XFxcImxlZnRcXFwiIGlkPVxcXCJsZWZ0bWFweWVhclxcXCI+XFxuICAgIDxvcHRpb24gdmFsdWU9XFxcImJhc2VsaW5lXFxcIj5iYXNlbGluZTwvb3B0aW9uPlxcbiAgICA8b3B0aW9uIHZhbHVlPVxcXCIyMDE1XFxcIj4yMDE1PC9vcHRpb24+XFxuICAgIDxvcHRpb24gdmFsdWU9XFxcIjIwMzVcXFwiPjIwMzU8L29wdGlvbj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwiMjA1NVxcXCI+MjA1NTwvb3B0aW9uPlxcbiAgICA8b3B0aW9uIHZhbHVlPVxcXCIyMDc1XFxcIj4yMDc1PC9vcHRpb24+XFxuPC9zZWxlY3Q+XFxuPC9wPjxwPlxcbjxzZWxlY3QgY2xhc3M9XFxcImxlZnRcXFwiIGlkPVxcXCJsZWZ0bWFwc2NlbmFyaW9cXFwiPlxcbiAgICA8b3B0aW9uPlJDUDNQRDwvb3B0aW9uPlxcbiAgICA8b3B0aW9uPlJDUDY8L29wdGlvbj5cXG48L3NlbGVjdD5cXG48L3A+PHA+XFxuPHNlbGVjdCBjbGFzcz1cXFwibGVmdFxcXCIgaWQ9XFxcImxlZnRtYXBnY21cXFwiPlxcbiAgICA8b3B0aW9uIHZhbHVlPVxcXCJhbGxcXFwiPm1lZGlhbjwvb3B0aW9uPlxcbiAgICA8b3B0aW9uIHZhbHVlPVxcXCJjc2lyby1tazMwXFxcIj5DU0lSTyBNYXJrIDMuMDwvb3B0aW9uPlxcbjwvc2VsZWN0PlxcbjwvcD48cD5cXG48YnV0dG9uIGNsYXNzPVxcXCJidG4tY2hhbmdlXFxcIj5oaWRlIHNldHRpbmdzPC9idXR0b24+XFxuPC9wPjxwPlxcbjxidXR0b24gY2xhc3M9XFxcImJ0bi1jb21wYXJlXFxcIj5jb21wYXJlICsvLTwvYnV0dG9uPlxcbjwvcD5cIiksXG4gICAgICByaWdodEZvcm06IF8udGVtcGxhdGUoXCI8cD5cXG48YnV0dG9uIGNsYXNzPVxcXCJidG4tY29weS1sdHJcXFwiPiZyYXF1bzsgY29weSBsZWZ0IG1hcDwvYnV0dG9uPlxcbjwvcD48cD5cXG48c2VsZWN0IGNsYXNzPVxcXCJyaWdodFxcXCIgaWQ9XFxcInJpZ2h0bWFweWVhclxcXCI+XFxuICAgIDxvcHRpb24gdmFsdWU9XFxcImJhc2VsaW5lXFxcIj5iYXNlbGluZTwvb3B0aW9uPlxcbiAgICA8b3B0aW9uIHZhbHVlPVxcXCIyMDE1XFxcIj4yMDE1PC9vcHRpb24+XFxuICAgIDxvcHRpb24gdmFsdWU9XFxcIjIwMzVcXFwiPjIwMzU8L29wdGlvbj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwiMjA1NVxcXCI+MjA1NTwvb3B0aW9uPlxcbiAgICA8b3B0aW9uIHZhbHVlPVxcXCIyMDc1XFxcIj4yMDc1PC9vcHRpb24+XFxuPC9zZWxlY3Q+XFxuPC9wPjxwPlxcbjxzZWxlY3QgY2xhc3M9XFxcInJpZ2h0XFxcIiBpZD1cXFwicmlnaHRtYXBzY2VuYXJpb1xcXCI+XFxuICAgIDxvcHRpb24+UkNQM1BEPC9vcHRpb24+XFxuICAgIDxvcHRpb24+UkNQNjwvb3B0aW9uPlxcbjwvc2VsZWN0PlxcbjwvcD48cD5cXG48c2VsZWN0IGNsYXNzPVxcXCJyaWdodFxcXCIgaWQ9XFxcInJpZ2h0bWFwZ2NtXFxcIj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwiYWxsXFxcIj5tZWRpYW48L29wdGlvbj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwiY3Npcm8tbWszMFxcXCI+Q1NJUk8gTWFyayAzLjA8L29wdGlvbj5cXG48L3NlbGVjdD5cXG48L3A+PHA+XFxuPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNoYW5nZVxcXCI+aGlkZSBzZXR0aW5nczwvYnV0dG9uPlxcbjwvcD48cD5cXG48YnV0dG9uIGNsYXNzPVxcXCJidG4tY29tcGFyZVxcXCI+Y29tcGFyZSArLy08L2J1dHRvbj5cXG48L3A+XCIpXG4gICAgfVxuICB9KTtcblxuICBtb2R1bGUuZXhwb3J0cyA9IEFwcFZpZXc7XG5cbn0pLmNhbGwodGhpcyk7XG4iXX0=
