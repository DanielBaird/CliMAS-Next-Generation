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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvcHZyZHdiL2pjdS9jbGltYXNuZy9jbGltYXMtbmcvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9mYWtlXzg2YTI3N2NmLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L21haW4uanMiLCIvVXNlcnMvcHZyZHdiL2pjdS9jbGltYXNuZy9jbGltYXMtbmcvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvbW9kZWxzL21hcGxheWVyLmpzIiwiL1VzZXJzL3B2cmR3Yi9qY3UvY2xpbWFzbmcvY2xpbWFzLW5nL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L3V0aWwvc2hpbXMuanMiLCIvVXNlcnMvcHZyZHdiL2pjdS9jbGltYXNuZy9jbGltYXMtbmcvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvdmlld3MvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbnJlcXVpcmUoJy4vbWFwdmlldy9tYWluJyk7XG5cbiQoJ2hlYWRlcicpLmRpc2FibGVTZWxlY3Rpb24oKTsgLy8gdW5wb3B1bGFyIGJ1dCBzdGlsbCBiZXR0ZXJcbiQoJ25hdiA+IHVsJykubXNwcCh7fSk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBBcHBWaWV3O1xuXG4gIGlmICghd2luZG93LmNvbnNvbGUpIHtcbiAgICB3aW5kb3cuY29uc29sZSA9IHtcbiAgICAgIGxvZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgQXBwVmlldyA9IHJlcXVpcmUoJy4vdmlld3MvYXBwJyk7XG5cbiAgJChmdW5jdGlvbigpIHtcbiAgICB2YXIgYXBwdmlldztcbiAgICBhcHB2aWV3ID0gbmV3IEFwcFZpZXcoKTtcbiAgICByZXR1cm4gYXBwdmlldy5yZW5kZXIoKTtcbiAgfSk7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBNYXBMYXllcjtcblxuICBNYXBMYXllciA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uKHNob3J0TmFtZSwgbG9uZ05hbWUsIHBhdGgpIHtcbiAgICAgIHRoaXMuc2hvcnROYW1lID0gc2hvcnROYW1lO1xuICAgICAgdGhpcy5sb25nTmFtZSA9IGxvbmdOYW1lO1xuICAgICAgdGhpcy5wYXRoID0gcGF0aDtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfSk7XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBNYXBMYXllcjtcblxufSkuY2FsbCh0aGlzKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIF9faW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG4gIGlmICghQXJyYXkucHJvdG90eXBlLmZvckVhY2gpIHtcbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGZuLCBzY29wZSkge1xuICAgICAgdmFyIGksIF9pLCBfcmVmLCBfcmVzdWx0cztcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSBfaSA9IDAsIF9yZWYgPSB0aGlzLmxlbmd0aDsgMCA8PSBfcmVmID8gX2kgPD0gX3JlZiA6IF9pID49IF9yZWY7IGkgPSAwIDw9IF9yZWYgPyArK19pIDogLS1faSkge1xuICAgICAgICBfcmVzdWx0cy5wdXNoKF9faW5kZXhPZi5jYWxsKHRoaXMsIGkpID49IDAgPyBmbi5jYWxsKHNjb3BlLCB0aGlzW2ldLCBpLCB0aGlzKSA6IHZvaWQgMCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfTtcbiAgfVxuXG4gIGlmICghQXJyYXkucHJvdG90eXBlLmluZGV4T2YpIHtcbiAgICBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uKG5lZWRsZSkge1xuICAgICAgdmFyIGksIF9pLCBfcmVmO1xuICAgICAgZm9yIChpID0gX2kgPSAwLCBfcmVmID0gdGhpcy5sZW5ndGg7IDAgPD0gX3JlZiA/IF9pIDw9IF9yZWYgOiBfaSA+PSBfcmVmOyBpID0gMCA8PSBfcmVmID8gKytfaSA6IC0tX2kpIHtcbiAgICAgICAgaWYgKHRoaXNbaV0gPT09IG5lZWRsZSkge1xuICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfTtcbiAgfVxuXG59KS5jYWxsKHRoaXMpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgQXBwVmlldywgTWFwTGF5ZXIsIGRlYnVnLFxuICAgIF9faW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG4gIE1hcExheWVyID0gcmVxdWlyZSgnLi4vbW9kZWxzL21hcGxheWVyJyk7XG5cbiAgcmVxdWlyZSgnLi4vdXRpbC9zaGltcycpO1xuXG5cbiAgLyoganNoaW50IC1XMDkzICovXG5cbiAgZGVidWcgPSBmdW5jdGlvbihpdGVtVG9Mb2csIGl0ZW1MZXZlbCkge1xuICAgIHZhciBsZXZlbHMsIG1lc3NhZ2VOdW0sIHRocmVzaG9sZCwgdGhyZXNob2xkTnVtO1xuICAgIGxldmVscyA9IFsndmVyeWRlYnVnJywgJ2RlYnVnJywgJ21lc3NhZ2UnLCAnd2FybmluZyddO1xuICAgIHRocmVzaG9sZCA9ICd2ZXJ5ZGVidWcnO1xuICAgIGlmICghaXRlbUxldmVsKSB7XG4gICAgICBpdGVtTGV2ZWwgPSAnZGVidWcnO1xuICAgIH1cbiAgICB0aHJlc2hvbGROdW0gPSBsZXZlbHMuaW5kZXhPZih0aHJlc2hvbGQpO1xuICAgIG1lc3NhZ2VOdW0gPSBsZXZlbHMuaW5kZXhPZihpdGVtTGV2ZWwpO1xuICAgIGlmICh0aHJlc2hvbGROdW0gPiBtZXNzYWdlTnVtKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChpdGVtVG9Mb2cgKyAnJyA9PT0gaXRlbVRvTG9nKSB7XG4gICAgICByZXR1cm4gY29uc29sZS5sb2coXCJbXCIgKyBpdGVtTGV2ZWwgKyBcIl0gXCIgKyBpdGVtVG9Mb2cpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY29uc29sZS5sb2coaXRlbVRvTG9nKTtcbiAgICB9XG4gIH07XG5cbiAgQXBwVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcbiAgICB0YWdOYW1lOiAnZGl2JyxcbiAgICBjbGFzc05hbWU6ICdzcGxpdG1hcCBzaG93Zm9ybXMnLFxuICAgIGlkOiAnc3BsaXRtYXAnLFxuICAgIHNwZWNpZXNEYXRhVXJsOiBcIlwiICsgbG9jYXRpb24ucHJvdG9jb2wgKyBcIi8vXCIgKyBsb2NhdGlvbi5ob3N0ICsgXCIvc3BlY2llc2RhdGFcIixcbiAgICByYXN0ZXJBcGlVcmw6IFwiXCIgKyBsb2NhdGlvbi5wcm90b2NvbCArIFwiLy9sb2NhbGhvc3Q6MTA2MDAvYXBpL3Jhc3Rlci8xL3dtc19kYXRhX3VybFwiLFxuICAgIHRyYWNrU3BsaXR0ZXI6IGZhbHNlLFxuICAgIHRyYWNrUGVyaW9kOiAxMDAsXG4gICAgZXZlbnRzOiB7XG4gICAgICAnY2xpY2sgLmJ0bi1jaGFuZ2UnOiAndG9nZ2xlRm9ybXMnLFxuICAgICAgJ2NsaWNrIC5idG4tY29tcGFyZSc6ICd0b2dnbGVTcGxpdHRlcicsXG4gICAgICAnY2xpY2sgLmJ0bi1jb3B5LWx0cic6ICdjb3B5TWFwTGVmdFRvUmlnaHQnLFxuICAgICAgJ2NsaWNrIC5idG4tY29weS1ydGwnOiAnY29weU1hcFJpZ2h0VG9MZWZ0JyxcbiAgICAgICdsZWZ0bWFwdXBkYXRlJzogJ2xlZnRTaWRlVXBkYXRlJyxcbiAgICAgICdyaWdodG1hcHVwZGF0ZSc6ICdyaWdodFNpZGVVcGRhdGUnLFxuICAgICAgJ2NoYW5nZSBzZWxlY3QubGVmdCc6ICdsZWZ0U2lkZVVwZGF0ZScsXG4gICAgICAnY2hhbmdlIHNlbGVjdC5yaWdodCc6ICdyaWdodFNpZGVVcGRhdGUnXG4gICAgfSxcbiAgICB0aWNrOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChmYWxzZSkge1xuICAgICAgICBkZWJ1Zyh0aGlzLm1hcC5nZXRQaXhlbE9yaWdpbigpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzZXRUaW1lb3V0KHRoaXMudGljaywgMjAwMCk7XG4gICAgfSxcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmluaXRpYWxpemUnKTtcbiAgICAgIF8uYmluZEFsbC5hcHBseShfLCBbdGhpc10uY29uY2F0KF8uZnVuY3Rpb25zKHRoaXMpKSk7XG4gICAgICByZXR1cm4gdGhpcy5zcGVjaWVzSW5mb0ZldGNoUHJvY2VzcyA9IHRoaXMuZmV0Y2hTcGVjaWVzSW5mbygpO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnJlbmRlcicpO1xuICAgICAgdGhpcy4kZWwuYXBwZW5kKEFwcFZpZXcudGVtcGxhdGVzLmxheW91dCh7XG4gICAgICAgIGxlZnRUYWc6IEFwcFZpZXcudGVtcGxhdGVzLmxlZnRUYWcoKSxcbiAgICAgICAgcmlnaHRUYWc6IEFwcFZpZXcudGVtcGxhdGVzLnJpZ2h0VGFnKCksXG4gICAgICAgIGxlZnRGb3JtOiBBcHBWaWV3LnRlbXBsYXRlcy5sZWZ0Rm9ybSgpLFxuICAgICAgICByaWdodEZvcm06IEFwcFZpZXcudGVtcGxhdGVzLnJpZ2h0Rm9ybSgpXG4gICAgICB9KSk7XG4gICAgICAkKCcjY29udGVudHdyYXAnKS5hcHBlbmQodGhpcy4kZWwpO1xuICAgICAgdGhpcy5tYXAgPSBMLm1hcCgnbWFwJywge1xuICAgICAgICBjZW50ZXI6IFstMjAsIDEzNl0sXG4gICAgICAgIHpvb206IDVcbiAgICAgIH0pO1xuICAgICAgdGhpcy5tYXAub24oJ21vdmUnLCB0aGlzLnJlc2l6ZVRoaW5ncyk7XG4gICAgICBMLnRpbGVMYXllcignaHR0cDovL290aWxle3N9Lm1xY2RuLmNvbS90aWxlcy8xLjAuMC9tYXAve3p9L3t4fS97eX0ucG5nJywge1xuICAgICAgICBzdWJkb21haW5zOiAnMTIzNCcsXG4gICAgICAgIG1heFpvb206IDE4LFxuICAgICAgICBhdHRyaWJ1dGlvbjogJ01hcCBkYXRhICZjb3B5OyA8YSBocmVmPVwiaHR0cDovL29wZW5zdHJlZXRtYXAub3JnXCI+T3BlblN0cmVldE1hcDwvYT4sXFxudGlsZXMgJmNvcHk7IDxhIGhyZWY9XCJodHRwOi8vd3d3Lm1hcHF1ZXN0LmNvbS9cIiB0YXJnZXQ9XCJfYmxhbmtcIj5NYXBRdWVzdDwvYT4nXG4gICAgICB9KS5hZGRUbyh0aGlzLm1hcCk7XG4gICAgICB0aGlzLmxlZnRGb3JtID0gdGhpcy4kKCcubGVmdC5mb3JtJyk7XG4gICAgICB0aGlzLmJ1aWxkTGVmdEZvcm0oKTtcbiAgICAgIHRoaXMucmlnaHRGb3JtID0gdGhpcy4kKCcucmlnaHQuZm9ybScpO1xuICAgICAgdGhpcy5idWlsZFJpZ2h0Rm9ybSgpO1xuICAgICAgdGhpcy5sZWZ0VGFnID0gdGhpcy4kKCcubGVmdC50YWcnKTtcbiAgICAgIHRoaXMucmlnaHRUYWcgPSB0aGlzLiQoJy5yaWdodC50YWcnKTtcbiAgICAgIHRoaXMuc3BsaXRMaW5lID0gdGhpcy4kKCcuc3BsaXRsaW5lJyk7XG4gICAgICByZXR1cm4gdGhpcy5zcGxpdFRodW1iID0gdGhpcy4kKCcuc3BsaXR0aHVtYicpO1xuICAgIH0sXG4gICAgY29weU1hcExlZnRUb1JpZ2h0OiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmNvcHlNYXBMZWZ0VG9SaWdodCcpO1xuICAgICAgaWYgKCF0aGlzLmxlZnRJbmZvKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuJCgnI3JpZ2h0bWFwc3BwJykudmFsKHRoaXMubGVmdEluZm8uc3BlY2llc05hbWUpO1xuICAgICAgdGhpcy4kKCcjcmlnaHRtYXB5ZWFyJykudmFsKHRoaXMubGVmdEluZm8ueWVhcik7XG4gICAgICB0aGlzLiQoJyNyaWdodG1hcHNjZW5hcmlvJykudmFsKHRoaXMubGVmdEluZm8uc2NlbmFyaW8pO1xuICAgICAgdGhpcy4kKCcjcmlnaHRtYXBnY20nKS52YWwodGhpcy5sZWZ0SW5mby5nY20pO1xuICAgICAgcmV0dXJuIHRoaXMucmlnaHRTaWRlVXBkYXRlKCk7XG4gICAgfSxcbiAgICBjb3B5TWFwUmlnaHRUb0xlZnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuY29weU1hcFJpZ2h0VG9MZWZ0Jyk7XG4gICAgICBpZiAoIXRoaXMucmlnaHRJbmZvKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuJCgnI2xlZnRtYXBzcHAnKS52YWwodGhpcy5yaWdodEluZm8uc3BlY2llc05hbWUpO1xuICAgICAgdGhpcy4kKCcjbGVmdG1hcHllYXInKS52YWwodGhpcy5yaWdodEluZm8ueWVhcik7XG4gICAgICB0aGlzLiQoJyNsZWZ0bWFwc2NlbmFyaW8nKS52YWwodGhpcy5yaWdodEluZm8uc2NlbmFyaW8pO1xuICAgICAgdGhpcy4kKCcjbGVmdG1hcGdjbScpLnZhbCh0aGlzLnJpZ2h0SW5mby5nY20pO1xuICAgICAgcmV0dXJuIHRoaXMubGVmdFNpZGVVcGRhdGUoKTtcbiAgICB9LFxuICAgIGxlZnRTaWRlVXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBuZXdMZWZ0SW5mbywgc3BwTmFtZTtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmxlZnRTaWRlVXBkYXRlJyk7XG4gICAgICBzcHBOYW1lID0gdGhpcy4kKCcjbGVmdG1hcHNwcCcpLnZhbCgpO1xuICAgICAgaWYgKF9faW5kZXhPZi5jYWxsKHRoaXMuc3BlY2llc1NjaU5hbWVMaXN0LCBzcHBOYW1lKSA+PSAwKSB7XG4gICAgICAgIHRoaXMuJCgnLmJ0bi1jb3B5LXJ0bCcpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy4kKCcuYnRuLWNvcHktcnRsJykucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgbmV3TGVmdEluZm8gPSB7XG4gICAgICAgIHNwZWNpZXNOYW1lOiBzcHBOYW1lLFxuICAgICAgICB5ZWFyOiB0aGlzLiQoJyNsZWZ0bWFweWVhcicpLnZhbCgpLFxuICAgICAgICBzY2VuYXJpbzogdGhpcy4kKCcjbGVmdG1hcHNjZW5hcmlvJykudmFsKCksXG4gICAgICAgIGdjbTogdGhpcy4kKCcjbGVmdG1hcGdjbScpLnZhbCgpXG4gICAgICB9O1xuICAgICAgaWYgKHRoaXMubGVmdEluZm8gJiYgXy5pc0VxdWFsKG5ld0xlZnRJbmZvLCB0aGlzLmxlZnRJbmZvKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5sZWZ0SW5mbyAmJiBuZXdMZWZ0SW5mby5zcGVjaWVzTmFtZSA9PT0gdGhpcy5sZWZ0SW5mby5zcGVjaWVzTmFtZSAmJiBuZXdMZWZ0SW5mby55ZWFyID09PSB0aGlzLmxlZnRJbmZvLnllYXIgJiYgbmV3TGVmdEluZm8ueWVhciA9PT0gJ2Jhc2VsaW5lJykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB0aGlzLmxlZnRJbmZvID0gbmV3TGVmdEluZm87XG4gICAgICB0aGlzLmFkZE1hcExheWVyKCdsZWZ0Jyk7XG4gICAgICByZXR1cm4gdGhpcy5hZGRNYXBUYWcoJ2xlZnQnKTtcbiAgICB9LFxuICAgIHJpZ2h0U2lkZVVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbmV3UmlnaHRJbmZvLCBzcHBOYW1lO1xuICAgICAgZGVidWcoJ0FwcFZpZXcucmlnaHRTaWRlVXBkYXRlJyk7XG4gICAgICBzcHBOYW1lID0gdGhpcy4kKCcjcmlnaHRtYXBzcHAnKS52YWwoKTtcbiAgICAgIGlmIChfX2luZGV4T2YuY2FsbCh0aGlzLnNwZWNpZXNTY2lOYW1lTGlzdCwgc3BwTmFtZSkgPj0gMCkge1xuICAgICAgICB0aGlzLiQoJy5idG4tY29weS1sdHInKS5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuJCgnLmJ0bi1jb3B5LWx0cicpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIG5ld1JpZ2h0SW5mbyA9IHtcbiAgICAgICAgc3BlY2llc05hbWU6IHNwcE5hbWUsXG4gICAgICAgIHllYXI6IHRoaXMuJCgnI3JpZ2h0bWFweWVhcicpLnZhbCgpLFxuICAgICAgICBzY2VuYXJpbzogdGhpcy4kKCcjcmlnaHRtYXBzY2VuYXJpbycpLnZhbCgpLFxuICAgICAgICBnY206IHRoaXMuJCgnI3JpZ2h0bWFwZ2NtJykudmFsKClcbiAgICAgIH07XG4gICAgICBpZiAodGhpcy5yaWdodEluZm8gJiYgXy5pc0VxdWFsKG5ld1JpZ2h0SW5mbywgdGhpcy5yaWdodEluZm8pKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnJpZ2h0SW5mbyAmJiBuZXdSaWdodEluZm8uc3BlY2llc05hbWUgPT09IHRoaXMucmlnaHRJbmZvLnNwZWNpZXNOYW1lICYmIG5ld1JpZ2h0SW5mby55ZWFyID09PSB0aGlzLnJpZ2h0SW5mby55ZWFyICYmIG5ld1JpZ2h0SW5mby55ZWFyID09PSAnYmFzZWxpbmUnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHRoaXMucmlnaHRJbmZvID0gbmV3UmlnaHRJbmZvO1xuICAgICAgdGhpcy5hZGRNYXBMYXllcigncmlnaHQnKTtcbiAgICAgIHJldHVybiB0aGlzLmFkZE1hcFRhZygncmlnaHQnKTtcbiAgICB9LFxuICAgIGFkZE1hcFRhZzogZnVuY3Rpb24oc2lkZSkge1xuICAgICAgdmFyIGluZm8sIHRhZztcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmFkZE1hcFRhZycpO1xuICAgICAgaWYgKHNpZGUgPT09ICdsZWZ0Jykge1xuICAgICAgICBpbmZvID0gdGhpcy5sZWZ0SW5mbztcbiAgICAgIH1cbiAgICAgIGlmIChzaWRlID09PSAncmlnaHQnKSB7XG4gICAgICAgIGluZm8gPSB0aGlzLnJpZ2h0SW5mbztcbiAgICAgIH1cbiAgICAgIHRhZyA9IFwiPGI+PGk+XCIgKyBpbmZvLnNwZWNpZXNOYW1lICsgXCI8L2k+PC9iPlwiO1xuICAgICAgaWYgKGluZm8ueWVhciA9PT0gJ2Jhc2VsaW5lJykge1xuICAgICAgICB0YWcgPSBcImN1cnJlbnQgXCIgKyB0YWcgKyBcIiBkaXN0cmlidXRpb25cIjtcbiAgICAgIH0gZWxzZSBpZiAoaW5mby5nY20gPT09ICdhbGwnKSB7XG4gICAgICAgIHRhZyA9IFwiPGI+bWVkaWFuPC9iPiBwcm9qZWN0aW9ucyBmb3IgXCIgKyB0YWcgKyBcIiBpbiA8Yj5cIiArIGluZm8ueWVhciArIFwiPC9iPiBpZiA8Yj5cIiArIGluZm8uc2NlbmFyaW8gKyBcIjwvYj5cIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRhZyA9IFwiPGI+XCIgKyBpbmZvLmdjbSArIFwiPC9iPiBwcm9qZWN0aW9ucyBmb3IgXCIgKyB0YWcgKyBcIiBpbiA8Yj5cIiArIGluZm8ueWVhciArIFwiPC9iPiBpZiA8Yj5cIiArIGluZm8uc2NlbmFyaW8gKyBcIjwvYj5cIjtcbiAgICAgIH1cbiAgICAgIGlmIChzaWRlID09PSAnbGVmdCcpIHtcbiAgICAgICAgdGhpcy5sZWZ0VGFnLmZpbmQoJy5sZWZ0bGF5ZXJuYW1lJykuaHRtbCh0YWcpO1xuICAgICAgfVxuICAgICAgaWYgKHNpZGUgPT09ICdyaWdodCcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmlnaHRUYWcuZmluZCgnLnJpZ2h0bGF5ZXJuYW1lJykuaHRtbCh0YWcpO1xuICAgICAgfVxuICAgIH0sXG4gICAgYWRkTWFwTGF5ZXI6IGZ1bmN0aW9uKHNpZGUpIHtcbiAgICAgIHZhciBmdXR1cmVNb2RlbFBvaW50LCBsYXllciwgbG9hZENsYXNzLCBtYXBEYXRhLCBzaWRlSW5mbztcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmFkZE1hcExheWVyJyk7XG4gICAgICBpZiAoc2lkZSA9PT0gJ2xlZnQnKSB7XG4gICAgICAgIHNpZGVJbmZvID0gdGhpcy5sZWZ0SW5mbztcbiAgICAgIH1cbiAgICAgIGlmIChzaWRlID09PSAncmlnaHQnKSB7XG4gICAgICAgIHNpZGVJbmZvID0gdGhpcy5yaWdodEluZm87XG4gICAgICB9XG4gICAgICBmdXR1cmVNb2RlbFBvaW50ID0gW3NpZGVJbmZvLnNjZW5hcmlvLCBzaWRlSW5mby5nY20sIHNpZGVJbmZvLnllYXJdLmpvaW4oJ18nKTtcbiAgICAgIGlmIChzaWRlSW5mby55ZWFyID09PSAnYmFzZWxpbmUnKSB7XG4gICAgICAgIGZ1dHVyZU1vZGVsUG9pbnQgPSAnMTk5MCc7XG4gICAgICB9XG4gICAgICBtYXBEYXRhID0gW3RoaXMuc3BlY2llc0RhdGFVcmwsIHNpZGVJbmZvLnNwZWNpZXNOYW1lLnJlcGxhY2UoJyAnLCAnXycpLCAnb3V0cHV0JywgZnV0dXJlTW9kZWxQb2ludCArICcuYXNjLmd6J10uam9pbignLycpO1xuICAgICAgbGF5ZXIgPSBMLnRpbGVMYXllci53bXModGhpcy5yYXN0ZXJBcGlVcmwsIHtcbiAgICAgICAgREFUQV9VUkw6IG1hcERhdGEsXG4gICAgICAgIGxheWVyczogJ0RFRkFVTFQnLFxuICAgICAgICBmb3JtYXQ6ICdpbWFnZS9wbmcnLFxuICAgICAgICB0cmFuc3BhcmVudDogdHJ1ZVxuICAgICAgfSk7XG4gICAgICBsb2FkQ2xhc3MgPSAnJyArIHNpZGUgKyAnbG9hZGluZyc7XG4gICAgICBsYXllci5vbignbG9hZGluZycsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLiRlbC5hZGRDbGFzcyhsb2FkQ2xhc3MpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgbGF5ZXIub24oJ2xvYWQnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy4kZWwucmVtb3ZlQ2xhc3MobG9hZENsYXNzKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIGxheWVyLmFkZFRvKHRoaXMubWFwKTtcbiAgICAgIGlmIChzaWRlID09PSAnbGVmdCcpIHtcbiAgICAgICAgaWYgKHRoaXMubGVmdExheWVyKSB7XG4gICAgICAgICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIodGhpcy5sZWZ0TGF5ZXIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGVmdExheWVyID0gbGF5ZXI7XG4gICAgICB9XG4gICAgICBpZiAoc2lkZSA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICBpZiAodGhpcy5yaWdodExheWVyKSB7XG4gICAgICAgICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIodGhpcy5yaWdodExheWVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJpZ2h0TGF5ZXIgPSBsYXllcjtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnJlc2l6ZVRoaW5ncygpO1xuICAgIH0sXG4gICAgY2VudHJlTWFwOiBmdW5jdGlvbihyZXBlYXRlZGx5Rm9yKSB7XG4gICAgICB2YXIgbGF0ZXIsIHJlY2VudHJlLCBfaSwgX3Jlc3VsdHM7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5jZW50cmVNYXAnKTtcbiAgICAgIGlmICghcmVwZWF0ZWRseUZvcikge1xuICAgICAgICByZXBlYXRlZGx5Rm9yID0gNTAwO1xuICAgICAgfVxuICAgICAgcmVjZW50cmUgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIF90aGlzLm1hcC5pbnZhbGlkYXRlU2l6ZShmYWxzZSk7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLnJlc2l6ZVRoaW5ncygpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChsYXRlciA9IF9pID0gMDsgX2kgPD0gcmVwZWF0ZWRseUZvcjsgbGF0ZXIgPSBfaSArPSAyNSkge1xuICAgICAgICBfcmVzdWx0cy5wdXNoKHNldFRpbWVvdXQocmVjZW50cmUsIGxhdGVyKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfSxcbiAgICB0b2dnbGVGb3JtczogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy50b2dnbGVGb3JtcycpO1xuICAgICAgdGhpcy4kZWwudG9nZ2xlQ2xhc3MoJ3Nob3dmb3JtcycpO1xuICAgICAgcmV0dXJuIHRoaXMuY2VudHJlTWFwKCk7XG4gICAgfSxcbiAgICB0b2dnbGVTcGxpdHRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy50b2dnbGVTcGxpdHRlcicpO1xuICAgICAgdGhpcy4kZWwudG9nZ2xlQ2xhc3MoJ3NwbGl0Jyk7XG4gICAgICBpZiAodGhpcy4kZWwuaGFzQ2xhc3MoJ3NwbGl0JykpIHtcbiAgICAgICAgdGhpcy5hY3RpdmF0ZVNwbGl0dGVyKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmRlYWN0aXZhdGVTcGxpdHRlcigpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuY2VudHJlTWFwKCk7XG4gICAgfSxcbiAgICBmZXRjaFNwZWNpZXNJbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmZldGNoU3BlY2llc0luZm8nKTtcbiAgICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICB1cmw6ICcvc3BlY2llc2RhdGEvc3BlY2llcy5qc29uJ1xuICAgICAgfSkuZG9uZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICB2YXIgY29tbW9uTmFtZVdyaXRlciwgc3BlY2llc0xvb2t1cExpc3QsIHNwZWNpZXNTY2lOYW1lTGlzdDtcbiAgICAgICAgICBzcGVjaWVzTG9va3VwTGlzdCA9IFtdO1xuICAgICAgICAgIHNwZWNpZXNTY2lOYW1lTGlzdCA9IFtdO1xuICAgICAgICAgIGNvbW1vbk5hbWVXcml0ZXIgPSBmdW5jdGlvbihzY2lOYW1lKSB7XG4gICAgICAgICAgICB2YXIgc2NpTmFtZVBvc3RmaXg7XG4gICAgICAgICAgICBzY2lOYW1lUG9zdGZpeCA9IFwiIChcIiArIHNjaU5hbWUgKyBcIilcIjtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihjbkluZGV4LCBjbikge1xuICAgICAgICAgICAgICByZXR1cm4gc3BlY2llc0xvb2t1cExpc3QucHVzaCh7XG4gICAgICAgICAgICAgICAgbGFiZWw6IGNuICsgc2NpTmFtZVBvc3RmaXgsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHNjaU5hbWVcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH07XG4gICAgICAgICAgJC5lYWNoKGRhdGEsIGZ1bmN0aW9uKHNjaU5hbWUsIGNvbW1vbk5hbWVzKSB7XG4gICAgICAgICAgICBzcGVjaWVzU2NpTmFtZUxpc3QucHVzaChzY2lOYW1lKTtcbiAgICAgICAgICAgIGlmIChjb21tb25OYW1lcykge1xuICAgICAgICAgICAgICByZXR1cm4gJC5lYWNoKGNvbW1vbk5hbWVzLCBjb21tb25OYW1lV3JpdGVyKHNjaU5hbWUpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiBzcGVjaWVzTG9va3VwTGlzdC5wdXNoKHtcbiAgICAgICAgICAgICAgICBsYWJlbDogc2NpTmFtZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogc2NpTmFtZVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICBfdGhpcy5zcGVjaWVzTG9va3VwTGlzdCA9IHNwZWNpZXNMb29rdXBMaXN0O1xuICAgICAgICAgIHJldHVybiBfdGhpcy5zcGVjaWVzU2NpTmFtZUxpc3QgPSBzcGVjaWVzU2NpTmFtZUxpc3Q7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgfSxcbiAgICBidWlsZExlZnRGb3JtOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmJ1aWxkTGVmdEZvcm0nKTtcbiAgICAgIHJldHVybiB0aGlzLnNwZWNpZXNJbmZvRmV0Y2hQcm9jZXNzLmRvbmUoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgJGxlZnRtYXBzcHA7XG4gICAgICAgICAgJGxlZnRtYXBzcHAgPSBfdGhpcy4kKCcjbGVmdG1hcHNwcCcpO1xuICAgICAgICAgIHJldHVybiAkbGVmdG1hcHNwcC5hdXRvY29tcGxldGUoe1xuICAgICAgICAgICAgc291cmNlOiBfdGhpcy5zcGVjaWVzTG9va3VwTGlzdCxcbiAgICAgICAgICAgIGFwcGVuZFRvOiBfdGhpcy4kZWwsXG4gICAgICAgICAgICBjbG9zZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBfdGhpcy4kZWwudHJpZ2dlcignbGVmdG1hcHVwZGF0ZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH0sXG4gICAgYnVpbGRSaWdodEZvcm06IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYnVpbGRSaWdodEZvcm0nKTtcbiAgICAgIHJldHVybiB0aGlzLnNwZWNpZXNJbmZvRmV0Y2hQcm9jZXNzLmRvbmUoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgJHJpZ2h0bWFwc3BwO1xuICAgICAgICAgICRyaWdodG1hcHNwcCA9IF90aGlzLiQoJyNyaWdodG1hcHNwcCcpO1xuICAgICAgICAgIHJldHVybiAkcmlnaHRtYXBzcHAuYXV0b2NvbXBsZXRlKHtcbiAgICAgICAgICAgIHNvdXJjZTogX3RoaXMuc3BlY2llc0xvb2t1cExpc3QsXG4gICAgICAgICAgICBhcHBlbmRUbzogX3RoaXMuJGVsLFxuICAgICAgICAgICAgY2xvc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuJGVsLnRyaWdnZXIoJ3JpZ2h0bWFwdXBkYXRlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgfSxcbiAgICBzdGFydFNwbGl0dGVyVHJhY2tpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuc3RhcnRTcGxpdHRlclRyYWNraW5nJyk7XG4gICAgICB0aGlzLnRyYWNrU3BsaXR0ZXIgPSB0cnVlO1xuICAgICAgdGhpcy5zcGxpdExpbmUuYWRkQ2xhc3MoJ2RyYWdnaW5nJyk7XG4gICAgICByZXR1cm4gdGhpcy5sb2NhdGVTcGxpdHRlcigpO1xuICAgIH0sXG4gICAgbG9jYXRlU3BsaXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcubG9jYXRlU3BsaXR0ZXInKTtcbiAgICAgIGlmICh0aGlzLnRyYWNrU3BsaXR0ZXIpIHtcbiAgICAgICAgdGhpcy5yZXNpemVUaGluZ3MoKTtcbiAgICAgICAgaWYgKHRoaXMudHJhY2tTcGxpdHRlciA9PT0gMCkge1xuICAgICAgICAgIHRoaXMudHJhY2tTcGxpdHRlciA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMudHJhY2tTcGxpdHRlciAhPT0gdHJ1ZSkge1xuICAgICAgICAgIHRoaXMudHJhY2tTcGxpdHRlciAtPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KHRoaXMubG9jYXRlU3BsaXR0ZXIsIHRoaXMudHJhY2tQZXJpb2QpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVzaXplVGhpbmdzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciAkbWFwQm94LCBib3R0b21SaWdodCwgbGF5ZXJCb3R0b20sIGxheWVyVG9wLCBsZWZ0TGVmdCwgbGVmdE1hcCwgbWFwQm91bmRzLCBtYXBCb3gsIG5ld0xlZnRXaWR0aCwgcmlnaHRNYXAsIHJpZ2h0UmlnaHQsIHNwbGl0UG9pbnQsIHNwbGl0WCwgdG9wTGVmdDtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnJlc2l6ZVRoaW5ncycpO1xuICAgICAgaWYgKHRoaXMubGVmdExheWVyKSB7XG4gICAgICAgIGxlZnRNYXAgPSAkKHRoaXMubGVmdExheWVyLmdldENvbnRhaW5lcigpKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnJpZ2h0TGF5ZXIpIHtcbiAgICAgICAgcmlnaHRNYXAgPSAkKHRoaXMucmlnaHRMYXllci5nZXRDb250YWluZXIoKSk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy4kZWwuaGFzQ2xhc3MoJ3NwbGl0JykpIHtcbiAgICAgICAgbmV3TGVmdFdpZHRoID0gdGhpcy5zcGxpdFRodW1iLnBvc2l0aW9uKCkubGVmdCArICh0aGlzLnNwbGl0VGh1bWIud2lkdGgoKSAvIDIuMCk7XG4gICAgICAgIG1hcEJveCA9IHRoaXMubWFwLmdldENvbnRhaW5lcigpO1xuICAgICAgICAkbWFwQm94ID0gJChtYXBCb3gpO1xuICAgICAgICBtYXBCb3VuZHMgPSBtYXBCb3guZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHRvcExlZnQgPSB0aGlzLm1hcC5jb250YWluZXJQb2ludFRvTGF5ZXJQb2ludChbMCwgMF0pO1xuICAgICAgICBzcGxpdFBvaW50ID0gdGhpcy5tYXAuY29udGFpbmVyUG9pbnRUb0xheWVyUG9pbnQoW25ld0xlZnRXaWR0aCwgMF0pO1xuICAgICAgICBib3R0b21SaWdodCA9IHRoaXMubWFwLmNvbnRhaW5lclBvaW50VG9MYXllclBvaW50KFskbWFwQm94LndpZHRoKCksICRtYXBCb3guaGVpZ2h0KCldKTtcbiAgICAgICAgbGF5ZXJUb3AgPSB0b3BMZWZ0Lnk7XG4gICAgICAgIGxheWVyQm90dG9tID0gYm90dG9tUmlnaHQueTtcbiAgICAgICAgc3BsaXRYID0gc3BsaXRQb2ludC54IC0gbWFwQm91bmRzLmxlZnQ7XG4gICAgICAgIGxlZnRMZWZ0ID0gdG9wTGVmdC54IC0gbWFwQm91bmRzLmxlZnQ7XG4gICAgICAgIHJpZ2h0UmlnaHQgPSBib3R0b21SaWdodC54O1xuICAgICAgICB0aGlzLnNwbGl0TGluZS5jc3MoJ2xlZnQnLCBuZXdMZWZ0V2lkdGgpO1xuICAgICAgICB0aGlzLmxlZnRUYWcuYXR0cignc3R5bGUnLCBcImNsaXA6IHJlY3QoMCwgXCIgKyBuZXdMZWZ0V2lkdGggKyBcInB4LCBhdXRvLCAwKVwiKTtcbiAgICAgICAgaWYgKHRoaXMubGVmdExheWVyKSB7XG4gICAgICAgICAgbGVmdE1hcC5hdHRyKCdzdHlsZScsIFwiY2xpcDogcmVjdChcIiArIGxheWVyVG9wICsgXCJweCwgXCIgKyBzcGxpdFggKyBcInB4LCBcIiArIGxheWVyQm90dG9tICsgXCJweCwgXCIgKyBsZWZ0TGVmdCArIFwicHgpXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnJpZ2h0TGF5ZXIpIHtcbiAgICAgICAgICByZXR1cm4gcmlnaHRNYXAuYXR0cignc3R5bGUnLCBcImNsaXA6IHJlY3QoXCIgKyBsYXllclRvcCArIFwicHgsIFwiICsgcmlnaHRSaWdodCArIFwicHgsIFwiICsgbGF5ZXJCb3R0b20gKyBcInB4LCBcIiArIHNwbGl0WCArIFwicHgpXCIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxlZnRUYWcuYXR0cignc3R5bGUnLCAnY2xpcDogaW5oZXJpdCcpO1xuICAgICAgICBpZiAodGhpcy5sZWZ0TGF5ZXIpIHtcbiAgICAgICAgICBsZWZ0TWFwLmF0dHIoJ3N0eWxlJywgJ2NsaXA6IGluaGVyaXQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5yaWdodExheWVyKSB7XG4gICAgICAgICAgcmV0dXJuIHJpZ2h0TWFwLmF0dHIoJ3N0eWxlJywgJ2NsaXA6IHJlY3QoMCwwLDAsMCknKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgc3RvcFNwbGl0dGVyVHJhY2tpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuc3RvcFNwbGl0dGVyVHJhY2tpbmcnKTtcbiAgICAgIHRoaXMuc3BsaXRMaW5lLnJlbW92ZUNsYXNzKCdkcmFnZ2luZycpO1xuICAgICAgcmV0dXJuIHRoaXMudHJhY2tTcGxpdHRlciA9IDU7XG4gICAgfSxcbiAgICBhY3RpdmF0ZVNwbGl0dGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmFjdGl2YXRlU3BsaXR0ZXInKTtcbiAgICAgIHRoaXMuc3BsaXRUaHVtYi5kcmFnZ2FibGUoe1xuICAgICAgICBjb250YWlubWVudDogJCgnI21hcHdyYXBwZXInKSxcbiAgICAgICAgc2Nyb2xsOiBmYWxzZSxcbiAgICAgICAgc3RhcnQ6IHRoaXMuc3RhcnRTcGxpdHRlclRyYWNraW5nLFxuICAgICAgICBkcmFnOiB0aGlzLnJlc2l6ZVRoaW5ncyxcbiAgICAgICAgc3RvcDogdGhpcy5zdG9wU3BsaXR0ZXJUcmFja2luZ1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcy5yZXNpemVUaGluZ3MoKTtcbiAgICB9LFxuICAgIGRlYWN0aXZhdGVTcGxpdHRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5kZWFjdGl2YXRlU3BsaXR0ZXInKTtcbiAgICAgIHRoaXMuc3BsaXRUaHVtYi5kcmFnZ2FibGUoJ2Rlc3Ryb3knKTtcbiAgICAgIHJldHVybiB0aGlzLnJlc2l6ZVRoaW5ncygpO1xuICAgIH1cbiAgfSwge1xuICAgIHRlbXBsYXRlczoge1xuICAgICAgbGF5b3V0OiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwic3BsaXRsaW5lXFxcIj4mbmJzcDs8L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJzcGxpdHRodW1iXFxcIj48c3Bhbj4mI3gyNzZlOyAmI3gyNzZmOzwvc3Bhbj48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJsZWZ0IHRhZ1xcXCI+PCU9IGxlZnRUYWcgJT48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJyaWdodCB0YWdcXFwiPjwlPSByaWdodFRhZyAlPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcImxlZnQgZm9ybVxcXCI+PCU9IGxlZnRGb3JtICU+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwicmlnaHQgZm9ybVxcXCI+PCU9IHJpZ2h0Rm9ybSAlPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcImxlZnQgbG9hZGVyXFxcIj48aW1nIHNyYz1cXFwiL3N0YXRpYy9pbWFnZXMvc3Bpbm5lci5sb2FkaW5mby5uZXQuZ2lmXFxcIiAvPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcInJpZ2h0IGxvYWRlclxcXCI+PGltZyBzcmM9XFxcIi9zdGF0aWMvaW1hZ2VzL3NwaW5uZXIubG9hZGluZm8ubmV0LmdpZlxcXCIgLz48L2Rpdj5cXG48ZGl2IGlkPVxcXCJtYXB3cmFwcGVyXFxcIj48ZGl2IGlkPVxcXCJtYXBcXFwiPjwvZGl2PjwvZGl2PlwiKSxcbiAgICAgIGxlZnRUYWc6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXNzPVxcXCJzaG93XFxcIj5cXG4gICAgPHNwYW4gY2xhc3M9XFxcImxlZnRsYXllcm5hbWVcXFwiPnBsYWluIG1hcDwvc3Bhbj5cXG4gICAgPGJyPlxcbiAgICA8YnV0dG9uIGNsYXNzPVxcXCJidG4tY2hhbmdlXFxcIj5zZXR0aW5nczwvYnV0dG9uPlxcbiAgICA8YnV0dG9uIGNsYXNzPVxcXCJidG4tY29tcGFyZVxcXCI+c2hvdy9oaWRlIGNvbXBhcmlzb24gbWFwPC9idXR0b24+XFxuPC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwiZWRpdFxcXCI+XFxuICAgIDxpbnB1dCBpZD1cXFwibGVmdG1hcHNwcFxcXCIgbmFtZT1cXFwibGVmdG1hcHNwcFxcXCIgcGxhY2Vob2xkZXI9XFxcIiZoZWxsaXA7IHNwZWNpZXMgb3IgZ3JvdXAgJmhlbGxpcDtcXFwiIC8+XFxuICAgIDwhLS1cXG4gICAgPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNoYW5nZVxcXCI+aGlkZSBzZXR0aW5nczwvYnV0dG9uPlxcbiAgICA8YnV0dG9uIGNsYXNzPVxcXCJidG4tY29tcGFyZVxcXCI+Y29tcGFyZSArLy08L2J1dHRvbj5cXG4gICAgLS0+XFxuPC9kaXY+XCIpLFxuICAgICAgcmlnaHRUYWc6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXNzPVxcXCJzaG93XFxcIj5cXG4gICAgPHNwYW4gY2xhc3M9XFxcInJpZ2h0bGF5ZXJuYW1lXFxcIj4obm8gZGlzdHJpYnV0aW9uKTwvc3Bhbj5cXG4gICAgPGJyPlxcbiAgICA8YnV0dG9uIGNsYXNzPVxcXCJidG4tY2hhbmdlXFxcIj5zZXR0aW5nczwvYnV0dG9uPlxcbiAgICA8YnV0dG9uIGNsYXNzPVxcXCJidG4tY29tcGFyZVxcXCI+c2hvdy9oaWRlIGNvbXBhcmlzb24gbWFwPC9idXR0b24+XFxuPC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwiZWRpdFxcXCI+XFxuICAgIDxpbnB1dCBpZD1cXFwicmlnaHRtYXBzcHBcXFwiIG5hbWU9XFxcInJpZ2h0bWFwc3BwXFxcIiBwbGFjZWhvbGRlcj1cXFwiJmhlbGxpcDsgc3BlY2llcyBvciBncm91cCAmaGVsbGlwO1xcXCIgLz5cXG48L2Rpdj5cIiksXG4gICAgICBsZWZ0Rm9ybTogXy50ZW1wbGF0ZShcIjxwPlxcbjxidXR0b24gY2xhc3M9XFxcImJ0bi1jb3B5LXJ0bFxcXCI+Y29weSByaWdodCBtYXAgJmxhcXVvOzwvYnV0dG9uPlxcbjwvcD48cD5cXG48c2VsZWN0IGNsYXNzPVxcXCJsZWZ0XFxcIiBpZD1cXFwibGVmdG1hcHllYXJcXFwiPlxcbiAgICA8b3B0aW9uIHZhbHVlPVxcXCJiYXNlbGluZVxcXCI+YmFzZWxpbmU8L29wdGlvbj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwiMjAxNVxcXCI+MjAxNTwvb3B0aW9uPlxcbiAgICA8b3B0aW9uIHZhbHVlPVxcXCIyMDM1XFxcIj4yMDM1PC9vcHRpb24+XFxuICAgIDxvcHRpb24gdmFsdWU9XFxcIjIwNTVcXFwiPjIwNTU8L29wdGlvbj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwiMjA3NVxcXCI+MjA3NTwvb3B0aW9uPlxcbjwvc2VsZWN0PlxcbjwvcD48cD5cXG48c2VsZWN0IGNsYXNzPVxcXCJsZWZ0XFxcIiBpZD1cXFwibGVmdG1hcHNjZW5hcmlvXFxcIj5cXG4gICAgPG9wdGlvbj5SQ1AzUEQ8L29wdGlvbj5cXG4gICAgPG9wdGlvbj5SQ1A2PC9vcHRpb24+XFxuPC9zZWxlY3Q+XFxuPC9wPjxwPlxcbjxzZWxlY3QgY2xhc3M9XFxcImxlZnRcXFwiIGlkPVxcXCJsZWZ0bWFwZ2NtXFxcIj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwiYWxsXFxcIj5tZWRpYW48L29wdGlvbj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwiY3Npcm8tbWszMFxcXCI+Q1NJUk8gTWFyayAzLjA8L29wdGlvbj5cXG48L3NlbGVjdD5cXG48L3A+PHA+XFxuPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNoYW5nZVxcXCI+aGlkZSBzZXR0aW5nczwvYnV0dG9uPlxcbjwvcD48cD5cXG48YnV0dG9uIGNsYXNzPVxcXCJidG4tY29tcGFyZVxcXCI+Y29tcGFyZSArLy08L2J1dHRvbj5cXG48L3A+XCIpLFxuICAgICAgcmlnaHRGb3JtOiBfLnRlbXBsYXRlKFwiPHA+XFxuPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNvcHktbHRyXFxcIj4mcmFxdW87IGNvcHkgbGVmdCBtYXA8L2J1dHRvbj5cXG48L3A+PHA+XFxuPHNlbGVjdCBjbGFzcz1cXFwicmlnaHRcXFwiIGlkPVxcXCJyaWdodG1hcHllYXJcXFwiPlxcbiAgICA8b3B0aW9uIHZhbHVlPVxcXCJiYXNlbGluZVxcXCI+YmFzZWxpbmU8L29wdGlvbj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwiMjAxNVxcXCI+MjAxNTwvb3B0aW9uPlxcbiAgICA8b3B0aW9uIHZhbHVlPVxcXCIyMDM1XFxcIj4yMDM1PC9vcHRpb24+XFxuICAgIDxvcHRpb24gdmFsdWU9XFxcIjIwNTVcXFwiPjIwNTU8L29wdGlvbj5cXG4gICAgPG9wdGlvbiB2YWx1ZT1cXFwiMjA3NVxcXCI+MjA3NTwvb3B0aW9uPlxcbjwvc2VsZWN0PlxcbjwvcD48cD5cXG48c2VsZWN0IGNsYXNzPVxcXCJyaWdodFxcXCIgaWQ9XFxcInJpZ2h0bWFwc2NlbmFyaW9cXFwiPlxcbiAgICA8b3B0aW9uPlJDUDNQRDwvb3B0aW9uPlxcbiAgICA8b3B0aW9uPlJDUDY8L29wdGlvbj5cXG48L3NlbGVjdD5cXG48L3A+PHA+XFxuPHNlbGVjdCBjbGFzcz1cXFwicmlnaHRcXFwiIGlkPVxcXCJyaWdodG1hcGdjbVxcXCI+XFxuICAgIDxvcHRpb24gdmFsdWU9XFxcImFsbFxcXCI+bWVkaWFuPC9vcHRpb24+XFxuICAgIDxvcHRpb24gdmFsdWU9XFxcImNzaXJvLW1rMzBcXFwiPkNTSVJPIE1hcmsgMy4wPC9vcHRpb24+XFxuPC9zZWxlY3Q+XFxuPC9wPjxwPlxcbjxidXR0b24gY2xhc3M9XFxcImJ0bi1jaGFuZ2VcXFwiPmhpZGUgc2V0dGluZ3M8L2J1dHRvbj5cXG48L3A+PHA+XFxuPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNvbXBhcmVcXFwiPmNvbXBhcmUgKy8tPC9idXR0b24+XFxuPC9wPlwiKVxuICAgIH1cbiAgfSk7XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBBcHBWaWV3O1xuXG59KS5jYWxsKHRoaXMpO1xuIl19
